const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const File = require('../models/File');
const bcrypt = require('bcryptjs');

const router = express.Router();

// AWS S3 setup
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/upload', upload.single('file'), async (req, res) => {
  const { password, owner } = req.body;

  try {
    const key = `${Date.now()}_${req.file.originalname}`;
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: req.file.buffer,
    };

    const uploadResult = await s3.upload(params).promise();
    const passwordHash = password ? await bcrypt.hash(password, 10) : undefined;

    const file = new File({
      filename: req.file.originalname,
      key,
      owner,
      passwordHash,
    });

    await file.save();
    res.status(201).json({ message: 'File uploaded successfully', url: uploadResult.Location });
  } catch (err) {
    res.status(500).json({ error: 'File upload failed' });
  }
});

module.exports = router;
