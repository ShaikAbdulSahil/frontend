const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');

// Load environment variables
// dotenv.config();

// Initialize express app
const app = express();

// Middleware to parse JSON and URL-encoded form data
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files from the frontend folder
// app.use(express.static(path.join(__dirname, '../frontend')));

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/BakeIt", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

// User schema for MongoDB
const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobileNumber: { type: String, required: true },
    password: { type: String, required: true }
});

// Hash the password before saving the user
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

const User = mongoose.model('User', userSchema);

// JWT token generation
const generateToken = (user) => {
    return jwt.sign({ id: user._id, email: user.email }, 'ourbakery', { expiresIn: '1h' });
};

// Routes

// Sign Up Route
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { fullName, email, mobileNumber, password } = req.body;

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create a new user
        const user = new User({ fullName, email, mobileNumber, password });
        await user.save();

        // Send success response
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Sign In Route
app.post('/api/auth/signin', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Check if the password matches
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = generateToken(user);

        // Send response with token
        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Protected Menu Route
app.get('/api/menu', (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, 'ourbakery');
        res.status(200).json({ message: `Welcome to the menu page, user: ${decoded.email}` });
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

// Fallback route to serve index.html for unknown routes
// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, '../frontend/pages/index.html'));
// });

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
