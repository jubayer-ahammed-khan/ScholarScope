const db = require('../config/db');

// Smart rule-based scholarship matching
exports.getRecommendations = async (req, res) => {
  try {
    const user_id = req.user.id;

    // Get user profile
    const [users] = await db.query(
      'SELECT * FROM users WHERE id = ?',
      [user_id]
    );

    const user = users[0];

    if (!user.profile_complete) {
      return res.status(400).json({
        message: 'Please complete your profile first to get recommendations.'
      });
    }

    // Get all active scholarships
    const [scholarships] = await db.query(
      'SELECT * FROM scholarships WHERE is_active = TRUE'
    );

    // Score each scholarship
    const scored = scholarships.map(s => {
      let score = 0;
      const reasons = [];

      // CGPA match
      if (user.cgpa >= s.min_cgpa) {
        score += 30;
        reasons.push(`Your CGPA ${user.cgpa} meets the requirement`);
      } else {
        score -= 20;
      }

      // Degree level match
      if (s.degree_level === 'all' || s.degree_level === user.degree_level) {
        score += 25;
        reasons.push(`Matches your ${user.degree_level} level`);
      }

      // Preferred country match
      if (user.preferred_countries) {
        const preferred = user.preferred_countries.toLowerCase();
        if (preferred.includes(s.country.toLowerCase())) {
          score += 25;
          reasons.push(`${s.country} is in your preferred countries`);
        }
      }

      // Field of study match
      if (user.field_of_study && s.field !== 'All Fields') {
        const userField = user.field_of_study.toLowerCase();
        const scholarField = s.field.toLowerCase();
        if (scholarField.includes(userField) || userField.includes(scholarField)) {
          score += 20;
          reasons.push(`Matches your field: ${user.field_of_study}`);
        }
      }

      // Deadline not passed
      if (s.deadline) {
        const deadline = new Date(s.deadline);
        const today = new Date();
        if (deadline > today) {
          score += 10;
          reasons.push('Application deadline is still open');
        } else {
          score -= 30;
        }
      }

      return { ...s, score, reasons };
    });

    // Sort by score and return top 6
    const recommendations = scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    res.json({
      message: `Found ${recommendations.length} scholarships matching your profile!`,
      recommendations
    });

  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({
      message: 'Server error. Please try again.'
    });
  }
};

