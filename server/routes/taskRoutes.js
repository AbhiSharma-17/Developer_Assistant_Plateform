import express from 'express';
import { getTasks, createTask, updateTaskStatus, updateTask, deleteTask, getTaskComments, addTaskComment } from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id/status', updateTaskStatus);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.get('/:id/comments', getTaskComments);
router.post('/:id/comments', addTaskComment);

export default router;
