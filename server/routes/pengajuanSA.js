const express = require('express');
const multer = require('multer');
const path = require('path');
const pengajuanSAController = require('../controllers/pengajuanSAController');

const router = express.Router();

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images (JPEG, JPG, PNG) and PDF files are allowed'));
    }
  }
});

// Routes - specific routes before dynamic ones
router.get('/mahasiswa/:mahasiswaId', pengajuanSAController.getPengajuanSAByMahasiswa);
router.get('/', pengajuanSAController.getAllPengajuanSA);
router.post('/', upload.single('buktiPembayaran'), pengajuanSAController.createPengajuanSA);
router.put('/:id/status', pengajuanSAController.updateStatusPengajuanSA);
router.put('/:id/nilai', pengajuanSAController.updateNilaiPengajuanSA);

module.exports = router;