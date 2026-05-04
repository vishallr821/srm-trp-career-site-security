# SRM TRP Opportunity Hub

A centralized placement and opportunity portal for SRM TRP students to discover top hackathons, elite internships, and core domain contests.

## Prerequisites
- Node.js 18+
- npm (Node Package Manager)
- A Supabase Account

## Setup Instructions

**1. Clone the repository**
\`\`\`bash
git clone <repository-url>
cd srm-opportunity-hub
\`\`\`

**2. Install dependencies**
\`\`\`bash
npm install
cd client && npm install
cd ../server && npm install
\`\`\`

**3. Configure Environment Variables**
Create \`.env\` in the \`server\` directory:
\`\`\`env
PORT=5000
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
JWT_SECRET=your_secure_jwt_secret
\`\`\`

Create \`.env\` in the \`client\` directory:
\`\`\`env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:5000
\`\`\`

**4. Database Setup**
- Log into your Supabase project.
- Open the SQL Editor and run the schema setup script to create \`profiles\`, \`hackathons\`, \`internships\`, \`contests\`, and \`bookmarks\` tables.

**5. Seed the Database**
From the root folder:
\`\`\`bash
cd server
node seed.js
\`\`\`

**6. Start the Application**
From the root folder, run the following command to start both the Vite React frontend and the Express backend concurrently:
\`\`\`bash
npm run dev
\`\`\`

## Access URLs
- **Client Frontend**: http://localhost:5173
- **Server API**: http://localhost:5000
