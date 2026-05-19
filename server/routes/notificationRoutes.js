import express from 'express';
import { getNotifications, markAsRead, createNotification } from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getNotifications);
router.put('/:id/read', markAsRead);
router.post('/', createNotification);

export default router;
