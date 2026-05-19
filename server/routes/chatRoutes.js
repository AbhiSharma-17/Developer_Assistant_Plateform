import express from 'express';
import { getTeams, createTeam, getTeamMessages } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/teams', getTeams);
router.post('/teams', createTeam);
router.get('/teams/:teamId/messages', getTeamMessages);

export default router;
