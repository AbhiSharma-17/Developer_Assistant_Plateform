import express from 'express';
import { getActivityLogs, logActivityEvent } from '../controllers/activityController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getActivityLogs);
router.post('/', logActivityEvent);

export default router;
