const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const scholarshipRoutes = require('./routes/scholarships');
const applicationRoutes = require('./routes/applications');
const paymentRoutes = require('./routes/payments');
const aiRoutes = require('./routes/ai');
const scrapeScholarships = require('./services/rssScraper');

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  credentials: false
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/scholarships', scholarshipRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/ai', aiRoutes);

// Manual scrape trigger (admin only)
app.post('/api/scrape', async (req, res) => {
  try {
    console.log('🔄 Manual scrape triggered...');
    const result = await scrapeScholarships();
    res.json({
      message: `Scrape complete! Added ${result.added} new scholarships.`,
      ...result
    });
  } catch (err) {
    res.status(500).json({ message: 'Scrape failed.', error: err.message });
  }
});

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'ScholarScope API is running!',
    version: '1.0.0'
  });
});

// Auto scrape every 24 hours at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('⏰ Running scheduled scholarship scraper...');
  await scrapeScholarships();
});

// Run scraper once on server start
setTimeout(async () => {
  console.log('🚀 Running initial scholarship scraper...');
  await scrapeScholarships();
}, 5000);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});