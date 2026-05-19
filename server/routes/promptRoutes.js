import express from 'express';
import { getPrompts, createPrompt, toggleFavoritePrompt, togglePublicPrompt, updatePrompt, deletePrompt } from '../controllers/promptController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getPrompts);
router.post('/', createPrompt);
router.put('/:id/favorite', toggleFavoritePrompt);
router.put('/:id/visibility', togglePublicPrompt);
router.put('/:id', updatePrompt);
router.delete('/:id', deletePrompt);

export default router;
