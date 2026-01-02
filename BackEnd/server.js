require('dotenv').config();
const app = require('./src/app.js');
const connectDB = require('./src/db/db.js');
const httpServer = require('http').createServer(app);
const initSocketServer = require('./src/socket/socket.server.js');



connectDB();
initSocketServer(httpServer);




httpServer.listen(3000, () => {
  console.log('Server is running on port 3000');
}); 