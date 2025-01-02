const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
    filename: String,
    path: String,
    mimetype: String,
    size: Number,
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('File', FileSchema);
