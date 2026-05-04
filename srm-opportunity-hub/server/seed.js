const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const HACKATHONS = [
  // ── NATIONAL ──
  {
    id: 'h1', name: 'Smart India Hackathon (SIH) 2027', org: 'AICTE / MoE / Govt of India',
    depts: ['all'], level: 'national', cat: 'cse',
    focus: 'Software & Hardware, AI, Cybersecurity, Health, AgriTech, Smart Cities',
    date: 'Aug–Dec 2027 (Internal: Aug, Finale: Nov–Dec)',
    rounds: ['Internal Campus Round', 'Idea Submission (SIH Portal)', 'Online Shortlisting', '36-hr Grand Finale'],
    roundDetail: 'Internal hackathon at college → top 30 teams nominated by institution → idea submission on SIH portal → online evaluation by nodal experts → 36-hour offline Grand Finale at 60+ host colleges. Team of 6 (min 1 female). All engineering branches eligible.',
    prize: '₹1 Lakh per winning PS', perks: 'Govt recognition, MoE visibility, startup incubation pathway',
    winners: [
      { ps: 'Heritage conservation full-stack prototype', sol: 'Radar Vision team — multi-layer full-stack with AI tagging + ML search, won SIH 2024' },
      { ps: 'Judicial database NLP search (DR716)', sol: 'spaCy + BERT keyword search for legal case retrieval, SIH 2022 winner' },
    ],
    tip: 'All departments eligible — choose PS matching your branch. Mech/Civil students can target hardware PS. Pick less-popular PS for better odds.',
    link: 'https://www.sih.gov.in', jobs: false
  },

  {
    id: 'h2', name: 'TCS CodeVita (Season 13)', org: 'Tata Consultancy Services',
    depts: ['cse', 'ece'], level: 'national', cat: 'cse',
    focus: 'Competitive coding, algorithms, data structures, graph problems',
    date: 'Reg: Sep 2025 | Zone Rounds: Nov–Dec | Finale: 2026',
    rounds: ['Pre-Qualifier (24-hr, 6 Qs)', 'Qualifier (6-hr, 6 Qs)', 'Final Round', 'Grand Finale (in-person)'],
    roundDetail: "World's largest coding contest (537k+ participants). Pre-Qualifier: 24-hr window, 6 problems online → Qualifier: 6-hr time-bound, harder problems → Final round → Grand Finale in-person at TCS center. Graduating 2026–2029 eligible.",
    prize: '$20,000 top 3 — $10k / $6k / $4k', perks: 'Direct TCS Ninja/Digital/Prime hiring, Guinness record participation, global rank',
    winners: [
      { ps: 'Beetle shortest path on cube surface (geometry + graph)', sol: 'Parameterized arc calculations on 3D surface — C++ with precision geometry' },
      { ps: 'DP + string manipulation combos', sol: 'Top coders use C++ STL; Python acceptable for easy-medium questions' },
    ],
    tip: 'Solve MockVita practice rounds first. C++ preferred for speed. Easy→Medium→Hard order. No negative marking.',
    link: 'https://www.tcscodevita.com', jobs: true
  },

  {
    id: 'h3', name: 'Infosys HackWithInfy 2026', org: 'Infosys',
    depts: ['cse'], level: 'national', cat: 'cse',
    focus: 'AI-powered solutions, GenAI, smart automation, product building',
    date: 'Round 1: Mar 2026 | Grand Finale: Jul 2026 (48-hr, Infosys campus)',
    rounds: ['Round 1 – Online IAP Coding', 'Round 2 – Face-to-face coding', 'Grand Finale – 48-hr hackathon'],
    roundDetail: 'Register via college TPO. Round 1: 3 coding problems (easy→hard) on Infosys Assessment Platform → Top performers → R2: F2F coding at Infosys center, top 100 → Grand Finale: 48-hour team hackathon at Infosys campus, teams formed by Infosys. 2026 theme: AI solutions.',
    prize: '₹3L (1st) + ₹1.5L (2nd) + ₹1L (3rd)', perks: 'PPI for Specialist Programmer (₹9.5 LPA), Infosys internship',
    winners: [
      { ps: '2025 theme: SPACE (GenAI for space data)', sol: 'AI pipelines for satellite imagery analysis + anomaly detection' },
      { ps: '2026: AI-powered solutions', sol: 'Smart automation + GenAI working prototypes; ideas alone not enough' },
    ],
    tip: 'No CGPA cutoff. Register through TPO only. Focus Round 1: DSA, greedy, DP — 3 problems in increasing difficulty.',
    link: 'https://www.infosys.com/careers/hackwithinfy.html', jobs: true
  },

  {
    id: 'h4', name: 'Microsoft Imagine Cup 2027', org: 'Microsoft',
    depts: ['cse', 'ece'], level: 'national', cat: 'cse',
    focus: 'AI/ML startups on Azure, SaaS, social impact technology',
    date: 'Opens: Sep 2026 | MVP Deadline: Jan 2027 | Semifinals: Feb–Mar | Finals: Jun (MS Build)',
    rounds: ['Registration + team formation', 'MVP Round (15 slides + demo video)', 'Semifinals (5-min live pitch)', 'World Championship at MS Build'],
    roundDetail: 'Scale track (startup ≤$1M raised) or Launch track (early stage ≤$100k). Must use min 2 Microsoft AI services. Regional Finals: Singapore (Asia), Amsterdam (EMEA), Mexico City (Americas). Top 2 per region → World Championship.',
    prize: 'Scale: $100k + Satya Nadella mentorship | Launch: $50k', perks: 'Azure credits, MS for Startups partnership, global visibility, MS Build invite',
    winners: [
      { ps: 'Argus — AI predictive safety system (2025)', sol: 'Computer vision + Azure AI for industrial accident prevention; full working product' },
      { ps: 'V Bionic — hand paralysis rehab device (2022)', sol: 'Hardware + Azure ML for motor recovery therapy, won Saudi Arabia' },
    ],
    tip: 'Must show real user feedback. Judges score: Azure depth + inclusive design + customer validation + business viability.',
    link: 'https://imaginecup.microsoft.com', jobs: false
  },

  {
    id: 'h5', name: 'NASSCOM Hackathon 2027', org: 'NASSCOM',
    depts: ['cse', 'ece'], level: 'national', cat: 'it',
    focus: 'AI, digital transformation, India digital economy, industry-grade tech',
    date: 'Mar–Jul 2027 (Registration: Feb 2027)',
    rounds: ['Online Idea Screening', 'Prototype Submission', 'Regional Demo', 'Grand Finale'],
    roundDetail: '3 rounds: Online screening of ideas by NASSCOM panel → Working prototype submission → Regional demo at major cities (Delhi, Bangalore) → Grand Finale. Teams of 2–5. NASSCOM member companies sponsor problem statements covering fintech, healthtech, agritech.',
    prize: 'Cash prizes + NASSCOM industry recognition + startup ecosystem access',
    perks: 'Access to NASSCOM network (3000+ companies), MNC recruiter visibility, startup incubation pathway',
    winners: [
      { ps: 'AI-driven skill gap analysis for IT workforce', sol: 'NLP pipeline mapping job descriptions to skill profiles, deployed as SaaS HR dashboard' },
    ],
    tip: 'NASSCOM judges are industry veterans — include ROI and market size slide. Business viability = 40% of score.',
    link: 'https://nasscom.in', jobs: false
  },

  {
    id: 'h6', name: 'TechGig Code Gladiators 2027', org: 'TechGig (Times Group)',
    depts: ['cse', 'ece'], level: 'national', cat: 'cse',
    focus: 'Competitive coding — DSA, algorithms, system design scenarios',
    date: 'Apr–Jun 2027 (Registration: Mar 2027)',
    rounds: ['Online Coding Round 1', 'Semi-Final (timed)', 'Grand Finale (in-person Delhi/Bangalore)'],
    roundDetail: "3 rounds online then in-person finale. One of India's largest coding contests with 3L+ participants annually. Individual participation. Problems cover DSA, system design scenarios, and language-specific challenges. Finalists compete in Delhi or Bangalore.",
    prize: '₹20 Lakhs total prize pool + Gold Gladiator title',
    perks: 'TechGig leaderboard seen by 500+ companies, strong IT hiring signal',
    winners: [
      { ps: 'Graph shortest path with dynamic edge weights', sol: 'Modified Dijkstra with lazy deletion heap O((V+E)logV) in C++' },
    ],
    tip: 'TechGig has its own IDE — practice on the platform before contest day. Speed matters more than elegance here.',
    link: 'https://www.techgig.com', jobs: false
  },

  {
    id: 'h7', name: 'Capgemini Tech Challenge 2027', org: 'Capgemini',
    depts: ['cse', 'ece', 'eee'], level: 'national', cat: 'it',
    focus: '15+ tracks — cloud, AI, cybersecurity, sustainability, IoT',
    date: 'Mid 2027',
    rounds: ['Online Quiz', 'Coding Round', 'Case Study / Presentation', 'Grand Finale'],
    roundDetail: 'Multiple technology tracks. Online quiz screening → coding challenge → case study presentation → Grand Finale at Capgemini center judged by leadership. 15+ tracks including cloud, AI/ML, cybersecurity, sustainability, and digital transformation.',
    prize: '₹15 Lakhs total + career opportunities',
    perks: 'Capgemini job offer pathway, global network, multi-track flexibility',
    winners: [{ ps: 'Sustainable cloud migration for legacy system', sol: 'Green cloud architecture using AWS + carbon footprint API; won sustainability track' }],
    tip: 'Pick a niche track — less competition. Sustainability + AI convergence is trending for 2027.',
    link: 'https://www.capgemini.com', jobs: true
  },

  {
    id: 'h8', name: 'Accenture Innovation Challenge 2027', org: 'Accenture',
    depts: ['cse', 'ece', 'eee', 'mech'], level: 'national', cat: 'it',
    focus: 'AI, cloud, sustainability, enterprise digital transformation',
    date: 'Early 2027 (Jan–Feb reg, Finale: Mar–Apr)',
    rounds: ['Idea Submission', 'Mentoring Round (2 weeks)', 'Regional Finale', 'Global Grand Finale'],
    roundDetail: '4 rounds: Idea submission → shortlisted teams get Accenture mentor for 2 weeks → Regional Finale (India + Global tracks) → Top regional teams compete globally. Teams of 2–4. Must incorporate cloud technology. All engineering branches can participate.',
    prize: 'Cash prizes + Accenture internship/FTE pathway',
    perks: 'Accenture mentor pairing, cloud credits, global network, strong consulting+tech hiring signal',
    winners: [
      { ps: 'AI carbon footprint tracker for enterprises (2024)', sol: 'Azure ML + Power BI aggregating Scope 1/2/3 emissions; deployed as PoC at Accenture client' },
    ],
    tip: 'Frame idea as B2B SaaS for specific industry vertical — Accenture serves enterprise clients, not consumers.',
    link: 'https://www.accenture.com', jobs: true
  },

  {
    id: 'h9', name: 'Zoho Hackathon 2027', org: 'Zoho Corporation',
    depts: ['cse'], level: 'national', cat: 'dev',
    focus: 'Product building, full-stack, enterprise SaaS, UI/UX',
    date: 'Mid 2027 (varies annually)',
    rounds: ['Online Build Round', 'In-person Demo at Zoho campus (Tamil Nadu)'],
    roundDetail: 'Online build challenge → shortlisted teams invited to Zoho campus in Chennai or Tenkasi for in-person demo. Teams of 2–5. Zoho prizes expertise in its own tech stack — Zoho Creator, Zoho Cliq, Zoho APIs. High hiring conversion.',
    prize: 'Direct job offers + cash prizes',
    perks: 'Zoho job offer (₹6–12 LPA), Tamil Nadu campus visit, top product company in India',
    winners: [
      { ps: 'CRM pipeline automation tool', sol: 'Zoho Creator + Deluge scripting with custom ML lead scoring' },
      { ps: 'Real-time collaborative project management', sol: "Zoho Catalyst serverless + WebSocket — won 2023 edition" },
    ],
    tip: 'Learn Zoho Creator and Zoho APIs before applying — judges are Zoho engineers who value their own stack strongly.',
    link: 'https://www.zoho.com/careers', jobs: true
  },

  {
    id: 'h10', name: 'Flipkart GRiD 8.0', org: 'Flipkart',
    depts: ['cse', 'ece'], level: 'national', cat: 'it',
    focus: 'SDE, Applied AI, robotics, supply chain automation',
    date: 'Aug–Oct 2027 (Registration: Jul 2027)',
    rounds: ['Online Quiz (screening)', 'Level 1 – Coding', 'Level 2 – Problem Solving', 'Grand Finale (Flipkart campus, Bangalore)'],
    roundDetail: 'Level-wise elimination: Quiz → DSA coding round → Applied problem solving → Grand Finale at Flipkart Bangalore. Teams of 2. Three tracks: Software Development, AI/ML, and Robotics/Automation.',
    prize: '₹1.5L+ in vouchers + Direct PPI for high-pay SDE roles',
    perks: 'PPI for SDE roles (₹30–50 LPA range), Flipkart goodies, elite brand on resume',
    winners: [
      { ps: 'Computer vision for warehouse automation (GRiD 6.0)', sol: 'YOLO real-time object detection + barcode scanner for conveyor belt QC' },
    ],
    tip: 'CV/robotics track is less competitive than SDE. GRiD 8.0 likely to focus on GenAI + supply chain fusion.',
    link: 'https://www.flipkartgrid.com', jobs: true
  },

  {
    id: 'h11', name: 'DRDO Dare to Dream 2026', org: 'DRDO / Ministry of Defence',
    depts: ['all'], level: 'national', cat: 'gov',
    focus: 'Defense tech, robotics, cybersecurity, aerospace, embedded systems, sensors',
    date: 'Jul 2026 (Registration: May–Jun 2026)',
    rounds: ['Online Concept Submission', 'Shortlist Review (DRDO scientists)', 'Prototype Development Phase', 'Demo + Final Evaluation'],
    roundDetail: 'Open to all UG/PG students. Submit innovative ideas for defense applications: surveillance systems, robotics, cybersecurity tools, aerospace solutions. DRDO scientists shortlist and support teams with mentorship for prototype development. Final evaluation by DRDO panel.',
    prize: 'Cash prizes up to ₹10 Lakhs + DRDO recognition + patent support',
    perks: 'DRDO scientist mentorship, national defense recognition, strong core engineering portfolio, patent filing support',
    winners: [
      { ps: 'Autonomous surveillance drone for border monitoring', sol: 'Raspberry Pi + OpenCV + GPS-guided quadcopter with real-time RTSP video feed' },
      { ps: 'Underwater sonar anomaly detection (Mech/ECE)', sol: 'MEMS hydrophone array + FFT-based signal processing for object classification' },
    ],
    tip: 'All branches eligible. Mech/ECE/EEE students have strong advantage in hardware + embedded PS. Focus on deployable defense use cases.',
    link: 'https://drdo.gov.in', jobs: false
  },

  {
    id: 'h12', name: 'HackWithIndia 2027', org: 'HackWithIndia + Industry Partners',
    depts: ['cse', 'ece', 'eee'], level: 'national', cat: 'it',
    focus: 'Open innovation, AI, sustainability, fintech, health, social impact',
    date: 'Multiple events throughout 2027',
    rounds: ['Registration (Rolling)', 'Online Hackathon (24–48hr)', 'Demo/Hiring Stage'],
    roundDetail: '3 rounds: Registration → 24–48hr online hackathon with problem statements from industry sponsors → Demo stage + potential hiring consideration. Pan India, fully virtual format. Multiple themed editions per year. Teams of 1–5.',
    prize: 'Cash prizes + hiring opportunities from sponsor companies',
    perks: 'Industry sponsor hiring pipeline, flexible participation, beginner-friendly platform',
    winners: [{ ps: 'AI-based crop disease detection (AgriTech)', sol: 'MobileNet + React Native app for offline-capable plant disease diagnosis' }],
    tip: 'Good first hackathon — low entry barrier, multiple chances through the year. Strong base to build portfolio from.',
    link: 'https://hackwithindia.in', jobs: true
  },

  // ── INTERNATIONAL ──
  {
    id: 'h13', name: 'Google Solution Challenge 2027', org: 'Google / GDSC',
    depts: ['cse', 'ece'], level: 'international', cat: 'cse',
    focus: 'UN SDG-aligned solutions using Google Cloud, Gemini AI, Firebase',
    date: 'Jan–Jun 2027',
    rounds: ['Solution development (GDSC chapter)', 'Regional GDSC submission', 'Global Top 100 selection', 'Top 10 finalist demo + pitch'],
    roundDetail: 'Build via local GDSC chapter. Must address one of 17 UN SDGs using min 1 Google technology. Global judges shortlist Top 100 → Top 10 finalists present live demos. Teams of 1–4 students.',
    prize: 'Top 3: $3k–$12k + Google swag | All Top 10: mentorship + certificate',
    perks: 'Google engineer mentorship, GDSC recognition, global portfolio visibility',
    winners: [
      { ps: 'Carbon tracking — SDG 13', sol: 'Vertex AI + Firebase real-time personal carbon footprint tracker' },
      { ps: 'Rural telemedicine — SDG 3', sol: 'TF Lite + offline-first video consultation app for low-bandwidth areas' },
    ],
    tip: 'Must be GDSC member. Gemini + Vertex AI score highest in judges. Show real user testing evidence.',
    link: 'https://developers.google.com/community/gdsc-solution-challenge', jobs: false
  },

  {
    id: 'h14', name: 'NASA Space Apps Challenge 2027', org: 'NASA (Global)',
    depts: ['mech', 'ece', 'eee', 'cse'], level: 'international', cat: 'gov',
    focus: 'Space science, climate, satellite data, earth observation, aerospace systems',
    date: 'Oct 2027 (48-hr, Registration: Sep 2027)',
    rounds: ['Join local hub (Chennai active hub)', '48-hr hackathon (build)', 'Local judging → Global nomination', 'NASA global panel judging'],
    roundDetail: '48-hour hackathon simultaneously at 350+ cities worldwide. NASA provides open datasets: satellite imagery, JWST data, ISS telemetry, FIRMS fire data. Teams of 1–6. Local winners nominated to global judging. Final winners selected by NASA scientists.',
    prize: 'Global nomination by NASA + certificates + NASA community membership',
    perks: 'NASA engineer mentorship, NASA open data access, global credibility for aerospace/tech portfolios',
    winners: [
      { ps: 'Wildfire prediction using VIIRS satellite data', sol: 'Random Forest + LSTM ensemble on NASA FIRMS data; real-time fire risk map on GitHub' },
      { ps: 'Exoplanet atmosphere analysis (JWST data)', sol: 'ML pipeline on spectral data detecting biosignature candidates; won best use of data' },
    ],
    tip: 'Chennai has an active local hub. Mech/ECE/EEE students can target hardware + aerospace PS. Use real NASA APIs — judges are scientists.',
    link: 'https://www.spaceappschallenge.org', jobs: false
  },

  {
    id: 'h15', name: 'IBM Call for Code 2027', org: 'IBM',
    depts: ['cse', 'ece'], level: 'international', cat: 'ai',
    focus: 'Climate change, equitable resources, open-source AI using WatsonX',
    date: 'Throughout 2027 (Rolling submissions)',
    rounds: ['Ideation + open-source submission', 'Regional judging', 'Global shortlist (Top 5)', 'Open source contribution + final demo'],
    roundDetail: 'Build open-source solutions for climate change using IBM WatsonX or IBM Cloud. Individual or team (up to 5). Judged on: problem clarity, innovation, open-source quality, feasibility, social impact. Top 5 globally demo live to IBM panel.',
    prize: '$200k project funding for global winner + IBM incubation support',
    perks: 'Open-source credibility, IBM mentor access, GitHub visibility, potential real deployment by NGOs',
    winners: [
      { ps: 'Wildfire early warning (2023)', sol: 'IBM WatsonX + satellite imagery API for fire risk scoring; deployed as open-source' },
      { ps: 'Flood prediction for vulnerable communities', sol: 'ML pipeline on IBM Cloud + IoT sensor aggregation; adopted by NGO' },
    ],
    tip: 'Open-source is mandatory — keep a clean GitHub repo. WatsonX integration is required and scored heavily.',
    link: 'https://developer.ibm.com/callforcode', jobs: false
  },

  {
    id: 'h16', name: 'Google Summer of Code (GSoC) 2027', org: 'Google',
    depts: ['cse', 'ece'], level: 'international', cat: 'cse',
    focus: 'Open source contributions to top FOSS organizations worldwide',
    date: 'Jan–Aug 2027 (Proposal deadline ~Apr)',
    rounds: ['Org list published (Jan)', 'Proposal writing (Feb–Apr)', 'Community bonding (May)', 'Coding period (Jun–Aug)', 'Final evaluation (Aug)'],
    roundDetail: 'Individual project. Choose an open-source org (TensorFlow, Apache, Mozilla, etc.), contact mentors, submit detailed proposal. Work ~175–350 hrs with weekly check-ins. Must pass midterm + final evaluations.',
    prize: '$1,500–$6,600 USD stipend (~₹1.2L+ for Indian contributors)',
    perks: 'FOSS portfolio, strong resume signal, global open-source network, potential post-GSoC job offers',
    winners: [
      { ps: 'TF-Lite Android model optimization', sol: 'New quantization pipeline reducing model size 40% — merged into TF official repo' },
      { ps: 'Apache Beam IoT connector', sol: 'Java + Python SDK extension for real-time IoT pipeline; widely used post-GSoC' },
    ],
    tip: 'Contact mentors Jan–Feb before applications open. Strong proposal > strong code. Submit to 2–3 orgs max.',
    link: 'https://summerofcode.withgoogle.com', jobs: false
  },

  {
    id: 'h17', name: 'Meta Hacker Cup 2027', org: 'Meta (Facebook)',
    depts: ['cse'], level: 'international', cat: 'cse',
    focus: 'Competitive programming — algorithms, math, advanced graph + DP problems',
    date: 'Jun–Oct 2027 (multiple rounds)',
    rounds: ['Qualification Round (72-hr)', 'Round 1 (3-hr)', 'Round 2 (3-hr)', 'Round 3 (3-hr)', 'World Finals (USA, onsite)'],
    roundDetail: '5 rounds: Qualification (72-hr, 3 problems) → R1 (~10k advance) → R2 (~1k advance) → R3 (~100 advance) → World Finals onsite in USA (top 25). Individual. Problems: graph theory, computational geometry, DP with complex state spaces.',
    prize: '$20k (1st) + $10k (2nd) + $5k (3rd) + Meta gold T-shirt (round winners)',
    perks: 'Meta SWE hiring fast-track, global CP prestige, gold T-shirt (coveted in CP community)',
    winners: [
      { ps: 'Tree DP with centroid decomposition + HLD (Round 3 type)', sol: 'O(N log²N) heavy-light decomposition; winners write 200–300 line C++ solutions' },
    ],
    tip: 'Pure competitive programming — no product element. Practice Codeforces Div 1 + LeetCode Hard daily for 6+ months.',
    link: 'https://www.facebook.com/codingcompetitions', jobs: true
  },

  {
    id: 'h18', name: 'ETHGlobal Hackathons 2027', org: 'ETHGlobal',
    depts: ['cse'], level: 'international', cat: 'dev',
    focus: 'Ethereum, Web3, DeFi, zero-knowledge proofs, NFT infrastructure, blockchain',
    date: 'Multiple events 2027 (NYC, Paris, Singapore, Bangkok + online)',
    rounds: ['Registration + team formation', '48-hr Build Hackathon', 'Sponsor judging + demo', 'Prize distribution'],
    roundDetail: '48-hour in-person or virtual hackathons by ETHGlobal. Sponsor companies (Uniswap, Polygon, Chainlink) each offer separate prizes. Teams build DeFi apps, NFT tooling, L2 solutions, or ZK proof circuits.',
    prize: 'Multiple sponsor prizes ($500–$5,000 each) + ETHGlobal NFT',
    perks: 'Web3 job access, on-chain portfolio proof, sponsor company hiring pipeline',
    winners: [
      { ps: 'ZK-proof private voting on Ethereum (2024)', sol: 'Circom circuit + Groth16 proving system for anonymous on-chain governance votes' },
    ],
    tip: 'Go deep on one sponsor protocol rather than building a generic dApp — judges are protocol engineers.',
    link: 'https://ethglobal.com', jobs: true
  },

  {
    id: 'h19', name: 'MLH Global Hack Week 2027', org: 'Major League Hacking',
    depts: ['cse', 'ece'], level: 'international', cat: 'dev',
    focus: 'Themed weekly hacks — AI, Web3, Open Source, Hardware, Productivity',
    date: 'Monthly events throughout 2027',
    rounds: ['Free registration', 'Weekly challenge submission', 'Community judging'],
    roundDetail: 'Monthly themed hackathon weeks — AI Week, Hardware Week, Web3 Week, OSS Week, etc. Free to participate. Community judged on MLH platform. Beginner-friendly — great first hackathon. Gateway to MLH Fellowship and global hackathon community.',
    prize: 'MLH badges + digital prizes + swag',
    perks: 'MLH community (10,000+ hackers), hackathon fellowship eligibility, beginner-to-advanced pathway',
    winners: [{ ps: 'AI study scheduler (AI Week 2024)', sol: 'Gemini API + Google Calendar for adaptive study plans from syllabus PDFs' }],
    tip: 'Perfect first hackathon. Build MLH portfolio across multiple weeks to qualify for MLH Fellowship.',
    link: 'https://mlh.io', jobs: false
  },

  {
    id: 'h20', name: 'HackMIT 2027', org: 'MIT',
    depts: ['cse', 'ece'], level: 'international', cat: 'cse',
    focus: 'Open theme — software, hardware, AI, social impact (any domain)',
    date: 'Sep 2027 (Application: Aug 2027)',
    rounds: ['Application screening (competitive)', '36-hr hackathon at MIT campus', 'Demo + judging'],
    roundDetail: '36-hour in-person hackathon at MIT Cambridge USA. Application-based (~30% acceptance). Teams of 1–4. Sponsors (Google, Jane Street, Citadel) offer category prizes. 1000+ hackers, world-class mentors.',
    prize: 'Category prizes from sponsors ($500–$3,000 per track)',
    perks: 'MIT campus experience, elite global hacker network, sponsor hiring pipeline',
    winners: [
      { ps: 'Real-time sign language translation (2023)', sol: 'MediaPipe hand tracking + LSTM for ASL→text translation; 94% accuracy' },
    ],
    tip: 'Apply early with strong portfolio. Winning a sponsor track is more achievable than overall — pick 2–3 relevant sponsor tracks.',
    link: 'https://hackmit.org', jobs: false
  },

  {
    id: 'h21', name: 'AngelHack Global Series 2027', org: 'AngelHack',
    depts: ['cse', 'ece', 'mech'], level: 'international', cat: 'dev',
    focus: 'Startup-focused innovation — AI, fintech, health, climate, developer tools',
    date: 'Multi-city 2027 (Asia, US, Europe + Virtual)',
    rounds: ['Local City Hackathon (48-hr)', 'Regional Demo Day', 'Global Demo Day (top teams)'],
    roundDetail: '4 rounds: Local city 48-hr hackathon → local winners → Regional Demo Day → Global Demo Day before VCs and press. Chennai and Bangalore are active India hubs. Startup-ready ideas over pure tech.',
    prize: 'Cash prizes + VC introductions + HACKcelerator accelerator program',
    perks: 'Startup investor visibility, HACKcelerator program entry, global tech community',
    winners: [
      { ps: 'AI tutor for tier-2/3 city students (2024 India hub)', sol: 'WhatsApp chatbot using Mistral + RAG on NCERT textbooks; 50k+ active users' },
    ],
    tip: 'AngelHack is startup-first. Bring a business model, monetization plan, and traction. Judges ask: who pays for this?',
    link: 'https://angelhack.com', jobs: false
  },

  {
    id: 'h22', name: 'TechCrunch Disrupt Hackathon 2027', org: 'TechCrunch',
    depts: ['cse', 'ece'], level: 'international', cat: 'dev',
    focus: 'Startup-grade innovation — any domain, high business impact ideas',
    date: 'Sep 2027 (San Francisco, Registration: Aug 2027)',
    rounds: ['Application to participate', '24-hr Hackathon (SF, in-person)', 'Live pitch to TechCrunch Disrupt audience'],
    roundDetail: '24-hr in-person hackathon at TechCrunch Disrupt in San Francisco. Application-based. Teams of 1–5 build from scratch. Winners pitch to 10,000+ audience including VCs and press. Several billion-dollar companies started here.',
    prize: 'Sponsor prizes + media coverage + VC investor attention',
    perks: 'TechCrunch media exposure, VC meetings, Disrupt conference access',
    winners: [
      { ps: 'AI-powered B2B contract intelligence (2024)', sol: 'LLM pipeline extracting clauses + risk flags from enterprise contracts; signed 3 pilots at Disrupt' },
    ],
    tip: 'Disrupt rewards ideas that could be companies. Prepare a business pitch, not just a tech demo. Audience includes journalists and investors.',
    link: 'https://techcrunch.com/events', jobs: false
  },
];

