import express from 'express';
import { getProjects, createProject, updateProject, deleteProject, inviteMember } from '../controllers/projectController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getProjects);
router.post('/', createProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);
router.post('/:id/invite', inviteMember);

export default router;
