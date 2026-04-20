const db = require('../config/db');

// Get all scholarships
exports.getAll = async (req, res) => {
  try {
    const { category, country, degree_level, search } = req.query;

    let query = 'SELECT * FROM scholarships WHERE is_active = TRUE';
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (country) {
      query += ' AND country = ?';
      params.push(country);
    }

    if (degree_level) {
      query += ' AND degree_level = ?';
      params.push(degree_level);
    }

    if (search) {
      query += ' AND (title LIKE ? OR description LIKE ? OR country LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC';

    const [scholarships] = await db.query(query, params);

    res.json({ 
      count: scholarships.length,
      scholarships 
    });

  } catch (error) {
    console.error('Get scholarships error:', error);
    res.status(500).json({ 
      message: 'Server error. Please try again.' 
    });
  }
};

// Get single scholarship
exports.getOne = async (req, res) => {
  try {
    const [scholarships] = await db.query(
      'SELECT * FROM scholarships WHERE id = ? AND is_active = TRUE',
      [req.params.id]
    );

    if (scholarships.length === 0) {
      return res.status(404).json({ 
        message: 'Scholarship not found.' 
      });
    }

    res.json({ scholarship: scholarships[0] });

  } catch (error) {
    console.error('Get scholarship error:', error);
    res.status(500).json({ 
      message: 'Server error. Please try again.' 
    });
  }
};

// Create scholarship (admin only)
exports.create = async (req, res) => {
  try {
    const {
      title, country, host_university, category,
      degree_level, field, benefits, eligibility,
      required_documents, deadline, application_link,
      description, min_cgpa
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO scholarships 
        (title, country, host_university, category, degree_level, 
        field, benefits, eligibility, required_documents, deadline, 
        application_link, description, min_cgpa, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, country, host_university, category, degree_level,
       field, benefits, eligibility, required_documents, deadline,
       application_link, description, min_cgpa, req.user.id]
    );

    res.status(201).json({ 
      message: 'Scholarship created successfully!',
      id: result.insertId
    });

  } catch (error) {
    console.error('Create scholarship error:', error);
    res.status(500).json({ 
      message: 'Server error. Please try again.' 
    });
  }
};

// Update scholarship (admin only)
exports.update = async (req, res) => {
  try {
    const {
      title, country, host_university, category,
      degree_level, field, benefits, eligibility,
      required_documents, deadline, application_link,
      description, min_cgpa, is_active
    } = req.body;

    await db.query(
      `UPDATE scholarships SET 
        title = ?, country = ?, host_university = ?, category = ?,
        degree_level = ?, field = ?, benefits = ?, eligibility = ?,
        required_documents = ?, deadline = ?, application_link = ?,
        description = ?, min_cgpa = ?, is_active = ?
       WHERE id = ?`,
      [title, country, host_university, category, degree_level,
       field, benefits, eligibility, required_documents, deadline,
       application_link, description, min_cgpa, is_active, req.params.id]
    );

    res.json({ message: 'Scholarship updated successfully!' });

  } catch (error) {
    console.error('Update scholarship error:', error);
    res.status(500).json({ 
      message: 'Server error. Please try again.' 
    });
  }
};

// Delete scholarship (admin only)
exports.remove = async (req, res) => {
  try {
    await db.query(
      'UPDATE scholarships SET is_active = FALSE WHERE id = ?',
      [req.params.id]
    );

    res.json({ message: 'Scholarship removed successfully!' });

  } catch (error) {
    console.error('Delete scholarship error:', error);
    res.status(500).json({ 
      message: 'Server error. Please try again.' 
    });
  }
};