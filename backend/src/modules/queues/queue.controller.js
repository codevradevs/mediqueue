const Queue = require('./queue.model');
const Department = require('../departments/department.model');

exports.getQueuesByHospital = async (req, res, next) => {
  try {
    const queues = await Queue.find({ hospitalId: req.params.hospitalId });
    const enriched = await Promise.all(queues.map(async (q) => {
      const dept = await Department.findById(q.departmentId);
      return {
        ...q.toObject(),
        departmentName: dept?.name || 'Unknown',
        avgServiceTime: dept?.avgServiceTime || 15,
        estimatedWait: q.currentCount * (dept?.avgServiceTime || 15),
      };
    }));
    res.status(200).json({ success: true, data: enriched });
  } catch (err) { next(err); }
};

exports.getQueueByDepartment = async (req, res, next) => {
  try {
    const queue = await Queue.findOne({ departmentId: req.params.departmentId });
    if (!queue) return res.status(404).json({ success: false, message: 'Queue not found' });
    const dept = await Department.findById(queue.departmentId);
    res.status(200).json({
      success: true,
      data: {
        ...queue.toObject(),
        estimatedWait: queue.currentCount * (dept?.avgServiceTime || 15),
        avgServiceTime: dept?.avgServiceTime || 15,
      },
    });
  } catch (err) { next(err); }
};

exports.updateQueue = async (req, res, next) => {
  try {
    const { action, count = 1 } = req.body;
    const queue = await Queue.findOne({ departmentId: req.params.departmentId });
    if (!queue) return res.status(404).json({ success: false, message: 'Queue not found' });

    const dept = await Department.findById(queue.departmentId);

    if (action === 'increment') {
      queue.currentCount = Math.min(queue.currentCount + count, dept?.maxCapacity || 100);
    } else if (action === 'decrement') {
      const prev = queue.currentCount;
      queue.currentCount = Math.max(queue.currentCount - count, 0);
      if (prev > 0) queue.totalServedToday += (prev - queue.currentCount);
    } else if (action === 'set') {
      queue.currentCount = Math.max(0, count);
    }

    queue.lastUpdated = new Date();
    queue.updatedBy = req.user._id;
    await queue.save();

    const estimatedWait = queue.currentCount * (dept?.avgServiceTime || 15);

    // Emit real-time update via socket
    const io = req.app.get('io');
    if (io) {
      io.to(`department:${queue.departmentId}`).emit('queue_updated', {
        departmentId: queue.departmentId,
        hospitalId: queue.hospitalId,
        currentCount: queue.currentCount,
        estimatedWait,
        status: queue.status,
        lastUpdated: queue.lastUpdated,
      });
      io.to(`hospital:${queue.hospitalId}`).emit('queue_updated', {
        departmentId: queue.departmentId,
        hospitalId: queue.hospitalId,
        currentCount: queue.currentCount,
        estimatedWait,
        status: queue.status,
        lastUpdated: queue.lastUpdated,
      });
    }

    res.status(200).json({
      success: true,
      data: { ...queue.toObject(), estimatedWait },
    });
  } catch (err) { next(err); }
};

exports.setQueueStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const queue = await Queue.findOneAndUpdate(
      { departmentId: req.params.departmentId },
      { status, lastUpdated: new Date(), updatedBy: req.user._id },
      { new: true }
    );
    if (!queue) return res.status(404).json({ success: false, message: 'Queue not found' });

    const dept = await Department.findById(queue.departmentId);
    const estimatedWait = queue.currentCount * (dept?.avgServiceTime || 15);

    const io = req.app.get('io');
    if (io) {
      io.to(`department:${queue.departmentId}`).emit('queue_updated', {
        departmentId: queue.departmentId,
        hospitalId: queue.hospitalId,
        currentCount: queue.currentCount,
        estimatedWait,
        status: queue.status,
        lastUpdated: queue.lastUpdated,
      });
      io.to(`hospital:${queue.hospitalId}`).emit('queue_updated', {
        departmentId: queue.departmentId,
        hospitalId: queue.hospitalId,
        currentCount: queue.currentCount,
        estimatedWait,
        status: queue.status,
        lastUpdated: queue.lastUpdated,
      });
    }

    res.status(200).json({ success: true, data: { ...queue.toObject(), estimatedWait } });
  } catch (err) { next(err); }
};

exports.resetDailyQueues = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    await Queue.updateMany(
      { hospitalId: req.params.hospitalId, lastResetDate: { $ne: today } },
      { totalServedToday: 0, lastResetDate: today }
    );
    res.status(200).json({ success: true, message: 'Daily queues reset' });
  } catch (err) { next(err); }
};