const INTERNSHIPS = [
  // CSE/IT focused
  {
    id: 'i1', name: 'Google Software Engineering Internship', org: 'Google', depts: ['cse'], level: 'international',
    focus: 'Software Engineering, ML, Cloud infrastructure, Product',
    date: 'Deadline: Dec–Jan | Duration: 10–12 weeks',
    mode: 'Hybrid (India/Global)', eligibility: '3rd/4th year students',
    selection: 'Resume → Coding Assessment → Technical Interview(s)',
    stipend: '₹80,000/month',
    tip: 'Google interviews are algorithm-heavy. Practice LeetCode Medium/Hard, system design, and behavioral STAR questions.',
    link: 'https://careers.google.com', jobs: true
  },

  {
    id: 'i2', name: 'Microsoft Explore Internship', org: 'Microsoft', depts: ['cse'], level: 'international',
    focus: 'SDE, Program Management, UX Design',
    date: 'Deadline: Dec | Duration: 8–12 weeks',
    mode: 'Hybrid (Global)', eligibility: '2nd/3rd year students',
    selection: 'Test → Technical Interview → HR',
    stipend: '₹75,000/month',
    tip: "Explore is Microsoft's flagship student program — targets early-stage (2nd/3rd year). Great Azure project exposure.",
    link: 'https://careers.microsoft.com', jobs: true
  },

  {
    id: 'i3', name: 'Amazon SDE Internship', org: 'Amazon', depts: ['cse', 'ece'], level: 'international',
    focus: 'Software Development Engineering, AWS, Machine Learning',
    date: 'Deadline: Jan | Duration: 8–12 weeks',
    mode: 'Hybrid (India/Global)', eligibility: '3rd/4th year CS/IT',
    selection: 'Online Assessment (2 rounds) → Technical Interview',
    stipend: '₹70,000/month',
    tip: "Amazon OA uses 2 coding problems + work-style questions. Focus on LeetCode Medium DSA. Amazon's 16 Leadership Principles are asked in every round.",
    link: 'https://amazon.jobs', jobs: true
  },

  {
    id: 'i4', name: 'Meta SWE Internship', org: 'Meta (Facebook)', depts: ['cse'], level: 'international',
    focus: 'Software Engineering, AI/ML, Infrastructure, Product',
    date: 'Deadline: Dec | Duration: 10–12 weeks',
    mode: 'Hybrid (Global)', eligibility: '3rd/4th year CS students',
    selection: 'Coding Interview → Technical Interview',
    stipend: '₹90,000/month',
    tip: 'Meta focuses heavily on system design for interns. Know graphs, trees, and DP deeply. Meta SWE roles are highly sought after globally.',
    link: 'https://careers.meta.com', jobs: true
  },

  {
    id: 'i5', name: 'OpenAI AI Research Internship', org: 'OpenAI', depts: ['cse'], level: 'international',
    focus: 'AI/ML research, LLM training, alignment, safety engineering',
    date: 'Deadline: Jan | Duration: 12 weeks',
    mode: 'Hybrid (Global)', eligibility: 'UG/PG with strong ML background',
    selection: 'Resume → Technical Interview → Research Discussion',
    stipend: '₹1,00,000/month (approx)',
    tip: 'Extremely competitive. Strong ML research background + publication preferred. Build AI projects and link them in your application.',
    link: 'https://openai.com/careers', jobs: true
  },

  {
    id: 'i6', name: 'IBM Research Internship', org: 'IBM', depts: ['cse', 'ece'], level: 'international',
    focus: 'AI, cloud, quantum computing, data science, enterprise tech',
    date: 'Deadline: Rolling | Duration: 8–12 weeks',
    mode: 'Hybrid (Global)', eligibility: 'UG/PG all streams',
    selection: 'Aptitude → Technical rounds',
    stipend: '₹30,000/month',
    tip: 'IBM has research centers in Bangalore and Hyderabad. Focus on WatsonX and cloud for best project assignments.',
    link: 'https://www.ibm.com/careers', jobs: true
  },

  {
    id: 'i7', name: 'Adobe Engineering Internship', org: 'Adobe', depts: ['cse'], level: 'international',
    focus: 'Creative AI, document intelligence, full-stack, mobile development',
    date: 'Deadline: Dec–Jan | Duration: 8–12 weeks',
    mode: 'Hybrid (India/Global)', eligibility: 'UG/PG CS/IT',
    selection: 'Coding Assessment → Technical Interview',
    stipend: '₹50,000–80,000/month',
    tip: 'Adobe Noida and Bangalore offices hire strongly from South India colleges. Adobe PDF Services experience is a bonus.',
    link: 'https://www.adobe.com/careers', jobs: true
  },

  {
    id: 'i8', name: 'Salesforce Internship', org: 'Salesforce', depts: ['cse'], level: 'international',
    focus: 'CRM development, Apex, Einstein AI, Agentforce',
    date: 'Deadline: Jan | Duration: 10–12 weeks',
    mode: 'Hybrid (Global)', eligibility: 'UG/PG',
    selection: 'Coding Assessment → Interview',
    stipend: '₹70,000/month',
    tip: 'Get Salesforce Developer Edition + Trailhead certifications before applying — they check your Trailhead rank.',
    link: 'https://careers.salesforce.com', jobs: true
  },

  {
    id: 'i9', name: 'Goldman Sachs Engineering Internship', org: 'Goldman Sachs', depts: ['cse'], level: 'international',
    focus: 'Quantitative engineering, financial systems, distributed computing',
    date: 'Deadline: Dec | Duration: 10 weeks',
    mode: 'Hybrid (Global)', eligibility: 'UG/PG',
    selection: 'Aptitude → Coding → Technical Interview',
    stipend: '₹80,000–100,000/month',
    tip: 'Goldman values maths + performance engineering. Know concurrency, Big-O, and probability. Financial domain knowledge = big advantage.',
    link: 'https://www.goldmansachs.com/careers', jobs: true
  },

  {
    id: 'i10', name: 'JPMorgan Chase SDE Internship', org: 'JPMorgan Chase', depts: ['cse'], level: 'international',
    focus: 'Financial technology, risk systems, data engineering, full-stack',
    date: 'Deadline: Dec | Duration: 10 weeks',
    mode: 'Hybrid (Global)', eligibility: 'UG/PG',
    selection: 'Coding Assessment → Technical Interview',
    stipend: '₹75,000/month',
    tip: 'JP Morgan values clean production-grade code. Code for Good hackathon participants get fast-tracked for internship.',
    link: 'https://careers.jpmorgan.com', jobs: true
  },

  {
    id: 'i11', name: 'TCS Internship', org: 'TCS', depts: ['cse', 'ece', 'eee', 'mech'], level: 'national',
    focus: 'Software development, AI, testing, cloud, digital transformation',
    date: 'Deadline: Rolling | Duration: 6–8 weeks',
    mode: 'Hybrid (India)', eligibility: 'UG/PG any engineering branch',
    selection: 'TCS Technical Discussion',
    stipend: '₹10,000/month',
    tip: 'TCS WILP (Work Integrated Learning Program) students get priority. Open to all branches for non-core IT roles.',
    link: 'https://www.tcs.com', jobs: true
  },

  {
    id: 'i12', name: 'Infosys Internship', org: 'Infosys', depts: ['cse', 'ece'], level: 'national',
    focus: 'Software engineering, QA, cloud, AI, digital transformation',
    date: 'Deadline: Jan | Duration: 8–12 weeks',
    mode: 'Hybrid (India)', eligibility: 'UG/PG engineering',
    selection: 'Aptitude + Technical Test → Interview',
    stipend: '₹20,000/month',
    tip: "Infosys InfyTQ platform certification boosts your chance. HackWithInfy top performers get internship as direct prize.",
    link: 'https://www.infosys.com', jobs: true
  },

  {
    id: 'i13', name: 'Wipro Engineering Internship', org: 'Wipro', depts: ['cse', 'ece'], level: 'national',
    focus: 'Full-stack, cloud, AI automation, enterprise consulting',
    date: 'Deadline: Rolling | Duration: 8 weeks',
    mode: 'Hybrid (India)', eligibility: 'UG/PG engineering',
    selection: 'Aptitude → Technical rounds',
    stipend: '₹15,000/month',
    tip: 'Wipro Elite NTH/Turbo programs have higher stipend. WILP integration available for eligible students.',
    link: 'https://careers.wipro.com', jobs: true
  },

  {
    id: 'i14', name: 'HCLTech Digital Internship', org: 'HCLTech', depts: ['cse', 'ece'], level: 'national',
    focus: 'Java, Spring Boot, enterprise applications, digital banking',
    date: 'Deadline: Rolling | Duration: 8 weeks',
    mode: 'Hybrid (India)', eligibility: 'UG/PG',
    selection: 'Test → Interview',
    stipend: '₹15,000/month',
    tip: 'HCLTech has a strong Java-heavy environment. Spring Boot + Microservices skills will land you the best project team.',
    link: 'https://www.hcltech.com/careers', jobs: true
  },

  {
    id: 'i15', name: 'Zoho Developer Internship', org: 'Zoho Corporation', depts: ['cse'], level: 'national',
    focus: 'Product development, full-stack, SaaS platforms, UI design',
    date: 'Deadline: Rolling | Duration: 6–12 weeks',
    mode: 'Offline/Hybrid (Tamil Nadu)', eligibility: 'Any degree — Zoho hires from all branches',
    selection: 'Aptitude → Coding → Interview',
    stipend: '₹25,000/month',
    tip: 'Zoho is one of the top product companies for Tamil Nadu students. Extremely high conversion from intern to FTE.',
    link: 'https://www.zoho.com/careers', jobs: true
  },

  {
    id: 'i16', name: 'Freshworks SWE Internship', org: 'Freshworks', depts: ['cse'], level: 'national',
    focus: 'CRM, ITSM, customer support SaaS, full-stack development',
    date: 'Deadline: Jan | Duration: 8–12 weeks',
    mode: 'Hybrid (Chennai)', eligibility: 'CSE/IT students',
    selection: 'Coding Assessment → Interview',
    stipend: '₹30,000/month',
    tip: 'Freshworks Chennai office hires heavily from Tamil Nadu colleges. Product API experience (Freshdesk/Freshservice) is a bonus.',
    link: 'https://www.freshworks.com/careers', jobs: true
  },

  {
    id: 'i17', name: 'Accenture Internship', org: 'Accenture', depts: ['cse', 'ece', 'eee', 'mech'], level: 'national',
    focus: 'Technology consulting, AI/ML, cloud, digital strategy',
    date: 'Deadline: Rolling | Duration: 8–12 weeks',
    mode: 'Hybrid (India)', eligibility: 'UG/PG all engineering branches',
    selection: 'Aptitude → Technical → HR',
    stipend: '₹20,000/month',
    tip: 'Accenture is open to all branches, not just CSE. Good entry point for non-CS students into IT consulting. Innovation Challenge winners get priority.',
    link: 'https://www.accenture.com', jobs: true
  },

  {
    id: 'i18', name: 'Deloitte Internship', org: 'Deloitte', depts: ['cse', 'ece', 'eee'], level: 'national',
    focus: 'Technology consulting, GenAI, data analytics, risk advisory',
    date: 'Deadline: Rolling | Duration: 8–12 weeks',
    mode: 'Hybrid (Global)', eligibility: 'UG/PG',
    selection: 'Resume → Case Interview → Technical',
    stipend: '₹25,000–40,000/month',
    tip: "Deloitte's consulting culture values business problem framing over just coding. GenW.AI platform knowledge is a plus.",
    link: 'https://www2.deloitte.com', jobs: true
  },

  // ECE/EEE focused
  {
    id: 'i19', name: 'Intel Hardware/Software Internship', org: 'Intel', depts: ['ece', 'eee'], level: 'national',
    focus: 'VLSI, embedded systems, AI hardware acceleration, OpenVINO',
    date: 'Deadline: Dec | Duration: 8–12 weeks',
    mode: 'Hybrid (India)', eligibility: 'ECE/EEE students',
    selection: 'Aptitude → Technical Interview',
    stipend: '₹40,000/month',
    tip: 'Intel Bangalore office focuses on hardware + AI acceleration. OpenVINO, FPGA, and VLSI knowledge will differentiate you.',
    link: 'https://jobs.intel.com', jobs: true
  },

  {
    id: 'i20', name: 'Qualcomm Internship', org: 'Qualcomm', depts: ['ece', 'eee'], level: 'national',
    focus: '5G, RF systems, VLSI, DSP, embedded firmware',
    date: 'Deadline: Jan | Duration: 8–12 weeks',
    mode: 'Hybrid (India)', eligibility: 'ECE/EEE students',
    selection: 'Technical Interview',
    stipend: '₹45,000–60,000/month',
    tip: 'Qualcomm Hyderabad office is the largest R&D center outside the US. Strong DSP + digital communications background required.',
    link: 'https://www.qualcomm.com/careers', jobs: true
  },

  {
    id: 'i21', name: 'Texas Instruments Internship', org: 'Texas Instruments', depts: ['ece', 'eee'], level: 'national',
    focus: 'Analog/digital IC design, embedded systems, power electronics',
    date: 'Deadline: Jan | Duration: 8–12 weeks',
    mode: 'Hybrid (India)', eligibility: 'ECE/EEE students',
    selection: 'Test → Technical Interview',
    stipend: '₹40,000–50,000/month',
    tip: 'TI Bangalore focuses on analog design + embedded software. WiSE@TI hackathon for women ECE/EEE students is a great entry point.',
    link: 'https://careers.ti.com', jobs: true
  },

  {
    id: 'i22', name: 'Broadcom Internship', org: 'Broadcom', depts: ['ece', 'eee'], level: 'international',
    focus: 'Networking silicon, ASIC design, storage, wireless',
    date: 'Deadline: Jan | Duration: 10 weeks',
    mode: 'Hybrid (Global)', eligibility: 'ECE/EEE UG/PG',
    selection: 'Technical Interview',
    stipend: '₹50,000/month',
    tip: 'Broadcom Pune/Bangalore offices. Focus on VLSI, ASIC verification, or networking protocol knowledge depending on team.',
    link: 'https://www.broadcom.com/company/careers', jobs: true
  },

  {
    id: 'i23', name: 'NVIDIA Internship', org: 'NVIDIA', depts: ['ece', 'cse'], level: 'international',
    focus: 'GPU architecture, CUDA, deep learning frameworks, AI acceleration',
    date: 'Deadline: Dec | Duration: 10–12 weeks',
    mode: 'Hybrid (Global)', eligibility: 'ECE/CSE UG/PG',
    selection: 'Technical rounds (GPU/ML focus)',
    stipend: '₹80,000/month',
    tip: 'NVIDIA hires for both hardware (GPU design) and software (CUDA, deep learning) roles. Strong ML + parallel computing background helps.',
    link: 'https://www.nvidia.com/careers', jobs: true
  },

  {
    id: 'i24', name: 'Cisco Networking Internship', org: 'Cisco', depts: ['ece', 'cse'], level: 'international',
    focus: 'Network engineering, cybersecurity, cloud infrastructure, AI-driven networking',
    date: 'Deadline: Jan | Duration: 8–12 weeks',
    mode: 'Hybrid (Global/India)', eligibility: 'ECE/CSE UG/PG',
    selection: 'Test → Technical Interview',
    stipend: '₹40,000–60,000/month',
    tip: 'Cisco Bangalore is a major R&D hub. CCNA certification before applying significantly boosts your profile.',
    link: 'https://jobs.cisco.com', jobs: true
  },

  {
    id: 'i25', name: 'Flipkart SDE Internship', org: 'Flipkart', depts: ['cse'], level: 'national',
    focus: 'Software Engineering, data infrastructure, AI/ML, product',
    date: 'Deadline: Jan | Duration: 8–10 weeks',
    mode: 'Hybrid (Bangalore)', eligibility: 'UG/PG CSE/IT',
    selection: 'Coding Assessment → Technical Interview',
    stipend: '₹60,000/month',
    tip: 'Flipkart GRiD hackathon winners get fast-tracked. Strong DSA + system design focus in interviews.',
    link: 'https://www.flipkartcareers.com', jobs: true
  },

  {
    id: 'i26', name: 'Razorpay SDE Internship', org: 'Razorpay', depts: ['cse'], level: 'national',
    focus: 'Fintech, payments infrastructure, backend engineering',
    date: 'Deadline: Jan | Duration: 6 months',
    mode: 'Hybrid (Bangalore)', eligibility: 'CSE/IT',
    selection: 'Coding Assessment → Interview',
    stipend: '₹50,000/month',
    tip: 'Razorpay hackathon participants get hiring consideration. Strong backend (Go/Java) + payments API knowledge valued.',
    link: 'https://razorpay.com/jobs', jobs: true
  },

  {
    id: 'i27', name: 'KPMG Technology Internship', org: 'KPMG', depts: ['cse', 'ece', 'eee'], level: 'national',
    focus: 'Data analytics, ESG tech, audit automation, consulting',
    date: 'Deadline: Rolling | Duration: 6–8 weeks',
    mode: 'Hybrid (Global)', eligibility: 'UG/PG',
    selection: 'Interview',
    stipend: '₹20,000–30,000/month',
    tip: 'KPMG values business + tech hybrid skills. ESG analytics + Power BI knowledge are trending for 2026–27 roles.',
    link: 'https://home.kpmg', jobs: true
  },
];

