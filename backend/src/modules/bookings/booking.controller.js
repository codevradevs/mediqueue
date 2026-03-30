const Booking = require('./booking.model');
const Department = require('../departments/department.model');
const Queue = require('../queues/queue.model');

exports.createBooking = async (req, res, next) => {
  try {
    const { hospitalId, departmentId, scheduledTime, notes, symptoms } = req.body;

    const dept = await Department.findById(departmentId);
    if (!dept) return res.status(404).json({ success: false, message: 'Department not found' });

    // Get next queue number for the day
    const startOfDay = new Date(scheduledTime);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(scheduledTime);
    endOfDay.setHours(23, 59, 59, 999);

    const todayCount = await Booking.countDocuments({
      departmentId,
      scheduledTime: { $gte: startOfDay, $lte: endOfDay },
      status: { $nin: ['cancelled'] },
    });

    const booking = await Booking.create({
      userId: req.user._id,
      hospitalId,
      departmentId,
      scheduledTime: new Date(scheduledTime),
      queueNumber: todayCount + 1,
      notes,
      symptoms,
      status: 'confirmed',
    });

    const populated = await Booking.findById(booking._id)
      .populate('hospitalId', 'name location contact')
      .populate('departmentId', 'name avgServiceTime');

    res.status(201).json({ success: true, data: populated });
  } catch (err) { next(err); }
};

exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('hospitalId', 'name location contact image')
      .populate('departmentId', 'name avgServiceTime')
      .sort({ scheduledTime: -1 });
    res.status(200).json({ success: true, data: bookings });
  } catch (err) { next(err); }
};

exports.getHospitalBookings = async (req, res, next) => {
  try {
    const { date } = req.query;
    const query = { hospitalId: req.params.hospitalId };

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query.scheduledTime = { $gte: start, $lte: end };
    }

    const bookings = await Booking.find(query)
      .populate('userId', 'name phone')
      .populate('departmentId', 'name')
      .sort({ scheduledTime: 1 });

    res.status(200).json({ success: true, data: bookings });
  } catch (err) { next(err); }
};

exports.getTodayBookings = async (req, res, next) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const bookings = await Booking.find({
      hospitalId: req.params.hospitalId,
      scheduledTime: { $gte: start, $lte: end },
    })
      .populate('userId', 'name phone')
      .populate('departmentId', 'name')
      .sort({ scheduledTime: 1 });

    res.status(200).json({ success: true, data: bookings });
  } catch (err) { next(err); }
};

exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, userId: req.user._id });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (['completed', 'cancelled'].includes(booking.status))
      return res.status(400).json({ success: false, message: 'Cannot cancel this booking' });

    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    await booking.save();

    res.status(200).json({ success: true, data: booking });
  } catch (err) { next(err); }
};

exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status, ...(status === 'completed' ? { completedAt: new Date() } : {}) },
      { new: true }
    ).populate('userId', 'name phone').populate('departmentId', 'name');

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // Emit socket event for status update
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${booking.userId._id}`).emit('booking_updated', {
        bookingId: booking._id,
        status: booking.status,
      });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (err) { next(err); }
};
