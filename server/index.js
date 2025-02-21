require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const allowedOrigins = [
    "https://h-two-iota.vercel.app",
    "http://localhost:3000"
];

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');

const app = express();
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.log("❌ MongoDB Connection Error: ", err));

app.get('/', (req, res) => {
    res.send("🚀 Welcome to the API! Server is running.");
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/posts', commentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));