// AI Chatbot
exports.chat = async (req, res) => {
  try {
    const { message } = req.body;
    const lowerMsg = message.toLowerCase();

    // Get scholarships from DB for context
    const [scholarships] = await db.query(
      'SELECT title, country, category, degree_level, deadline, benefits FROM scholarships WHERE is_active = TRUE LIMIT 10'
    );

    let reply = '';

    // Rule based responses
    if (lowerMsg.includes('fully funded')) {
      const list = scholarships
        .filter(s => s.category === 'fully_funded')
        .map(s => s.title)
        .slice(0, 3)
        .join(', ');
      reply = `Great choice! Some top fully funded scholarships include: ${list}. These cover full tuition, living costs and flights. Would you like details on any of these?`;

    } else if (lowerMsg.includes('eligib')) {
      reply = `Eligibility varies by scholarship. Generally you need: ✅ A completed undergraduate degree ✅ Good CGPA (usually 2.5 - 3.5+) ✅ English proficiency (IELTS/TOEFL) ✅ Motivation letter ✅ Recommendation letters. Complete your profile and I can show you scholarships you are eligible for!`;

    } else if (lowerMsg.includes('document')) {
      reply = `Common documents needed: 📄 Academic transcripts 📄 Passport copy 📄 English test scores 📄 Statement of Purpose (SOP) 📄 Recommendation letters (2-3) 📄 CV/Resume 📄 Research proposal (for PhD). Need help with your SOP? Check our Premium services!`;

    } else if (lowerMsg.includes('deadline')) {
      const upcoming = scholarships
        .filter(s => s.deadline && new Date(s.deadline) > new Date())
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
        .slice(0, 3)
        .map(s => `${s.title} - ${new Date(s.deadline).toDateString()}`)
        .join(' | ');
      reply = `Upcoming deadlines: ⏰ ${upcoming}. Don't miss these! Apply early for better chances.`;

    } else if (lowerMsg.includes('sop') || lowerMsg.includes('statement of purpose')) {
      reply = `A great SOP should: ✍️ Start with a compelling story ✍️ Explain why you chose this field ✍️ Highlight your achievements ✍️ Show your future goals ✍️ Explain why this specific university. Our Premium SOP Review service can help polish your SOP to Ivy League standards! Only 500 BDT.`;

    } else if (lowerMsg.includes('ielts') || lowerMsg.includes('english')) {
      reply = `English requirements vary: 🇬🇧 UK scholarships: IELTS 6.5+ 🇺🇸 US scholarships: IELTS 7.0+ or TOEFL 100+ 🇪🇺 European: IELTS 6.0+ 🇯🇵 Japan/China: Sometimes waived. Some scholarships accept English medium education certificates instead.`;

    } else if (lowerMsg.includes('bangladesh') || lowerMsg.includes('bangladeshi')) {
      reply = `Great news for Bangladeshi students! 🇧🇩 Top picks: ✅ Chevening (UK) ✅ Fulbright (USA) ✅ Australia Awards ✅ DAAD (Germany) ✅ MEXT (Japan) ✅ Commonwealth Scholarship. All are fully funded and open to Bangladesh nationals!`;

    } else if (lowerMsg.includes('phd')) {
      const phdList = scholarships
        .filter(s => s.degree_level === 'phd')
        .map(s => s.title)
        .slice(0, 3)
        .join(', ');
      reply = `Top PhD scholarships: 🎓 ${phdList}. For PhD you typically need: Masters degree, research proposal, and a supervisor agreement. Would you like more details?`;

    } else if (lowerMsg.includes('masters') || lowerMsg.includes('master')) {
      reply = `Masters scholarships are the most available! 🎓 Top options: Chevening, Fulbright, DAAD, Erasmus Mundus, Commonwealth, Swedish Institute. Most require: Bachelors degree, IELTS, SOP, and 2 recommendation letters.`;

    } else if (lowerMsg.includes('europe') || lowerMsg.includes('european')) {
      reply = `European scholarships for Bangladeshi students: 🇪🇺 Erasmus Mundus - Study in multiple EU countries 🇩🇪 DAAD Germany - EUR 934/month 🇸🇪 Swedish Institute - SEK 11000/month 🇫🇷 Eiffel France - EUR 1181/month 🇧🇪 VLIR-UOS Belgium - Full funding. All fully funded!`;

    } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
      reply = `Hello! 👋 Welcome to ScholarScope! I am your AI scholarship assistant. I can help you with: 🎓 Finding scholarships 📋 Eligibility requirements 📄 Required documents ⏰ Application deadlines. What would you like to know?`;

    } else if (lowerMsg.includes('cost') || lowerMsg.includes('price') || lowerMsg.includes('fee')) {
      reply = `ScholarScope is FREE to use! 🎉 Browse all scholarships at no cost. Our Premium services: 💼 SOP Review - 500 BDT 📊 Profile Assessment - 750 BDT 🤝 1-on-1 Counseling - 1000 BDT 🚀 Full Application Support - 1500 BDT. Payment via bKash, Rocket or Bank Card.`;

    } else {
      reply = `Thanks for your question! 🤔 I can help you with: 💡 Type "fully funded" for top scholarships 💡 Type "eligibility" for requirements 💡 Type "documents" for document checklist 💡 Type "deadlines" for upcoming deadlines 💡 Type "Bangladesh" for BD specific scholarships. What would you like to know?`;
    }

    res.json({ reply });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      message: 'Server error. Please try again.'
    });
  }
};