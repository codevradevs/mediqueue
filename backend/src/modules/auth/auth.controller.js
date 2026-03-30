const jwt = require('jsonwebtoken');
const User = require('./user.model');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
      hospitalId: user.hospitalId,
    },
  });
};

exports.register = async (req, res, next) => {
  try {
    const { name, phone, password, role } = req.body;
    const allowedRoles = ['patient'];
    const userRole = allowedRoles.includes(role) ? role : 'patient';

    const existing = await User.findOne({ phone });
    if (existing) return res.status(400).json({ success: false, message: 'Phone number already registered' });

    const user = await User.create({ name, phone, password, role: userRole });
    sendToken(user, 201, res);
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password)
      return res.status(400).json({ success: false, message: 'Please provide phone and password' });

    const user = await User.findOne({ phone }).select('+password');
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    if (!user.isActive)
      return res.status(401).json({ success: false, message: 'Account deactivated' });

    sendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};
