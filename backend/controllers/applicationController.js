const db = require('../config/db');
const path = require('path');

// Apply for scholarship with documents
exports.apply = async (req, res) => {
  try {
    const { scholarship_id, cover_letter } = req.body;
    const user_id = req.user.id;

    // Check if already applied
    const [existing] = await db.query(
      'SELECT id FROM applications WHERE user_id = ? AND scholarship_id = ?',
      [user_id, scholarship_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        message: 'You have already applied for this scholarship.'
      });
    }

    // Collect uploaded file paths
    const documents = {};
    if (req.files) {
      if (req.files.cv) documents.cv = req.files.cv[0].filename;
      if (req.files.transcript) documents.transcript = req.files.transcript[0].filename;
      if (req.files.passport) documents.passport = req.files.passport[0].filename;
      if (req.files.other) documents.other = req.files.other[0].filename;
    }

    // Create application
    const [result] = await db.query(
      `INSERT INTO applications 
        (user_id, scholarship_id, cover_letter, documents_submitted) 
       VALUES (?, ?, ?, ?)`,
      [user_id, scholarship_id, cover_letter, JSON.stringify(documents)]
    );

    res.status(201).json({
      message: 'Application submitted successfully!',
      id: result.insertId
    });

  } catch (error) {
    console.error('Apply error:', error);
    res.status(500).json({
      message: 'Server error. Please try again.'
    });
  }
};

// Get my applications (student)
exports.getMyApplications = async (req, res) => {
  try {
    const [applications] = await db.query(
      `SELECT a.*, s.title, s.country, s.category,
        s.deadline, s.host_university, s.application_link
       FROM applications a
       JOIN scholarships s ON a.scholarship_id = s.id
       WHERE a.user_id = ?
       ORDER BY a.applied_at DESC`,
      [req.user.id]
    );

    // Parse documents JSON
    const parsed = applications.map(a => ({
      ...a,
      documents_submitted: a.documents_submitted
        ? JSON.parse(a.documents_submitted)
        : {}
    }));

    res.json({
      count: parsed.length,
      applications: parsed
    });

  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      message: 'Server error. Please try again.'
    });
  }
};

// Get all applications (admin)
exports.getAllApplications = async (req, res) => {
  try {
    const [applications] = await db.query(
      `SELECT a.*,
        s.title as scholarship_title,
        s.country,
        s.application_link,
        u.name as student_name,
        u.email as student_email,
        u.phone as student_phone,
        u.cgpa as student_cgpa,
        u.field_of_study,
        u.degree_level
       FROM applications a
       JOIN scholarships s ON a.scholarship_id = s.id
       JOIN users u ON a.user_id = u.id
       ORDER BY a.applied_at DESC`
    );

    // Parse documents JSON
    const parsed = applications.map(a => ({
      ...a,
      documents_submitted: a.documents_submitted
        ? JSON.parse(a.documents_submitted)
        : {}
    }));

    res.json({
      count: parsed.length,
      applications: parsed
    });

  } catch (error) {
    console.error('Get all applications error:', error);
    res.status(500).json({
      message: 'Server error. Please try again.'
    });
  }
};

// Get single application details (admin)
exports.getOne = async (req, res) => {
  try {
    const [applications] = await db.query(
      `SELECT a.*,
        s.title as scholarship_title,
        s.country,
        s.application_link,
        s.benefits,
        s.eligibility,
        u.name as student_name,
        u.email as student_email,
        u.phone as student_phone,
        u.cgpa as student_cgpa,
        u.field_of_study,
        u.degree_level,
        u.preferred_countries
       FROM applications a
       JOIN scholarships s ON a.scholarship_id = s.id
       JOIN users u ON a.user_id = u.id
       WHERE a.id = ?`,
      [req.params.id]
    );

    if (applications.length === 0) {
      return res.status(404).json({
        message: 'Application not found.'
      });
    }

    const app = {
      ...applications[0],
      documents_submitted: applications[0].documents_submitted
        ? JSON.parse(applications[0].documents_submitted)
        : {}
    };

    res.json({ application: app });

  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({
      message: 'Server error. Please try again.'
    });
  }
};

// Update application status (admin)
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    await db.query(
      'UPDATE applications SET status = ? WHERE id = ?',
      [status, req.params.id]
    );

    res.json({ message: 'Application status updated successfully!' });

  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      message: 'Server error. Please try again.'
    });
  }
};
// Quick apply using saved profile documents
exports.quickApply = async (req, res) => {
  try {
    const { scholarship_id, cover_letter } = req.body;
    const user_id = req.user.id;

    // Check if already applied
    const [existing] = await db.query(
      'SELECT id FROM applications WHERE user_id = ? AND scholarship_id = ?',
      [user_id, scholarship_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        message: 'You have already applied for this scholarship.'
      });
    }

    // Get saved documents from user profile
    const [users] = await db.query(
      'SELECT cv_file, transcript_file, passport_file FROM users WHERE id = ?',
      [user_id]
    );

    const user = users[0];

    if (!user.cv_file) {
      return res.status(400).json({
        message: 'No saved CV found. Please upload documents in your profile first.'
      });
    }

    const documents = {
      cv: user.cv_file,
      transcript: user.transcript_file || null,
      passport: user.passport_file || null
    };

    // Create application
    const [result] = await db.query(
      `INSERT INTO applications 
        (user_id, scholarship_id, cover_letter, documents_submitted) 
       VALUES (?, ?, ?, ?)`,
      [user_id, scholarship_id, cover_letter, JSON.stringify(documents)]
    );

    res.status(201).json({
      message: 'Quick Apply successful! Application submitted with your saved documents.',
      id: result.insertId
    });

  } catch (error) {
    console.error('Quick apply error:', error);
    res.status(500).json({
      message: 'Server error. Please try again.'
    });
  }
};