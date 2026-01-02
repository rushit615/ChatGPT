const { Server } = require('socket.io');
const { generateResponse, generateVectors } = require('../services/ai.services.js');
const messageModel = require('../models/message.model.js');
const cookie = require('cookie');
const jwt = require('jsonwebtoken');
const { createMemory, queryMemory } = require('../services/vector.services.js')
const userModel = require('../models/user.model.js');


function initSocketServer(httpServer) {

    const io = new Server(httpServer, {
        cors: {
            origin: "http://localhost:5173",
            allowedHeaders: [ "Content-Type", "Authorization" ],
            credentials: true
        }
    })

    //Authentication Middleware

    io.use(async (socket, next) => {
        const cookies = cookie.parse(socket.handshake.headers?.cookie || "")

        if (!cookies.token) {
            next(new Error("Authentication error: No token provided"))
        }
        try {

            const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET)

            const user = await userModel.findById(decoded.id)

            socket.user = user

            next()

        } catch (err) {
            next(new Error("Authentication error:Invalid token"))
        }

    })

    //Socket connection event

    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        socket.on('ai-message', async (data) => {


            const message = await messageModel.create({
                chat: data.chat,
                user: socket.user._id,
                content: data.content,
                role: 'user'
            })
            const vectors = await generateVectors(data.content)
            const memory = await queryMemory({
                queryVector: vectors,
                limit: 3,
                metadata: {
                    user: socket.user._id
                }

            })
            await createMemory({
                vectors,
                messageId: message._id,
                metadata: {
                    chat: data.chat,
                    user: socket.user._id,
                    text: data.content
                }

            })
            console.log(memory)
            console.log(data)
            const chatHistory = (await messageModel.find({ chat: data.chat }).sort({ createdAt: -1 }).limit(3).lean()).reverse()

            const stm = chatHistory.map(msg=>{
                return{
                    role:msg.role,
                    parts:[{text:msg.content}]
                }
            })

            const ltm = [
                {
                    role: "user",
                    parts: [ {
                        text: `

                        these are some previous messages from the chat, use them to generate a response

                        ${memory.map(item => item.metadata.text).join("\n")}
                        
                        ` } ]
                }
            ]
            const aiResponse = await generateResponse([...ltm, ...stm])

            const responseMessage = await messageModel.create({
                chat: data.chat,
                user: socket.user._id,
                content: aiResponse,
                role: 'model'
            })
            socket.emit('ai-response', aiResponse);
            const responseVectors = await generateVectors(aiResponse);
            await createMemory({
                vectors: responseVectors,
                messageId: responseMessage._id,
                metadata: {
                    chat: data.chat,
                    user: socket.user._id,
                    text: aiResponse
                }
            })
        })

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    }
    );
}
module.exports = initSocketServer;