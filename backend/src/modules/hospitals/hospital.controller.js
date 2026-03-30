const Hospital = require('./hospital.model');
const Department = require('../departments/department.model');
const Queue = require('../queues/queue.model');

exports.createHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: hospital });
  } catch (err) { next(err); }
};

exports.getHospitals = async (req, res, next) => {
  try {
    const { search, county, limit = 20, page = 1 } = req.query;
    const query = { isActive: true };

    if (county) query['location.county'] = new RegExp(county, 'i');
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { 'location.city': new RegExp(search, 'i') },
        { 'location.address': new RegExp(search, 'i') },
        { 'location.county': new RegExp(search, 'i') },
      ];
    }

    const hospitals = await Hospital.find(query)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    // Attach departments + queues to each hospital
    const enriched = await Promise.all(hospitals.map(async (h) => {
      const departments = await Department.find({ hospitalId: h._id, isActive: true });
      const depsWithQueues = await Promise.all(departments.map(async (d) => {
        const queue = await Queue.findOne({ departmentId: d._id });
        return {
          ...d.toObject(),
          queue: queue ? {
            ...queue.toObject(),
            estimatedWait: queue.currentCount * d.avgServiceTime,
          } : null,
        };
      }));
      return { ...h.toObject(), departments: depsWithQueues };
    }));

    const total = await Hospital.countDocuments(query);
    res.status(200).json({ success: true, count: enriched.length, total, data: enriched });
  } catch (err) { next(err); }
};

exports.getHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) return res.status(404).json({ success: false, message: 'Hospital not found' });

    const departments = await Department.find({ hospitalId: hospital._id, isActive: true });
    const depsWithQueues = await Promise.all(departments.map(async (d) => {
      const queue = await Queue.findOne({ departmentId: d._id });
      return {
        ...d.toObject(),
        queue: queue ? {
          ...queue.toObject(),
          estimatedWait: queue.currentCount * d.avgServiceTime,
        } : null,
      };
    }));

    res.status(200).json({ success: true, data: { ...hospital.toObject(), departments: depsWithQueues } });
  } catch (err) { next(err); }
};

exports.updateHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!hospital) return res.status(404).json({ success: false, message: 'Hospital not found' });
    res.status(200).json({ success: true, data: hospital });
  } catch (err) { next(err); }
};

exports.getHospitalStats = async (req, res, next) => {
  try {
    const { id } = req.params;
    const departments = await Department.find({ hospitalId: id, isActive: true });
    const queues = await Queue.find({ hospitalId: id });

    const totalInQueue = queues.reduce((sum, q) => sum + q.currentCount, 0);
    const totalServedToday = queues.reduce((sum, q) => sum + q.totalServedToday, 0);
    const avgWaitTime = departments.length > 0
      ? Math.round(departments.reduce((sum, d) => sum + d.avgServiceTime, 0) / departments.length)
      : 0;

    const deptStats = await Promise.all(departments.map(async (d) => {
      const queue = queues.find(q => q.departmentId.toString() === d._id.toString());
      return {
        name: d.name,
        queue: {
          currentCount: queue?.currentCount || 0,
          totalServedToday: queue?.totalServedToday || 0,
          status: queue?.status || 'closed',
        },
      };
    }));

    res.status(200).json({
      success: true,
      data: {
        totalDepartments: departments.length,
        totalInQueue,
        totalServedToday,
        avgWaitTime,
        departments: deptStats,
      },
    });
  } catch (err) { next(err); }
};
