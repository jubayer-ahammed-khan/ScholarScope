const Parser = require('rss-parser');
const db = require('../config/db');

const parser = new Parser({
  customFields: {
    item: ['summary', 'content', 'description']
  }
});

// Free RSS feeds related to scholarships
const RSS_FEEDS = [
  {
    url: 'https://www.scholars4dev.com/feed/',
    source: 'Scholars4Dev'
  },
  {
    url: 'https://www.scholarshippositions.com/feed',
    source: 'ScholarshipPositions'
  },
  {
    url: 'https://opportunitiescircle.com/feed/',
    source: 'OpportunitiesCircle'
  },
  {
    url: 'https://scholarshiproar.com/feed/',
    source: 'ScholarshipRoar'
  }
];

// Keywords to identify scholarship category
function detectCategory(text) {
  const lower = text.toLowerCase();
  if (lower.includes('fully funded') || lower.includes('full scholarship')) return 'fully_funded';
  if (lower.includes('erasmus')) return 'erasmus';
  if (lower.includes('government') || lower.includes('fulbright') || lower.includes('chevening') || lower.includes('commonwealth')) return 'government';
  if (lower.includes('summer school') || lower.includes('summer program')) return 'summer_school';
  return 'partial';
}

// Keywords to identify degree level
function detectDegree(text) {
  const lower = text.toLowerCase();
  if (lower.includes('phd') || lower.includes('doctoral')) return 'phd';
  if (lower.includes('master') || lower.includes('msc') || lower.includes('mba')) return 'masters';
  if (lower.includes('undergraduate') || lower.includes('bachelor')) return 'undergraduate';
  return 'all';
}

// Extract country from text
function detectCountry(text) {
  const countries = [
    'United Kingdom', 'United States', 'Germany', 'Japan',
    'Australia', 'Canada', 'France', 'Sweden', 'Netherlands',
    'Belgium', 'Switzerland', 'China', 'South Korea', 'Turkey',
    'Hungary', 'Italy', 'Poland', 'Malaysia', 'Singapore',
    'New Zealand', 'Norway', 'Denmark', 'Finland', 'Austria'
  ];
  for (const country of countries) {
    if (text.includes(country)) return country;
  }
  return 'Various';
}

// Main scraper function
async function scrapeScholarships() {
  console.log('🔄 Starting RSS scholarship scraper...');
  let added = 0;
  let skipped = 0;

  for (const feed of RSS_FEEDS) {
    try {
      console.log(`📡 Fetching: ${feed.source}`);
      const result = await parser.parseURL(feed.url);

      for (const item of result.items) {
        try {
          const title = item.title || '';
          const description = item.contentSnippet || item.summary || item.description || '';
          const link = item.link || '';
          const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();

          // Skip if not scholarship related
          const combined = (title + ' ' + description).toLowerCase();
          if (!combined.includes('scholarship') &&
              !combined.includes('fellowship') &&
              !combined.includes('grant') &&
              !combined.includes('funded')) {
            skipped++;
            continue;
          }

          // Check if already exists
          const [existing] = await db.query(
            'SELECT id FROM scholarships WHERE title = ?',
            [title]
          );

          if (existing.length > 0) {
            skipped++;
            continue;
          }

          // Detect fields
          const category = detectCategory(combined);
          const degree_level = detectDegree(combined);
          const country = detectCountry(title + ' ' + description);

          // Set deadline 6 months from now if not found
          const deadline = new Date();
          deadline.setMonth(deadline.getMonth() + 6);

          // Insert into database
          await db.query(
            `INSERT INTO scholarships 
              (title, country, category, degree_level, description, 
               application_link, deadline, benefits, is_active) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
            [
              title,
              country,
              category,
              degree_level,
              description.substring(0, 500),
              link,
              deadline,
              'Check official website for full benefits details'
            ]
          );

          added++;
          console.log(`✅ Added: ${title}`);

        } catch (itemErr) {
          console.error(`⚠️ Error processing item:`, itemErr.message);
        }
      }

    } catch (feedErr) {
      console.error(`❌ Failed to fetch ${feed.source}:`, feedErr.message);
    }
  }

  console.log(`\n📊 Scraper finished: ${added} added, ${skipped} skipped`);
  return { added, skipped };
}

module.exports = scrapeScholarships;