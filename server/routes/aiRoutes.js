import express from 'express';
import { generateAiResponse } from '../controllers/aiController.js';
import { softProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Use softProtect so AI works even in demo mode (no DB / no JWT)
router.use(softProtect);

router.post('/generate', generateAiResponse);

export default router;
