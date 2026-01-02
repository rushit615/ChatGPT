const userModel = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')

async function registerUser(req, res) {
console.log(req.body); 
     const { fullname: { firstname, lastname }, email, password } = req.body;

        // Check if user already exists
        const existingUser = await userModel.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

const user = await userModel.create({
    fullname: {
        firstname,
        lastname
    },
    email,
    password: await bcrypt.hash(password, 10)
});

const token = jwt.sign({id:user._id},process.env.JWT_SECRET)

res.cookie("token",token)

res.status(201).json({ message: 'User registered successfully', user });
}

async function loginUser(req, res) {

const { email, password } = req.body;

const user = await userModel.findOne({ email });

if (!user) {
    return res.status(400).json({ message: 'Invalid email or password' });
}

const isPasswordValid = await bcrypt.compare(password, user.password);

if (!isPasswordValid) {
    return res.status(400).json({ message: 'Invalid email or password' });
}

const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

req.user = user;

res.cookie("token", token);



res.status(200).json({ message: 'Login successful',user });
}

module.exports = {
    registerUser,
    loginUser
};