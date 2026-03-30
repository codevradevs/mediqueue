const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middleware/auth');
const {
  createDepartment, getDepartmentsByHospital, updateDepartment, deleteDepartment,
} = require('./department.controller');

router.get('/hospital/:hospitalId', getDepartmentsByHospital);
router.post('/', protect, authorize('admin', 'super_admin'), createDepartment);
router.put('/:id', protect, authorize('admin', 'super_admin'), updateDepartment);
router.delete('/:id', protect, authorize('admin', 'super_admin'), deleteDepartment);

module.exports = router;
