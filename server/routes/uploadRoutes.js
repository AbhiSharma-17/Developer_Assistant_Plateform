import express from 'express';
import { uploadFile, getFiles, deleteFile } from '../controllers/uploadController.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', upload.single('file'), uploadFile);
router.get('/', getFiles);
router.delete('/:id', deleteFile);

export default router;
