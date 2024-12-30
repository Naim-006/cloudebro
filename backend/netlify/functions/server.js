const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


mongoose.connect('mongodb+srv://naimbro:bro123@cluster0.2y0fz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected!'))
  .catch((err) => console.error('MongoDB connection error:', err));

const fileSchema = new mongoose.Schema({
  email: String,
  filename: String,
  fileType: String,
});

const File = mongoose.model('File', fileSchema);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});

const upload = multer({ storage });

app.post('/upload', upload.single('file'), async (req, res) => {
  const { email } = req.body;
  if (!email || !req.file) {
    return res.status(400).json({ message: 'Invalid request!' });
  }

  const file = new File({
    email,
    filename: req.file.filename,
    fileType: req.file.mimetype,
  });

  try {
    await file.save();
    res.json({ message: 'File uploaded successfully!' });
  } catch (error) {
    console.error('Error saving file:', error);
    res.status(500).json({ message: 'File upload failed!' });
  }
});

app.get('/files', async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ message: 'Email is required!' });
  }

  try {
    const files = await File.find({ email });
    res.json(files);
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ message: 'Failed to retrieve files!' });
  }
});

app.listen(5000, () => console.log('Server running on port 5000!'));
