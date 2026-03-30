const Department = require('./department.model');
const Queue = require('../queues/queue.model');

exports.createDepartment = async (req, res, next) => {
  try {
    const department = await Department.create(req.body);
    // Auto-create a queue for this department
    await Queue.create({
      departmentId: department._id,
      hospitalId: department.hospitalId,
      status: 'closed',
    });
    res.status(201).json({ success: true, data: department });
  } catch (err) { next(err); }
};

exports.getDepartmentsByHospital = async (req, res, next) => {
  try {
    const departments = await Department.find({ hospitalId: req.params.hospitalId, isActive: true });
    const depsWithQueues = await Promise.all(departments.map(async (d) => {
      const queue = await Queue.findOne({ departmentId: d._id });
      return {
        ...d.toObject(),
        queue: queue ? { ...queue.toObject(), estimatedWait: queue.currentCount * d.avgServiceTime } : null,
      };
    }));
    res.status(200).json({ success: true, data: depsWithQueues });
  } catch (err) { next(err); }
};

exports.updateDepartment = async (req, res, next) => {
  try {
    const dept = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!dept) return res.status(404).json({ success: false, message: 'Department not found' });
    res.status(200).json({ success: true, data: dept });
  } catch (err) { next(err); }
};

exports.deleteDepartment = async (req, res, next) => {
  try {
    await Department.findByIdAndUpdate(req.params.id, { isActive: false });
    res.status(200).json({ success: true, message: 'Department deactivated' });
  } catch (err) { next(err); }
};
