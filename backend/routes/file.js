const express = require('express');
const multer = require('multer');
const File = require('../models/File');
const router = express.Router();
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({ storage });

// Upload files
router.post('/upload', upload.array('files', 10), async (req, res) => {
    const { userId } = req.body;
    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        const files = req.files.map(file => ({
            filename: file.filename,
            path: file.path,
            uploadedBy: userId,
        }));

        await File.insertMany(files);
        res.status(200).json({ message: 'Files uploaded successfully' });
    } catch (error) {
        res.status(500).json({ error: 'File upload failed' });
    }
});

// Fetch files by user ID
router.get('/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const files = await File.find({ uploadedBy: userId });
        res.status(200).json(files);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch files' });
    }
});

module.exports = router;