const CONTESTS = [
  // ── AUTOMOTIVE / MECHANICAL ──
  {
    id: 'c1', name: 'SAE BAJA India 2026', org: 'SAE India', depts: ['mech'], level: 'national',
    focus: 'Design, fabricate and race an off-road BAJA vehicle — suspension, drivetrain, chassis',
    date: 'Jun 2025 – Mar 2026 (Design Report: Oct, Event: Jan–Mar)',
    rounds: ['Virtual Round (design report + presentation)', 'Offline Event (static + dynamic judging)'],
    roundDetail: 'Teams design and build a single-seater off-road vehicle. Phase 1: Virtual design report (CAD, cost analysis, sales pitch) evaluated online → Phase 2: Offline event — static events (design, cost, presentation) + dynamic events (acceleration, hill climb, endurance race). Teams of 8–20.',
    prize: 'Championship trophy + industry sponsor recognition + best design awards',
    perks: 'Real vehicle fabrication experience, automotive industry network, core mechanical portfolio, recruiter visibility from Mahindra/Bosch/TI',
    tip: 'Start fabrication early — teams often run out of time. Weight reduction and reliability beat raw power. BAJA judges reward practical engineering.',
    link: 'https://www.bajasaeindia.org', jobs: false
  },

  {
    id: 'c2', name: 'SUPRA SAE India 2026', org: 'SAE India', depts: ['mech'], level: 'national',
    focus: 'Formula-style race car design and development — aerodynamics, suspension, powertrain',
    date: 'Jun 2025 – Aug 2026',
    rounds: ['Design presentation (virtual)', 'Vehicle scrutineering + static events', 'Dynamic performance events'],
    roundDetail: "Teams design and build a formula-style race car compliant with SAE SUPRA rulebook. Static events: design presentation, cost report, business presentation. Dynamic events: autocross, endurance, skidpad, acceleration. India's most prestigious student motorsport competition.",
    prize: 'Overall championship + category trophies + industry internship offers',
    perks: "India's most prestigious student motorsport event, direct auto industry visibility (TVS, Bosch, Renault recruit here), strongest mechanical portfolio builder",
    tip: 'Aero + suspension geometry are judges\' primary focus. Cost report and business case presentation carry 30% weightage — don\'t skip them.',
    link: 'https://www.supraindia.org', jobs: false
  },

  {
    id: 'c3', name: 'Shell Eco-marathon 2026', org: 'Shell', depts: ['mech'], level: 'international',
    focus: 'Design and build most energy-efficient vehicle — fossil fuel, hydrogen, or electric',
    date: 'Feb – Jul 2026',
    rounds: ['Technical regulations compliance check', 'Official timing runs (efficiency measurement)', 'Off-track judging (design + communications)'],
    roundDetail: 'Build the most energy-efficient vehicle. Three categories: Prototype (ultra-streamlined), Urban Concept (car-like), Battery Electric. Efficiency measured in km/kWh or km/litre equivalent. Asia event in Bangalore for Indian teams.',
    prize: 'Efficiency category winner + Drivers World Championship invitation',
    perks: 'Shell brand recognition, global sustainability portfolio, energy engineering practical experience',
    tip: 'Aerodynamics + rolling resistance are everything. Even small bearing improvements matter. Prototype category is most competitive but also most prestigious.',
    link: 'https://www.shellecomarathon.com', jobs: false
  },

  {
    id: 'c4', name: 'Hyundai Innovation Challenge 2026', org: 'Hyundai Motor India Ltd (Chennai)', depts: ['mech'], level: 'national',
    focus: 'Smart mobility, vehicle electrification, connected vehicle systems, EV design',
    date: 'Jun–Aug 2026',
    rounds: ['Online idea submission', 'Shortlist review by Hyundai engineers', 'Finalist presentation at Hyundai India HQ'],
    roundDetail: 'Submit innovative ideas addressing Hyundai\'s focus areas: EV systems, smart mobility, ADAS, connected vehicle tech. Shortlisted teams present to Hyundai engineering leads at their Chennai/Gurugram office.',
    prize: 'Cash prizes + Hyundai internship consideration',
    perks: 'Hyundai India R&D exposure, Chennai location (nearby), automotive engineering portfolio, potential internship at Hyundai HMIE',
    tip: 'Hyundai India focuses on EV and connected mobility. Frame ideas around their E-GMP platform or IONIQ family challenges.',
    link: 'https://link-innovations.wiin.io/en/login?backTo=%2Fen%2Fapplications%2Fhyundai-innovation-challenge', jobs: true
  },

  {
    id: 'c5', name: 'Ashok Leyland Hackathon 2026', org: 'Ashok Leyland Ltd (Chennai)', depts: ['mech'], level: 'national',
    focus: 'Commercial vehicle design, manufacturing optimization, electric trucks, sustainability',
    date: 'Jul 2026',
    rounds: ['Online submission (problem statement + approach)', 'Technical evaluation', 'Finale at Ashok Leyland plant'],
    roundDetail: 'Solve industry problems in manufacturing and commercial automotive engineering. Problem statements cover: bus/truck body design, EV drivetrain optimization, manufacturing process automation, supply chain innovation. Teams present to Ashok Leyland engineering team.',
    prize: 'Cash prizes + Ashok Leyland internship pathway',
    perks: 'Ashok Leyland Chennai plant visit, commercial vehicle sector exposure, strong Tamil Nadu industry connection',
    tip: 'Ashok Leyland is a Chennai-based company — strong local advantage for SRM TRP students. Focus on practical, cost-effective solutions for commercial vehicles.',
    link: 'https://www.ashokleyland.com', jobs: true
  },

  {
    id: 'c6', name: 'L&T Techgium 2026', org: 'Larsen & Toubro Limited', depts: ['mech', 'civil', 'eee'], level: 'national',
    focus: 'Core engineering problem solving — manufacturing, construction, energy, automation',
    date: 'Aug–Oct 2026 (Registration: Jul)',
    rounds: ['Online Idea Submission', 'L&T Technical Panel Review', 'Regional Demo Day', 'Grand Finale at L&T campus'],
    roundDetail: "One of India's most prestigious engineering innovation contests. Problem statements from L&T's businesses: heavy engineering, construction, energy, defense, electrical. Teams of UG/PG engineering students submit solutions. Regional demos → Grand Finale at L&T's engineering campus.",
    prize: '₹5L+ total prizes + L&T internship + pre-placement consideration',
    perks: 'L&T engineering campus experience, pre-placement interview, core engineering portfolio builder, strong resume signal for infrastructure roles',
    tip: 'L&T judges value practical deployability. Mech, Civil, and EEE students have a natural advantage here. Reference actual L&T project data in your solution.',
    link: 'https://lnttechgium.com', jobs: true
  },

  {
    id: 'c7', name: 'Siemens Design Challenge 2026', org: 'Siemens Energy Ltd', depts: ['mech', 'eee'], level: 'national',
    focus: 'Energy systems, turbine efficiency, grid automation, industrial digitalization',
    date: 'Sep 2026',
    rounds: ['Concept submission', 'Technical evaluation by Siemens engineers', 'Shortlist presentation'],
    roundDetail: 'Focus on energy systems — steam turbines, wind systems, grid energy management, electrification of industrial processes. EEE and Mech students both have strong tracks. Siemens provides technical mentorship for shortlisted teams.',
    prize: 'Cash prizes + Siemens mentorship + potential internship',
    perks: 'Siemens brand, energy sector exposure, strong for EEE/Mech students targeting power/automation industry',
    tip: 'Siemens values solutions that improve energy efficiency measurably. Quantify your solution: "X% efficiency gain", "Y% carbon reduction".',
    link: 'https://immersive-design-challenge.com', jobs: false
  },

  {
    id: 'c8', name: 'Bosch Mobility Challenge 2026', org: 'Bosch India', depts: ['mech', 'ece'], level: 'national',
    focus: 'Automotive systems, ADAS, connected mobility, automation, IoT for vehicles',
    date: 'Aug–Oct 2026',
    rounds: ['Online concept submission', 'Technical review', 'Finalist demo'],
    roundDetail: 'Bosch focuses on automotive electronics, ADAS systems, connected vehicle technologies, and manufacturing automation. Both Mech (powertrain, chassis) and ECE (embedded, sensors, communication) students eligible.',
    prize: 'Cash prizes + Bosch internship consideration',
    perks: 'Bosch brand, automotive electronics exposure, strong for Mech + ECE students, Bosch Coimbatore plant networking',
    tip: 'Bosch values precision engineering — avoid vague ideas. Reference their actual product lines (ABS, ESC, radar sensors) in your proposal.',
    link: 'https://www.bosch.in', jobs: true
  },

  {
    id: 'c9', name: 'Mahindra Rise Challenge 2026', org: 'Mahindra & Mahindra', depts: ['mech'], level: 'national',
    focus: 'Sustainable mobility, electric vehicles, farm equipment innovation, SUV engineering',
    date: 'Aug 2026',
    rounds: ['Online submission', 'Technical shortlist', 'Presentation to Mahindra R&D team'],
    roundDetail: 'Annual innovation challenge from Mahindra. Focus areas: sustainable mobility, EV systems, smart farm equipment, lightweight vehicle structures. Teams of 2–4. Mahindra provides mentorship for shortlisted teams.',
    prize: 'Cash prizes + Mahindra internship pathway',
    perks: "Mahindra brand, EV + agricultural engineering exposure, India's leading SUV/tractor company portfolio",
    tip: 'Mahindra targets Bharat-focused sustainable mobility. Ideas combining EV tech with rural applicability score highly.',
    link: 'https://risechallenge.mahindra.com', jobs: true
  },

  {
    id: 'c10', name: 'Valeo Innovation Challenge 2026', org: 'Valeo India Pvt Ltd', depts: ['mech', 'ece'], level: 'international',
    focus: 'Smart automotive technologies — electrification, lighting, ADAS, thermal management',
    date: 'Jan–Jun 2026',
    rounds: ['Global online submission (students worldwide)', 'Technical evaluation + jury review', 'Finalist presentation'],
    roundDetail: 'International competition run by Valeo. Students submit innovations for next-generation automotive technologies — EV thermal management, smart lighting, ADAS sensors, electrified powertrains. Both Mech and ECE eligible. Global jury of Valeo engineers.',
    prize: '€5,000 (1st) + Valeo internship + international recognition',
    perks: 'Global automotive industry recognition, French-Indian automotive brand, strong ECE/Mech international portfolio piece',
    tip: 'Valeo is strong in lighting and electrification — focus on those domains. International competition = strong portfolio even as semifinalist.',
    link: 'https://valeoinnovationchallenge.valeo.com', jobs: true
  },

  {
    id: 'c11', name: 'Altair Simulation Challenge 2026', org: 'Altair Engineering', depts: ['mech'], level: 'national',
    focus: 'CAE simulation — FEA, CFD, structural optimization, multiphysics',
    date: 'Feb–May 2026',
    rounds: ['Online model submission (CAE/FEA/CFD)', 'Technical review by Altair engineers', 'Global winner selection'],
    roundDetail: 'Submit simulation-based engineering solutions using Altair tools (HyperWorks, OptiStruct, AcuSolve). Problems span structural mechanics, fluid dynamics, electromagnetics, manufacturing simulation. Altair provides free student software licenses.',
    prize: 'Cash prizes + Altair software licenses + global recognition',
    perks: 'CAE simulation portfolio, Altair tool certifications, strong for Mech students targeting automotive/aerospace industry',
    tip: 'Altair provides free academic licenses — download and practice HyperWorks before submission. Topology optimization submissions score very well.',
    link: 'https://altairuniversity.com', jobs: false
  },

  {
    id: 'c12', name: 'Bajaj Innovation Challenge 2026', org: 'Bajaj Auto Limited', depts: ['mech'], level: 'national',
    focus: 'Two-wheeler design, EV performance, lightweight engineering, urban mobility',
    date: 'Sep–Nov 2026',
    rounds: ['Online submission', 'Technical shortlisting', 'Presentation at Bajaj Pune/Nashik plant'],
    roundDetail: 'Submit innovative ideas for next-generation two-wheelers — EV range extension, lightweight chassis design, connectivity features, safety systems. Bajaj focuses on practical, mass-producible solutions, not concept vehicles.',
    prize: 'Cash prizes + Bajaj internship + potential design credit',
    perks: "India's leading two-wheeler exporter brand, motorcycle engineering portfolio, Pune R&D team exposure",
    tip: 'Bajaj values cost-conscious engineering — "elegant engineering for masses" philosophy. Include BOM and manufacturing feasibility in submission.',
    link: 'https://www.bajajauto.com/careers', jobs: true
  },

  {
    id: 'c13', name: 'KUKA Robotics Challenge 2026', org: 'KUKA Robotics India', depts: ['mech', 'ece'], level: 'national',
    focus: 'Industrial robotics, automation, robot programming, Industry 4.0',
    date: 'Oct 2026',
    rounds: ['Online concept submission', 'Technical evaluation', 'Demo at KUKA India facility'],
    roundDetail: 'Design industrial automation solutions using robotic systems. Both mechanical design (gripper design, workspace optimization) and ECE/CS (robot programming, vision integration) tracks. KUKA provides access to their simulation software for shortlisted teams.',
    prize: 'Cash prizes + KUKA software license + industry recognition',
    perks: 'Industry 4.0 portfolio, robotics brand, strong for students targeting manufacturing automation careers',
    tip: 'Know ROS or KUKA KUKA|prc programming. Solutions targeting automotive assembly automation score highest.',
    link: 'https://www.kuka.com/en-in/careers', jobs: false
  },

  {
    id: 'c14', name: 'Honeywell Innovation Challenge 2026', org: 'Honeywell', depts: ['mech', 'eee', 'ece'], level: 'national',
    focus: 'Aerospace systems, building automation, industrial IoT, process safety',
    date: 'Aug 2026',
    rounds: ['Online idea submission', 'Technical screening', 'Finalist presentation to Honeywell R&D'],
    roundDetail: 'Open to Mech, EEE, and ECE students. Tracks: Aerospace technology, Building/Fire solutions, Industrial automation, Process controls. Honeywell Madurai facility (near SRM TRP) makes this especially relevant for local students.',
    prize: 'Cash prizes + Honeywell internship consideration',
    perks: 'Honeywell brand, Madurai facility proximity to SRM TRP, aerospace + industrial IoT portfolio',
    tip: 'Honeywell Madurai is their largest Indian facility — proximity advantage for SRM TRP students. Target industrial safety or process automation PS.',
    link: 'https://www.honeywell.com', jobs: true
  },

  {
    id: 'c15', name: 'ZF Mobility Challenge 2026', org: 'ZF India', depts: ['mech', 'ece'], level: 'national',
    focus: 'Drivetrain systems, chassis control, EV components, active safety',
    date: 'Sep–Nov 2026',
    rounds: ['Online submission', 'ZF technical jury review', 'Shortlist presentation'],
    roundDetail: 'ZF is a top 3 global automotive supplier. Challenge focuses on drivetrain electrification, chassis dynamics, active safety systems (ABS/ESC), and advanced braking. Both Mech (mechanical design) and ECE (embedded control systems) tracks.',
    prize: 'Cash prizes + ZF internship pathway',
    perks: 'ZF global brand, drivetrain engineering portfolio, strong for automotive engineering careers at tier-1 suppliers',
    tip: 'ZF is strong in transmissions + chassis. Focus on ZF ACTIVsound (NVH), electromagnetic retarders, or e-axle efficiency improvements.',
    link: 'https://www.zf.com/careers', jobs: true
  },

  {
    id: 'c16', name: 'Caterpillar Tech Challenge 2026', org: 'Caterpillar India', depts: ['mech', 'civil'], level: 'national',
    focus: 'Heavy equipment innovation, construction machinery, mining tech, energy efficiency',
    date: 'Feb–Apr 2026',
    rounds: ['Online application + idea submission', 'Technical screening', 'Hackathon at Caterpillar India facility'],
    roundDetail: 'Caterpillar TechAThon: teams tackle real Cat product engineering challenges — heavy equipment efficiency, predictive maintenance, autonomous construction machinery. Civil and Mech students both eligible. Caterpillar has facilities in Chennai and Tiruvallur.',
    prize: 'Prizes + Caterpillar internship consideration',
    perks: 'Caterpillar brand, heavy machinery engineering portfolio, Chennai/Tiruvallur facility proximity, global OEM recognition',
    tip: 'Caterpillar focuses on durability and lifecycle cost. Frame solutions in terms of Total Cost of Ownership (TCO) reduction and uptime improvement.',
    link: 'https://pages.beamery.com/caterpillarinc/page/tech-a-thon-2025-ff779z_riy', jobs: true
  },

  {
    id: 'c17', name: 'Alstom Rail Challenge 2026', org: 'Alstom Transport India', depts: ['mech', 'eee'], level: 'national',
    focus: 'Railway systems, traction systems, rail electrification, signalling tech',
    date: 'Oct–Dec 2026',
    rounds: ['Online concept submission', 'Technical evaluation', 'Finalist presentation'],
    roundDetail: 'Focus on railway engineering innovations — traction motor efficiency, rail electrification systems, signalling automation, passenger experience tech. Alstom manufactures locomotives and metro trains in India (Madhepura, Bangalore). EEE students especially relevant for traction/signalling tracks.',
    prize: 'Cash prizes + Alstom internship consideration',
    perks: 'Railway sector portfolio (growing rapidly with Metro + Vande Bharat expansion), Alstom global brand',
    tip: 'Indian railways is a major growth sector. Focus on solutions that can scale to Indian Railways\' 7000+ locomotives or metro systems.',
    link: 'https://www.alstom.com/careers', jobs: false
  },

  {
    id: 'c18', name: 'ExxonMobil Energy Challenge 2026', org: 'ExxonMobil', depts: ['mech', 'eee'], level: 'international',
    focus: 'Energy systems, emissions reduction, carbon capture, process engineering',
    date: 'Oct–Dec 2026',
    rounds: ['Online submission', 'Technical review', 'Global shortlist presentation'],
    roundDetail: 'Submit solutions for next-generation energy challenges — low-carbon fuels, CCS (carbon capture), process efficiency improvements, energy transition technologies. ExxonMobil has operations in Chennai (ExxonMobil Global Business Center). International scope.',
    prize: 'Cash prizes + ExxonMobil recognition',
    perks: 'Global energy company brand, energy sector portfolio, Chennai GBC proximity',
    tip: 'ExxonMobil is investing heavily in CCS and hydrogen. Focus on these areas for 2026 submission.',
    link: 'https://corporate.exxonmobil.com/careers', jobs: false
  },

  {
    id: 'c19', name: 'IIT Madras Shaastra Robotics Challenge', org: 'IIT Madras Shaastra', depts: ['mech', 'ece'], level: 'national',
    focus: 'Robotics, automation, embedded systems, mechatronics',
    date: 'January 2026 (Shaastra annual fest)',
    rounds: ['Online registration + qualifier', 'Shaastra fest event (on-site, IIT Madras)'],
    roundDetail: 'Annual robotics challenge at IIT Madras Shaastra tech fest. Multiple robotics events: line follower, manipulator, autonomous navigation, pick-and-place. Teams participate at IIT Madras campus — prestigious campus event for South Indian engineering students.',
    prize: 'Cash prizes + IIT Madras recognition + Shaastra certificate',
    perks: 'IIT Madras campus exposure, strong robotics portfolio, South India tech fest prestige, networking with IIT students',
    tip: 'Chennai location makes this highly accessible for SRM TRP Trichy students. Arduino/ROS + good mechanical fabrication = winning combination.',
    link: 'https://shaastra.org', jobs: false
  },

  {
    id: 'c20', name: 'DRDO Dare to Dream 2026', org: 'DRDO / Ministry of Defence', depts: ['mech', 'ece', 'eee'], level: 'national',
    focus: 'Defense technology — autonomous vehicles, surveillance, communications, propulsion',
    date: 'Jul 2026 (Registration: May–Jun)',
    rounds: ['Online concept submission', 'DRDO scientist review', 'Prototype development phase', 'National finale'],
    roundDetail: 'India\'s premier defense innovation contest for students. Problem statements cover: UAV/drone systems, underwater systems, electronic warfare, armored vehicle improvements, smart sensors. DRDO scientists mentor shortlisted teams for prototype development.',
    prize: '₹10 Lakhs prize pool + DRDO recognition + patent filing support',
    perks: 'DRDO scientist mentorship, defense sector credibility, national recognition, patent support',
    tip: 'Mech/ECE/EEE students dominate here. Focus on defense-relevant hardware solutions. Judges are DRDO scientists — technical depth matters above polish.',
    link: 'https://drdo.gov.in', jobs: false
  },

  {
    id: 'c21', name: 'ISRO Robotics Challenge 2026', org: 'ISRO / DOS', depts: ['mech', 'ece', 'eee'], level: 'national',
    focus: 'Space robotics, autonomous rovers, satellite assembly robots, space mechanisms',
    date: 'Dec 2026',
    rounds: ['Concept paper', 'Design review (ISRO engineers)', 'Prototype fabrication', 'Final demo at ISRO'],
    roundDetail: 'Design and build robots for space-inspired applications. Categories: planetary rover, space manipulator, autonomous assembly. ISRO engineers evaluate both mechanical design quality and embedded control systems.',
    prize: 'Cash prizes + ISRO internship pathway',
    perks: 'ISRO brand, space technology portfolio, national aerospace recognition',
    tip: 'ISRO favors fail-safe designs — redundancy matters in space. Document your design failure mode analysis (FMEA) for bonus points.',
    link: 'https://www.isro.gov.in', jobs: false
  },

  {
    id: 'c22', name: 'Flowserve Engineering Challenge 2026', org: 'Flowserve India', depts: ['mech'], level: 'national',
    focus: 'Pump design, fluid mechanics, valve systems, flow control',
    date: 'Sep 2026',
    rounds: ['Online concept submission', 'Technical evaluation', 'Finalist presentation'],
    roundDetail: 'Design innovations for pump, valve, and flow control applications. Flowserve has manufacturing in India. Topics: pump efficiency optimization, cavitation prevention, smart valve control, corrosion resistance.',
    prize: 'Cash prizes + Flowserve recognition',
    perks: 'Fluid machinery portfolio, pump industry knowledge, Flowserve brand for process engineering roles',
    tip: 'Knowledge of Bernoulli, cavitation, and centrifugal pump curves is essential. CFD analysis using ANSYS Fluent strengthens submissions.',
    link: 'https://www.flowserve.com/en/careers', jobs: false
  },

  {
    id: 'c23', name: 'Voltas HVAC Challenge 2026', org: 'Voltas Limited (TATA Group)', depts: ['mech', 'eee'], level: 'national',
    focus: 'HVAC systems, refrigeration, energy-efficient cooling, smart building systems',
    date: 'Sep 2026',
    rounds: ['Online idea submission', 'Technical screening', 'Demo at Voltas engineering facility'],
    roundDetail: 'Voltas (TATA Group) focuses on HVAC innovation — energy-efficient air conditioning, commercial refrigeration, cold chain logistics, smart building controls. Both Mech (thermal systems) and EEE (control systems, VFD drives) students eligible.',
    prize: 'Cash prizes + Voltas/TATA Group recognition',
    perks: 'TATA Group portfolio addition, HVAC engineering career signal, growing sector for climate control',
    tip: 'HVAC + sustainability is a massive growth area in India. Focus on energy star rating improvements or solar-assisted cooling systems.',
    link: 'https://www.voltas.com/careers', jobs: false
  },

  {
    id: 'c24', name: 'Schwing Stetter Concrete Tech Challenge 2026', org: 'Schwing Stetter India', depts: ['civil', 'mech'], level: 'national',
    focus: 'Construction equipment, concrete technology, batching plant optimization',
    date: 'Aug 2026',
    rounds: ['Online submission', 'Technical review', 'Plant visit + presentation'],
    roundDetail: 'Schwing Stetter manufactures concrete batching plants and transit mixers. Challenge covers: concrete mix design optimization, batching plant automation, transit mixer efficiency, construction waste reduction.',
    prize: 'Cash prizes + industry recognition',
    perks: 'Construction industry portfolio, Civil + Mech students, concrete technology knowledge',
    tip: 'Strong area for Civil engineering students targeting construction tech roles. Knowledge of IS code concrete grades helps.',
    link: 'https://www.schwingstetterindia.com', jobs: false
  },

  {
    id: 'c25', name: 'VA Tech Wabag Water Challenge 2026', org: 'VA Tech Wabag Limited', depts: ['civil', 'mech'], level: 'national',
    focus: 'Water treatment, wastewater management, desalination, sustainable water systems',
    date: 'Aug 2026',
    rounds: ['Online concept submission', 'Technical panel review', 'Finalist presentation'],
    roundDetail: 'VA Tech Wabag (headquartered in Chennai) focuses on water and wastewater treatment. Civil and Mech students can target: advanced treatment processes, membrane technology, smart water monitoring, desalination efficiency.',
    prize: 'Cash prizes + Wabag internship consideration',
    perks: 'Chennai HQ proximity, water sector portfolio, ESG-relevant (SDG 6 water), growing infrastructure sector',
    tip: 'Chennai proximity gives SRM TRP students direct access to Wabag HQ. Focus on Indian water scarcity challenges and cost-effective treatment solutions.',
    link: 'https://www.wabag.com', jobs: true
  },

  {
    id: 'c26', name: 'Maruti Suzuki Innovation Contest 2026', org: 'Maruti Suzuki India Ltd', depts: ['mech'], level: 'national',
    focus: "India's mass-market automotive innovation — lightweight design, fuel efficiency, safety, connected features",
    date: 'Aug 2026',
    rounds: ['Online submission', 'Technical evaluation', 'Presentation at Manesar/Delhi R&D'],
    roundDetail: "Maruti's mobility challenge focuses on practical, affordable innovations for Indian road conditions — lightweight body structures, CNG optimization, hybrid systems, ADAS for entry-level vehicles. Mass-market focus: solutions must work at ₹5–10 lakh vehicle price points.",
    prize: 'Cash prizes + Maruti internship consideration',
    perks: "India's largest passenger car manufacturer brand, practical automotive engineering portfolio",
    tip: 'Maruti thinks in terms of manufacturing cost. Every solution must be achievable at scale for India market. Avoid luxury/premium tech.',
    link: 'https://www.marutisuzukiinnovation.com', jobs: true
  },

  {
    id: 'c27', name: 'Mercedes-Benz BIBIC Innovation Challenge 2026', org: 'Mercedes-Benz R&D India', depts: ['mech'], level: 'national',
    focus: 'Premium automotive innovation — future mobility, electrification, luxury UX, advanced materials',
    date: 'Sep 2026 (FICCI organized)',
    rounds: ['Concept submission', 'FICCI + Mercedes jury evaluation', 'Finale presentation'],
    roundDetail: "Mercedes-Benz India's BIBIC (Business Ideas for the Innovation Challenge) — teams submit premium automotive innovations. Focus: luxury EV architecture, next-gen HMI, sustainable premium materials, electrified powertrains. FICCI organizes in partnership with Mercedes India R&D (Bangalore).",
    prize: 'Cash prizes + Mercedes India R&D recognition',
    perks: 'Premium automotive brand, luxury vehicle engineering portfolio, FICCI industry network',
    tip: 'Mercedes thinks in terms of 5-year future tech. Your solution should feel premium and forward-looking. Reference their EQ brand platform.',
    link: 'https://www.ficcimercedes-benzbibic.in', jobs: false
  },

  {
    id: 'c28', name: 'TAFE Innovation Challenge 2026', org: 'TAFE (Tractors and Farm Equipment) Ltd', depts: ['mech'], level: 'national',
    focus: 'Agricultural machinery, precision farming, farm mechanization, smart tractors',
    date: 'Aug 2026',
    rounds: ['Online submission', 'Technical evaluation', 'Presentation at TAFE Chennai HQ'],
    roundDetail: "TAFE (headquartered in Chennai, world's 3rd largest tractor manufacturer) focuses on: precision agriculture tech, smart tractor systems, autonomous farm equipment, post-harvest machinery. Chennai HQ proximity gives SRM TRP students an advantage.",
    prize: 'Cash prizes + TAFE internship consideration',
    perks: "Chennai HQ proximity, agricultural machinery portfolio, India's top tractor brand, rural India impact",
    tip: "TAFE Chennai is a top-tier manufacturing company with proximity to SRM TRP. Agricultural mechanization is India's biggest need — propose practical, affordable solutions.",
    link: 'https://www.tafe.com', jobs: true
  },

  {
    id: 'c29', name: 'LTTS Engineering Challenge 2026', org: 'L&T Technology Services', depts: ['mech', 'ece'], level: 'national',
    focus: 'Product engineering, embedded systems, IoT, automotive tech, aerospace R&D',
    date: 'Sep–Nov 2026',
    rounds: ['Online submission', 'Technical review by LTTS engineers', 'Shortlist demo'],
    roundDetail: 'LTTS (engineering services arm of L&T) focuses on: digital product engineering, smart manufacturing, connected vehicles, aerospace systems. Both Mech and ECE students eligible for different tracks.',
    prize: 'Cash prizes + LTTS internship / hiring consideration',
    perks: 'L&T Technology Services brand, engineering services portfolio, strong for both Mech + ECE career tracks',
    tip: 'LTTS bridges product engineering and IT — ideal for ECE/Mech students wanting to enter high-paying engineering services roles.',
    link: 'https://www.ltts.com/careers', jobs: true
  },
];

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your_')) {
  console.error("Missing or invalid SUPABASE_URL and SUPABASE_SERVICE_KEY in server/.env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('Seeding Hackathons...');
  const hackathonsData = HACKATHONS.map(h => ({
    id: h.id,
    name: h.name,
    org: h.org,
    depts: h.depts,
    level: h.level,
    focus: h.focus,
    date: h.date,
    rounds: h.rounds || [],
    round_detail: h.roundDetail || null,
    prize: h.prize || null,
    perks: h.perks || null,
    tip: h.tip || null,
    link: h.link || null,
    jobs: h.jobs || false,
    winners: h.winners || [],
    status: h.status || 'upcoming'
  }));

  const { data: hData, error: hError } = await supabase
    .from('hackathons')
    .upsert(hackathonsData, { onConflict: 'id' })
    .select();

  if (hError) console.error('Error inserting hackathons:', hError);
  else console.log(`Successfully upserted ${hData.length} hackathons.`);

  console.log('Seeding Internships...');
  const internshipsData = INTERNSHIPS.map(i => ({
    id: i.id,
    name: i.name,
    org: i.org,
    depts: i.depts,
    level: i.level,
    focus: i.focus,
    date: i.date,
    stipend: i.stipend || null,
    eligibility: i.eligibility || null,
    selection: i.selection || null,
    mode: i.mode || null,
    tip: i.tip || null,
    link: i.link || null
  }));

  const { data: iData, error: iError } = await supabase
    .from('internships')
    .upsert(internshipsData, { onConflict: 'id' })
    .select();

  if (iError) console.error('Error inserting internships:', iError);
  else console.log(`Successfully upserted ${iData.length} internships.`);

  console.log('Seeding Contests...');
  const contestsData = CONTESTS.map(c => ({
    id: c.id,
    name: c.name,
    org: c.org,
    depts: c.depts,
    level: c.level,
    focus: c.focus,
    date: c.date,
    rounds: c.rounds || [],
    round_detail: c.roundDetail || null,
    prize: c.prize || null,
    perks: c.perks || null,
    tip: c.tip || null,
    link: c.link || null,
    jobs: c.jobs || false
  }));

  const { data: cData, error: cError } = await supabase
    .from('contests')
    .upsert(contestsData, { onConflict: 'id' })
    .select();

  if (cError) console.error('Error inserting contests:', cError);
  else console.log(`Successfully upserted ${cData.length} contests.`);
}

seed();
