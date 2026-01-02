const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
//ROUTES
const authRoutes =  require('./routes/auth.route')
const chatRoutes =  require('./routes/chat.route')

const app = express();

// CORS configuration


app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/auth',authRoutes);
app.use('/api/chat',chatRoutes);

app.get("*name", (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

module.exports = app;