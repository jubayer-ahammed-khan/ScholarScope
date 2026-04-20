CREATE DATABASE IF NOT EXISTS scholarscope;
USE scholarscope;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('student', 'admin') DEFAULT 'student',
  phone VARCHAR(20),
  country VARCHAR(50) DEFAULT 'Bangladesh',
  degree_level ENUM('undergraduate', 'masters', 'phd') DEFAULT 'undergraduate',
  field_of_study VARCHAR(100),
  cgpa DECIMAL(3,2),
  preferred_countries VARCHAR(255),
  profile_complete BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scholarships Table
CREATE TABLE IF NOT EXISTS scholarships (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  country VARCHAR(100) NOT NULL,
  host_university VARCHAR(255),
  category ENUM('fully_funded','partial','erasmus','government','summer_school') NOT NULL,
  degree_level ENUM('undergraduate','masters','phd','all') DEFAULT 'all',
  field VARCHAR(255) DEFAULT 'All Fields',
  benefits TEXT,
  eligibility TEXT,
  required_documents TEXT,
  deadline DATE,
  application_link VARCHAR(500),
  description TEXT,
  min_cgpa DECIMAL(3,2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT TRUE,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Applications Table
CREATE TABLE IF NOT EXISTS applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  scholarship_id INT NOT NULL,
  status ENUM('pending','reviewing','accepted','rejected') DEFAULT 'pending',
  cover_letter TEXT,
  documents_submitted TEXT,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (scholarship_id) REFERENCES scholarships(id)
);

-- Services Table (SOP, Counseling etc)
CREATE TABLE IF NOT EXISTS services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  service_type ENUM('sop_review','counseling','application_support','profile_assessment') NOT NULL,
  status ENUM('pending','confirmed','completed','cancelled') DEFAULT 'pending',
  payment_method ENUM('bkash','rocket','bank_card') NOT NULL,
  payment_number VARCHAR(50),
  transaction_id VARCHAR(100),
  payment_status ENUM('pending','confirmed','rejected') DEFAULT 'pending',
  amount DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  service_id INT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status ENUM('scheduled','completed','cancelled') DEFAULT 'scheduled',
  meeting_link VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (service_id) REFERENCES services(id)
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  service_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method ENUM('bkash','rocket','bank_card') NOT NULL,
  transaction_id VARCHAR(100) UNIQUE,
  status ENUM('pending','confirmed','failed') DEFAULT 'pending',
  confirmed_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (service_id) REFERENCES services(id)
);

