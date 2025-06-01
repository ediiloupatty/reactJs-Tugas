const express = require('express');
const multer = require('multer');
const dosenController = require('../controllers/dosenController');

const router = express.Router();
const upload = multer();

// Routes
router.get('/', dosenController.getAllDosen);
router.get('/:id', dosenController.getDosenById);
router.post('/', upload.none(), dosenController.createDosen);
router.put('/:id', dosenController.updateDosen);
router.delete('/:id', dosenController.deleteDosen);

module.exports = router;