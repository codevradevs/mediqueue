const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middleware/auth');
const {
  createHospital, getHospitals, getHospital, updateHospital, getHospitalStats,
} = require('./hospital.controller');

router.get('/', getHospitals);
router.get('/:id', getHospital);
router.get('/:id/stats', protect, authorize('admin', 'super_admin'), getHospitalStats);
router.post('/', protect, authorize('super_admin'), createHospital);
router.put('/:id', protect, authorize('admin', 'super_admin'), updateHospital);

module.exports = router;
