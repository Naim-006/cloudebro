const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');


// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'https://clouderbro.netlify.app/', // Use specific domains in production
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded files statically

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI || 'your-default-mongo-uri', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit process with error code
  });

// Routes
const authRoutes = require('./routes/auth'); // Ensure these files exist
const fileRoutes = require('./routes/file');

app.use('/auth', authRoutes);
app.use('/files', fileRoutes);

// Health Check Route (for Render/Glitch)
app.get('/', (req, res) => {
  res.status(200).json({ status: 'Backend is running', uptime: process.uptime() });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
