const express = require('express');
const multer = require('multer');
const mahasiswaController = require('../controllers/mahasiswaController');

const router = express.Router();
const upload = multer();

// Middleware for logging requests (development only)
if (process.env.NODE_ENV === 'development') {
  router.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`, {
      body: req.body,
      params: req.params,
      query: req.query
    });
    next();
  });
}

// Body parsing middleware
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Routes
router.get('/', mahasiswaController.getAllMahasiswa);
router.get('/:id', mahasiswaController.getMahasiswaById);
router.post('/', upload.none(), mahasiswaController.createMahasiswa);
router.put('/:id', upload.none(), mahasiswaController.updateMahasiswa);
router.delete('/:id', mahasiswaController.deleteMahasiswa);

module.exports = router;
