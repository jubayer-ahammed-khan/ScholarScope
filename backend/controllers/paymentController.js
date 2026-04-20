const db = require('../config/db');

// Request a service with payment
exports.requestService = async (req, res) => {
  try {
    const { 
      service_type, 
      payment_method, 
      payment_number, 
      transaction_id,
      notes 
    } = req.body;

    // Service pricing
    const prices = {
      sop_review: 500,
      counseling: 1000,
      application_support: 1500,
      profile_assessment: 750
    };

    const amount = prices[service_type];

    if (!amount) {
      return res.status(400).json({ 
        message: 'Invalid service type.' 
      });
    }

    // Create service request
    const [serviceResult] = await db.query(
      `INSERT INTO services 
        (user_id, service_type, payment_method, 
        payment_number, transaction_id, amount, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, service_type, payment_method,
       payment_number, transaction_id, amount, notes]
    );

    // Create payment record
    await db.query(
      `INSERT INTO payments 
        (user_id, service_id, amount, payment_method, transaction_id) 
       VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, serviceResult.insertId, 
       amount, payment_method, transaction_id]
    );

    res.status(201).json({ 
      message: 'Service request submitted! We will confirm your payment shortly.',
      service_id: serviceResult.insertId,
      amount
    });

  } catch (error) {
    console.error('Request service error:', error);
    res.status(500).json({ 
      message: 'Server error. Please try again.' 
    });
  }
};

// Get my services (student)
exports.getMyServices = async (req, res) => {
  try {
    const [services] = await db.query(
      `SELECT s.*, p.status as payment_confirmed
       FROM services s
       LEFT JOIN payments p ON s.id = p.service_id
       WHERE s.user_id = ?
       ORDER BY s.created_at DESC`,
      [req.user.id]
    );

    res.json({ 
      count: services.length,
      services 
    });

  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ 
      message: 'Server error. Please try again.' 
    });
  }
};

// Get all services (admin)
exports.getAllServices = async (req, res) => {
  try {
    const [services] = await db.query(
      `SELECT s.*, 
        u.name as student_name,
        u.email as student_email,
        p.status as payment_confirmed
       FROM services s
       JOIN users u ON s.user_id = u.id
       LEFT JOIN payments p ON s.id = p.service_id
       ORDER BY s.created_at DESC`
    );

    res.json({ 
      count: services.length,
      services 
    });

  } catch (error) {
    console.error('Get all services error:', error);
    res.status(500).json({ 
      message: 'Server error. Please try again.' 
    });
  }
};

// Confirm payment (admin)
exports.confirmPayment = async (req, res) => {
  try {
    const { service_id } = req.params;

    // Update service status
    await db.query(
      'UPDATE services SET payment_status = ?, status = ? WHERE id = ?',
      ['confirmed', 'confirmed', service_id]
    );

    // Update payment status
    await db.query(
      'UPDATE payments SET status = ?, confirmed_by = ? WHERE service_id = ?',
      ['confirmed', req.user.id, service_id]
    );

    res.json({ message: 'Payment confirmed successfully!' });

  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ 
      message: 'Server error. Please try again.' 
    });
  }
};

// Reject payment (admin)
exports.rejectPayment = async (req, res) => {
  try {
    const { service_id } = req.params;

    await db.query(
      'UPDATE services SET payment_status = ?, status = ? WHERE id = ?',
      ['rejected', 'cancelled', service_id]
    );

    await db.query(
      'UPDATE payments SET status = ? WHERE service_id = ?',
      ['failed', service_id]
    );

    res.json({ message: 'Payment rejected.' });

  } catch (error) {
    console.error('Reject payment error:', error);
    res.status(500).json({ 
      message: 'Server error. Please try again.' 
    });
  }
};

// Get payment info for a service type
exports.getPaymentInfo = async (req, res) => {
  try {
    const prices = {
      sop_review: 500,
      counseling: 1000,
      application_support: 1500,
      profile_assessment: 750
    };

    const paymentDetails = {
      bkash: {
        number: '01XXXXXXXXX',
        type: 'Personal',
        instructions: 'Send money to this bKash number and enter your transaction ID below.'
      },
      rocket: {
        number: '01XXXXXXXXX',
        type: 'Personal',
        instructions: 'Send money to this Rocket number and enter your transaction ID below.'
      },
      bank_card: {
        bank: 'Dutch Bangla Bank',
        account: 'XXXXXXXXXXXX',
        instructions: 'Transfer to this bank account and enter your transaction ID below.'
      }
    };

    res.json({ prices, paymentDetails });

  } catch (error) {
    console.error('Get payment info error:', error);
    res.status(500).json({ 
      message: 'Server error. Please try again.' 
    });
  }
};