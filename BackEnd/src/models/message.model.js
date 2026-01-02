const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
        required: true
    },
    content: {
        type: String,
        required: true
    }
    , role: {
        type: String,
        enum: ['user', 'model'],
        required: true
    }

}, {
    timestamps: true

})
const messageModel = mongoose.model('message', messageSchema);

module.exports = messageModel;