import express from 'express';
import { getGithubProfile, connectGithub, disconnectGithub } from '../controllers/githubController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/profile', getGithubProfile);
router.post('/connect', connectGithub);
router.delete('/disconnect', disconnectGithub);

export default router;
