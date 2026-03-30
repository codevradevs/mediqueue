const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middleware/auth');
const {
  getQueuesByHospital, getQueueByDepartment, updateQueue, setQueueStatus, resetDailyQueues,
} = require('./queue.controller');

router.get('/hospital/:hospitalId', getQueuesByHospital);
router.get('/department/:departmentId', getQueueByDepartment);
router.patch('/department/:departmentId/update', protect, authorize('admin', 'super_admin'), updateQueue);
router.patch('/department/:departmentId/status', protect, authorize('admin', 'super_admin'), setQueueStatus);
router.post('/hospital/:hospitalId/reset', protect, authorize('admin', 'super_admin'), resetDailyQueues);

module.exports = router;
