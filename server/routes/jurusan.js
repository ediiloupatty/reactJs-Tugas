const express = require('express');
const jurusanController = require('../controllers/jurusanController');

const router = express.Router();

// Routes - ordered by priority (specific routes before dynamic ones)
router.get('/search', jurusanController.searchJurusan);
router.get('/stats', jurusanController.getJurusanStats);
router.get('/', jurusanController.getAllJurusan);
router.get('/:id', jurusanController.getJurusanById);
router.post('/', jurusanController.createJurusan);
router.put('/:id', jurusanController.updateJurusan);
router.delete('/:id', jurusanController.deleteJurusan);

module.exports = router;