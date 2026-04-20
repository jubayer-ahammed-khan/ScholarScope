const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const [existing] = await db.query(
      'SELECT id FROM users WHERE email = ?', 
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ 
        message: 'Email already registered.' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [result] = await db.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    // Generate token
    const token = jwt.sign(
      { id: result.insertId, role: 'student' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: {
        id: result.insertId,
        name,
        email,
        role: 'student'
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      message: 'Server error. Please try again.' 
    });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ?', 
      [email]
    );

    if (users.length === 0) {
      return res.status(400).json({ 
        message: 'Invalid email or password.' 
      });
    }

    const user = users[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        message: 'Invalid email or password.' 
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Server error. Please try again.' 
    });
  }
};

// Get current user
exports.getMe = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, name, email, role, phone, degree_level, field_of_study, cgpa, preferred_countries, profile_complete FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ 
        message: 'User not found.' 
      });
    }

    res.json({ user: users[0] });

  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ 
      message: 'Server error. Please try again.' 
    });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, degree_level, field_of_study, cgpa, preferred_countries } = req.body;

    await db.query(
      `UPDATE users SET 
        name = ?, phone = ?, degree_level = ?, 
        field_of_study = ?, cgpa = ?, preferred_countries = ?,
        profile_complete = TRUE
      WHERE id = ?`,
      [name, phone, degree_level, field_of_study, cgpa, preferred_countries, req.user.id]
    );

    res.json({ message: 'Profile updated successfully!' });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      message: 'Server error. Please try again.' 
    });
  }
};
// Get all users (admin)
exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT id, name, email, phone, role, degree_level, 
        field_of_study, cgpa, profile_complete, created_at 
       FROM users WHERE role = 'student' 
       ORDER BY created_at DESC`
    );
    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};
// Upload profile documents
exports.uploadDocuments = async (req, res) => {
  try {
    const updates = {};
    
    if (req.files) {
      if (req.files.cv) updates.cv_file = req.files.cv[0].filename;
      if (req.files.transcript) updates.transcript_file = req.files.transcript[0].filename;
      if (req.files.passport) updates.passport_file = req.files.passport[0].filename;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No files uploaded.' });
    }

    const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    const values = [...Object.values(updates), req.user.id];

    await db.query(
      `UPDATE users SET ${fields} WHERE id = ?`,
      values
    );

    res.json({ 
      message: 'Documents uploaded successfully!',
      files: updates
    });

  } catch (error) {
    console.error('Upload documents error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get profile documents
exports.getDocuments = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT cv_file, transcript_file, passport_file FROM users WHERE id = ?',
      [req.user.id]
    );

    res.json({ documents: users[0] });

  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};