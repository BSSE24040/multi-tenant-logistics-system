const { hashPassword, comparePassword } = require('../utils/hashPassword');
const { generateToken } = require('../utils/generateToken');
const {
  findUserByEmail,
  createTenant,
  createUser,
  getRoleByName,
} = require('../models/authModel');

const register = async (req, res) => {
  try {
    const { tenantName, tenantEmail, tenantPhone, name, email, password } = req.body;

    // Check if user already exists
    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create tenant first
    const tenant = await createTenant(tenantName, tenantEmail, tenantPhone);

    // Get Admin role
    const role = await getRoleByName('Admin');

    // Hash password
    const hashed = await hashPassword(password);

    // Create user
    const user = await createUser(tenant.tenant_id, role.role_id, name, email, hashed);

    // Generate token
    const token = generateToken({
      userId: user.user_id,
      tenantId: tenant.tenant_id,
      role: role.role_name,
    });

    res.status(201).json({
      message: 'Registered successfully',
      token,
      user: {
        userId: user.user_id,
        name: user.name,
        email: user.email,
        role: role.role_name,
        tenantId: tenant.tenant_id,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt:', email, password); // DEBUG

    const user = await findUserByEmail(email);
    console.log('User found:', user); // DEBUG

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await comparePassword(password, user.password);
    console.log('Password match:', isMatch); // DEBUG

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.is_active) {
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    const token = generateToken({
      userId: user.user_id,
      tenantId: user.tenant_id,
      role: user.role_name,
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        userId: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role_name,
        tenantId: user.tenant_id,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getMe = async (req, res) => {
  res.json({ user: req.user });
};

module.exports = { register, login, getMe };