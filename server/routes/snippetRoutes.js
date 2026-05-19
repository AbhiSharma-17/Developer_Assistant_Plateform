import express from 'express';
import { getSnippets, createSnippet, toggleFavoriteSnippet, updateSnippet, deleteSnippet } from '../controllers/snippetController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getSnippets);
router.post('/', createSnippet);
router.put('/:id/favorite', toggleFavoriteSnippet);
router.put('/:id', updateSnippet);
router.delete('/:id', deleteSnippet);

export default router;
