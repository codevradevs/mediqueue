const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middleware/auth');
const {
  createBooking, getMyBookings, getHospitalBookings, getTodayBookings,
  cancelBooking, updateBookingStatus,
} = require('./booking.controller');

router.post('/', protect, authorize('patient'), createBooking);
router.get('/my-bookings', protect, authorize('patient'), getMyBookings);
router.get('/hospital/:hospitalId', protect, authorize('admin', 'super_admin'), getHospitalBookings);
router.get('/hospital/:hospitalId/today', protect, authorize('admin', 'super_admin'), getTodayBookings);
router.patch('/:id/cancel', protect, cancelBooking);
router.patch('/:id/status', protect, authorize('admin', 'super_admin'), updateBookingStatus);

module.exports = router;