-- Seed Admin User (password: admin123)
INSERT INTO users (name, email, password, role) VALUES
('Admin', 'admin@scholarscope.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Seed Scholarship Data (50 real scholarships)
INSERT INTO scholarships (title, country, host_university, category, degree_level, field, benefits, eligibility, deadline, application_link, description, min_cgpa) VALUES

('Chevening Scholarship', 'United Kingdom', 'Various UK Universities', 'fully_funded', 'masters', 'All Fields', 'Full tuition, living allowance, flights, visa', 'Bangladesh nationals, 2 years work experience, undergraduate degree', '2025-11-05', 'https://www.chevening.org', 'UK government global scholarship programme for future leaders', 3.00),

('Fulbright Foreign Student Program', 'United States', 'Various US Universities', 'government', 'masters', 'All Fields', 'Full tuition, living stipend, health insurance, flights', 'Bangladesh nationals, undergraduate degree, English proficiency', '2025-10-15', 'https://foreign.fulbrightonline.org', 'US government flagship international exchange program', 3.00),

('MEXT Japanese Government Scholarship', 'Japan', 'Various Japanese Universities', 'government', 'masters', 'All Fields', 'Full tuition, monthly stipend JPY 144000, flights', 'Under 35 years, undergraduate degree, good health', '2025-05-31', 'https://www.mext.go.jp', 'Japanese government scholarship for international students', 2.50),

('Erasmus Mundus Joint Masters', 'Europe', 'Multiple EU Universities', 'erasmus', 'masters', 'All Fields', 'Tuition waiver, EUR 1400/month stipend, travel allowance', 'Bachelor degree, English proficiency, motivation letter', '2025-02-15', 'https://erasmus-plus.ec.europa.eu', 'Study in multiple European countries with full funding', 2.80),

('Commonwealth Scholarship', 'United Kingdom', 'Various UK Universities', 'government', 'masters', 'All Fields', 'Full tuition, living allowance, flights, thesis grant', 'Bangladesh nationals, first class degree, under 40', '2025-12-15', 'https://cscuk.fcdo.gov.uk', 'Commonwealth government scholarship for developing countries', 3.00),

('DAAD Scholarship Germany', 'Germany', 'Various German Universities', 'fully_funded', 'masters', 'All Fields', 'EUR 934/month stipend, health insurance, travel allowance', 'Undergraduate degree, 2 years work experience', '2025-10-15', 'https://www.daad.de', 'German Academic Exchange Service scholarship program', 2.75),

('Australia Awards Scholarship', 'Australia', 'Various Australian Universities', 'government', 'masters', 'All Fields', 'Full tuition, living costs, flights, health cover', 'Bangladesh nationals, undergraduate degree, work experience', '2025-04-30', 'https://www.australiaawardsbangladesh.org', 'Australian government scholarship for Bangladesh students', 3.00),

('Swedish Institute Scholarship', 'Sweden', 'Various Swedish Universities', 'fully_funded', 'masters', 'All Fields', 'Full tuition, SEK 11000/month, travel grant, insurance', 'Bachelor degree, work experience, leadership potential', '2025-02-10', 'https://si.se/en/apply/scholarships', 'Swedish government scholarship for global professionals', 3.00),

('Chinese Government Scholarship CSC', 'China', 'Various Chinese Universities', 'government', 'masters', 'All Fields', 'Full tuition, CNY 3000/month, accommodation, insurance', 'Under 35, undergraduate degree, good health', '2025-03-31', 'https://www.csc.edu.cn', 'Chinese government full scholarship for international students', 2.50),

('Korea Government Scholarship KGSP', 'South Korea', 'Various Korean Universities', 'government', 'masters', 'All Fields', 'Full tuition, KRW 1000000/month, flights, settlement allowance', 'Under 40, undergraduate degree, good health', '2025-09-30', 'https://www.niied.go.kr', 'Korean government scholarship for international graduate students', 2.80),

('Gates Cambridge Scholarship', 'United Kingdom', 'University of Cambridge', 'fully_funded', 'phd', 'All Fields', 'Full tuition, GBP 21000/year stipend, flights, visa', 'Accepted to Cambridge, academic excellence', '2025-12-03', 'https://www.gatescambridge.org', 'Full cost scholarship at University of Cambridge', 3.50),

('Rhodes Scholarship Oxford', 'United Kingdom', 'University of Oxford', 'fully_funded', 'masters', 'All Fields', 'Full tuition, GBP 20000/year, flights, health insurance', 'Citizenship eligible country, academic excellence, leadership', '2025-08-01', 'https://www.rhodeshouse.ox.ac.uk', 'Oldest international scholarship programme at Oxford', 3.50),

('Turkiye Burslari Scholarship', 'Turkey', 'Various Turkish Universities', 'government', 'masters', 'All Fields', 'Full tuition, TRY 3500/month, accommodation, flights', 'Under 30 for masters, academic record', '2025-02-20', 'https://www.turkiyeburslari.gov.tr', 'Turkish government scholarship for international students', 2.50),

('Hungary Stipendium Hungaricum', 'Hungary', 'Various Hungarian Universities', 'government', 'masters', 'All Fields', 'Full tuition, HUF 130000/month, accommodation', 'Nominated by Bangladesh government, academic excellence', '2025-01-15', 'https://stipendiumhungaricum.hu', 'Hungarian government scholarship program', 2.80),

('New Zealand Excellence Award', 'New Zealand', 'Various NZ Universities', 'fully_funded', 'masters', 'All Fields', 'Partial tuition, living allowance, health insurance', 'Bangladesh nationals, undergraduate degree', '2025-03-28', 'https://www.studyinnewzealand.govt.nz', 'New Zealand government scholarship for Bangladesh', 3.00),

('ADB Japan Scholarship', 'Japan', 'ADB Partner Universities', 'fully_funded', 'masters', 'All Fields', 'Full tuition, living allowance, travel, insurance', 'ADB developing member country, work experience, under 35', '2025-05-31', 'https://www.adb.org/work-with-us/careers/japan-scholarship-program', 'Asian Development Bank scholarship for development professionals', 3.00),

('VLIR-UOS Scholarship Belgium', 'Belgium', 'Various Belgian Universities', 'fully_funded', 'masters', 'All Fields', 'Full tuition, EUR 750/month, flights, insurance', 'Bangladesh nationals, relevant work experience', '2025-02-01', 'https://www.vliruos.be', 'Belgian development scholarship for developing countries', 3.00),

('Orange Knowledge Programme Netherlands', 'Netherlands', 'Various Dutch Universities', 'fully_funded', 'masters', 'All Fields', 'Full tuition, living allowance, flights, visa', 'Bangladesh nationals, work experience, under 45', '2025-02-04', 'https://www.nuffic.nl/en/subjects/orange-knowledge-programme', 'Dutch government scholarship for professionals', 3.00),

('Swiss Government Excellence Scholarship', 'Switzerland', 'Swiss Universities', 'government', 'phd', 'All Fields', 'CHF 1920/month, tuition, accommodation, insurance', 'University nomination required, research proposal', '2025-12-01', 'https://www.sbfi.admin.ch', 'Swiss federal scholarship for international researchers', 3.50),

('Eiffel Excellence Scholarship France', 'France', 'Various French Universities', 'fully_funded', 'masters', 'All Fields', 'EUR 1181/month, cultural activities allowance', 'Under 30, excellent academic record', '2025-01-10', 'https://www.campusfrance.org/en/eiffel-scholarship-program-of-excellence', 'French government excellence scholarship program', 3.20),

('Summer School HKUST', 'Hong Kong', 'HKUST', 'summer_school', 'undergraduate', 'Engineering, Business, Science', 'Partial scholarship, accommodation, meals', 'Undergraduate students, GPA requirement', '2025-03-15', 'https://www.ust.hk', 'Summer research program at top Hong Kong university', 3.00),

('NUS Singapore Summer Workshop', 'Singapore', 'National University of Singapore', 'summer_school', 'undergraduate', 'All Fields', 'Accommodation, meals, cultural activities', 'Undergraduate, academic excellence', '2025-02-28', 'https://www.nus.edu.sg', 'Summer workshop at National University of Singapore', 3.20),

('POSTECH Summer Program Korea', 'South Korea', 'POSTECH', 'summer_school', 'undergraduate', 'Science, Engineering', 'Accommodation, stipend, meals', 'Undergraduate STEM students', '2025-03-31', 'https://www.postech.ac.kr', 'Research summer program at POSTECH Korea', 3.00),

('MIT Summer Research Program', 'United States', 'MIT', 'summer_school', 'undergraduate', 'Science, Engineering, Technology', 'Stipend USD 4500, housing, meals', 'Undergraduate, strong academic record', '2025-02-01', 'https://www.mit.edu', 'Summer research experience at MIT', 3.50),

('ETH Zurich Summer Research', 'Switzerland', 'ETH Zurich', 'summer_school', 'undergraduate', 'STEM', 'CHF 1600/month stipend, housing', 'Undergraduate STEM, top 10% of class', '2025-01-15', 'https://www.ethz.ch', 'Research internship at ETH Zurich Switzerland', 3.50),

('University of Tokyo Internship', 'Japan', 'University of Tokyo', 'summer_school', 'undergraduate', 'All Fields', 'JPY 150000 stipend, accommodation', 'Undergraduate students, academic excellence', '2025-04-30', 'https://www.u-tokyo.ac.jp', 'Summer internship program at University of Tokyo', 3.00),

('Aga Khan Foundation Scholarship', 'Various', 'Partner Universities Worldwide', 'fully_funded', 'masters', 'Development Related Fields', 'Full funding, living costs, commitment to return', 'Bangladesh nationals, development sector work experience', '2025-03-31', 'https://www.akdn.org/our-agencies/aga-khan-foundation/social-development/scholarships', 'Need-based scholarship for high potential students', 3.00),

('GREAT Scholarship UK', 'United Kingdom', 'Various UK Universities', 'partial', 'masters', 'All Fields', 'GBP 10000 tuition contribution', 'Bangladesh nationals, offer from UK university', '2025-05-01', 'https://study-uk.britishcouncil.org/scholarships-funding/great-scholarships', 'British Council and UK university scholarship', 3.00),

('Taiwan ICDF Scholarship', 'Taiwan', 'Various Taiwanese Universities', 'government', 'masters', 'All Fields', 'Full tuition, USD 800/month, housing, insurance', 'Bangladesh nationals, under 40, relevant background', '2025-03-31', 'https://www.icdf.org.tw', 'Taiwan government scholarship for developing countries', 2.80),

('Russia Government Scholarship', 'Russia', 'Various Russian Universities', 'government', 'masters', 'All Fields', 'Full tuition, RUB 1500/month stipend, accommodation', 'Bangladesh nationals, under 30, academic record', '2025-02-15', 'https://russia.study', 'Russian government quota scholarship for Bangladesh', 2.50),

('Italian Government Scholarship', 'Italy', 'Various Italian Universities', 'government', 'masters', 'All Fields', 'EUR 900/month, tuition waiver, health insurance', 'Under 28, academic excellence, Italian/English proficiency', '2025-01-31', 'https://www.esteri.it/en/opportunities/scholarships', 'Italian government scholarship for international students', 3.00),

('Erasmus+ Mobility Bangladesh', 'Europe', 'Various EU Universities', 'erasmus', 'undergraduate', 'All Fields', 'Monthly allowance EUR 700-1000, travel support', 'Enrolled in partner Bangladeshi university', '2025-03-01', 'https://erasmus-plus.ec.europa.eu', 'EU student exchange mobility program', 2.50),

('Polish Government Scholarship', 'Poland', 'Various Polish Universities', 'government', 'masters', 'All Fields', 'PLN 1250/month, tuition waiver', 'Bangladesh nationals, academic record', '2025-04-30', 'https://nawa.gov.pl/en', 'Polish government scholarship for international students', 2.80),

('Czech Government Scholarship', 'Czech Republic', 'Various Czech Universities', 'government', 'masters', 'All Fields', 'CZK 14000/month, tuition waiver, accommodation', 'Bangladesh nationals, academic record', '2025-09-30', 'https://www.msmt.cz', 'Czech government scholarship for developing countries', 2.50),

('Romanian Government Scholarship', 'Romania', 'Various Romanian Universities', 'government', 'masters', 'All Fields', 'Full tuition, RON 1500/month, accommodation', 'Bangladesh nationals, academic record', '2025-03-15', 'https://www.robursa.mae.ro', 'Romanian government scholarship for international students', 2.50),

('Slovak Government Scholarship', 'Slovakia', 'Various Slovak Universities', 'government', 'masters', 'All Fields', 'EUR 350-500/month, tuition waiver', 'Bangladesh nationals, academic record', '2025-10-31', 'https://www.scholarships.sk', 'Slovak government scholarship program', 2.50),

('Malaysian Government Scholarship', 'Malaysia', 'Various Malaysian Universities', 'government', 'masters', 'All Fields', 'Full tuition, MYR 1500/month, accommodation', 'Bangladesh nationals, under 35, academic record', '2025-04-30', 'https://biasiswa.mohe.gov.my', 'Malaysian government scholarship for developing countries', 2.80),

('Singapore Government Scholarship', 'Singapore', 'NUS NTU SMU', 'government', 'masters', 'STEM, Business, Policy', 'Full tuition, SGD 2000/month, housing allowance', 'Academic excellence, leadership potential', '2025-06-30', 'https://www.moe.gov.sg', 'Singapore government merit scholarship', 3.50),

('Abu Dhabi ADEC Scholarship UAE', 'UAE', 'UAE Universities', 'government', 'masters', 'Education, STEM', 'Full tuition, AED 4000/month, housing', 'Bangladesh nationals, education/STEM background', '2025-03-01', 'https://www.adec.ac.ae', 'Abu Dhabi Education Council scholarship', 3.00),

('Kuwait Government Scholarship', 'Kuwait', 'Kuwait University', 'government', 'masters', 'All Fields', 'Full tuition, KWD 250/month, accommodation', 'Bangladesh nationals, academic record', '2025-05-31', 'https://www.kuniv.edu', 'Kuwait government scholarship for international students', 2.50),

('QS Scholarship GSLS Germany', 'Germany', 'GSLS Wurzburg', 'fully_funded', 'phd', 'Life Sciences', 'Full tuition, EUR 1200/month, research support', 'Masters in life sciences, research proposal', '2025-01-31', 'https://www.gsls.de', 'Graduate School of Life Sciences PhD scholarship', 3.20),

('Helmholtz Research Fellowship', 'Germany', 'Helmholtz Centers', 'fully_funded', 'phd', 'Science, Engineering', 'EUR 1365/month, research costs, travel', 'Masters degree, research proposal, supervisor agreement', '2025-03-31', 'https://www.helmholtz.de', 'Helmholtz Association research fellowship Germany', 3.00),

('Marie Curie Fellowship EU', 'Europe', 'Various EU Institutions', 'fully_funded', 'phd', 'All Fields', 'Living allowance EUR 3400/month, mobility allowance', 'Less than 8 years research experience', '2025-09-11', 'https://marie-sklodowska-curie-actions.ec.europa.eu', 'European Commission prestigious research fellowship', 3.50),

('TWAS Research Grant', 'Various', 'South Partner Universities', 'partial', 'phd', 'Science, Technology', 'Research grant USD 15000, equipment support', 'Scientists in developing countries, research proposal', '2025-04-30', 'https://twas.org', 'TWAS grant for scientists in developing world', 3.00),

('Islamic Development Bank Scholarship', 'Various', 'Partner Universities', 'fully_funded', 'masters', 'Development, STEM', 'Full tuition, living allowance, health insurance', 'Muslim, IDB member country, under 35', '2025-03-31', 'https://www.isdb.org/scholarship-programme', 'IsDB merit scholarship for Muslim majority countries', 3.00),

('OPEC Fund Scholarship', 'Various', 'Partner Universities', 'fully_funded', 'masters', 'Development Related', 'Full tuition, USD 1500/month, travel', 'OPEC fund member country, development focus', '2025-04-30', 'https://opecfund.org', 'OPEC Fund international development scholarship', 3.00),

('Rotary Peace Fellowship', 'Various', 'Rotary Partner Universities', 'fully_funded', 'masters', 'Peace, Development, Social Work', 'Full tuition, living costs, travel, internship', 'Work experience in peace related field', '2025-05-15', 'https://www.rotary.org/en/our-programs/peace-fellowships', 'Rotary Foundation scholarship for peacebuilders', 3.00),

('Hubert Humphrey Fellowship USA', 'United States', 'Various US Universities', 'fully_funded', 'masters', 'Public Policy, Development', 'Full tuition, living stipend, professional development', 'Mid-career professionals, leadership experience', '2025-10-01', 'https://www.humphreyfellowship.org', 'US government fellowship for emerging leaders', 3.00),

('EduFrance Eiffel Doctoral', 'France', 'French Universities', 'fully_funded', 'phd', 'All Fields', 'EUR 1400/month, health insurance, return ticket', 'Under 30, research proposal, supervisor agreement', '2025-01-10', 'https://www.campusfrance.org', 'French excellence doctoral scholarship', 3.50),

('KAIST International Scholarship', 'South Korea', 'KAIST', 'fully_funded', 'masters', 'Science, Engineering, Technology', 'Full tuition, KRW 350000/month living', 'STEM background, research potential', '2025-03-31', 'https://www.kaist.ac.kr', 'KAIST Korea Advanced Institute scholarship', 3.20);