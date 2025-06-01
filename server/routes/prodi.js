const express = require('express');
const {
  getAllProdi,
  getProdiById,
  createProdi,
  updateProdi,
  deleteProdi,
  getProdiStats,
  searchProdi
} = require('../controllers/prodiController');

const router = express.Router();

// Routes - ordered by priority (specific routes before dynamic ones)
router.get('/stats', getProdiStats);
router.get('/search', searchProdi);
router.get('/', getAllProdi);
router.get('/:id', getProdiById);
router.post('/', createProdi);
router.put('/:id', updateProdi);
router.delete('/:id', deleteProdi);

module.exports = router;