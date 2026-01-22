# MyFitnessCoachAI - Technical Specification

**Domain:** myfitnesscoachai.com  
**Purpose:** AI-powered personalized fitness app with conversational intake  
**Stack:** React frontend + Node.js/Express backend + PostgreSQL + Claude API  

---

## Project Overview

AI fitness app that generates truly personalized workout, nutrition, and flexibility programs through conversational AI intake. Users have a natural conversation with Claude AI, which understands their complete situation and generates custom programs - not templates.

**Core Features:**
1. Conversational AI intake (gather user info)
2. AI program generation (workout + nutrition + flexibility)
3. Program display and tracking
4. Progress logging with weight tracking
5. Free vs Premium tiers

---

## Tech Stack

**Frontend:**
- React 18
- React Router (navigation)
- Axios (API calls)
- CSS/Tailwind (styling)

**Backend:**
- Node.js 18+
- Express
- PostgreSQL
- JWT authentication
- Claude API (Anthropic)

**Development:**
- Local PostgreSQL for development
- Railway PostgreSQL + hosting for production
- Git/GitHub for version control

---

## Color Scheme

```css
--black: #000000ff;
--black-cherry: #5e0f0fff;
--deep-crimson: #9a031eff;
--princeton-orange: #fb8b24ff;
--autumn-leaf: #e36414ff;
--dark-teal: #0f4c5cff;
--azure-mist: #eefbffff;
```

**Usage:**
- Primary: Deep Crimson (#9a031e) - main CTA buttons, headers
- Secondary: Princeton Orange (#fb8b24) - accents, highlights
- Accent: Autumn Leaf (#e36414) - progress indicators
- Background: Azure Mist (#eefbff) - light backgrounds
- Dark: Black Cherry (#5e0f0f) - dark text, navigation
- Teal: Dark Teal (#0f4c5c) - links, secondary buttons

---

## Project Structure

```
myfitnesscoachai/
├── client/                     # React frontend
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   │   ├── Auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Signup.jsx
│   │   │   ├── Intake/
│   │   │   │   ├── ChatInterface.jsx
│   │   │   │   └── IntakeSummary.jsx
│   │   │   ├── Program/
│   │   │   │   ├── WorkoutView.jsx
│   │   │   │   ├── NutritionView.jsx
│   │   │   │   └── FlexibilityView.jsx
│   │   │   ├── Progress/
│   │   │   │   └── ProgressTracker.jsx
│   │   │   └── Layout/
│   │   │       ├── Header.jsx
│   │   │       ├── Navigation.jsx
│   │   │       └── Dashboard.jsx
│   │   ├── pages/            # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── IntakePage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   └── WorkoutPage.jsx
│   │   ├── services/         # API service layer
│   │   │   ├── api.js
│   │   │   ├── auth.js
│   │   │   └── program.js
│   │   ├── context/          # React context
│   │   │   └── AuthContext.jsx
│   │   ├── utils/            # Utility functions
│   │   │   └── validators.js
│   │   ├── styles/           # CSS files
│   │   │   └── App.css
│   │   ├── App.jsx
│   │   └── index.jsx
│   ├── package.json
│   └── .env
│
├── server/                    # Node.js backend
│   ├── src/
│   │   ├── routes/           # API routes
│   │   │   ├── auth.js
│   │   │   ├── intake.js
│   │   │   ├── program.js
│   │   │   └── progress.js
│   │   ├── controllers/      # Route handlers
│   │   │   ├── authController.js
│   │   │   ├── intakeController.js
│   │   │   ├── programController.js
│   │   │   └── progressController.js
│   │   ├── services/         # Business logic
│   │   │   ├── claudeService.js      # Claude API integration
│   │   │   ├── programGenerator.js   # AI program generation
│   │   │   └── dataExtractor.js      # Extract structured data from conversations
│   │   ├── middleware/       # Express middleware
│   │   │   ├── auth.js       # JWT verification
│   │   │   ├── validator.js  # Input validation
│   │   │   └── errorHandler.js
│   │   ├── models/           # Database models/queries
│   │   │   ├── User.js
│   │   │   ├── Conversation.js
│   │   │   ├── Program.js
│   │   │   └── Progress.js
│   │   ├── config/           # Configuration
│   │   │   ├── database.js   # PostgreSQL connection
│   │   │   └── claude.js     # Claude API config
│   │   ├── utils/            # Utility functions
│   │   │   └── jwt.js
│   │   └── server.js         # Entry point
│   ├── package.json
│   ├── .env
│   └── .env.example
│
├── database/                  # Database files
│   ├── schema.sql            # Database schema
│   ├── seed.sql              # Sample data (optional)
│   └── migrations/           # Schema migrations (future)
│
├── docs/                      # Documentation
│   └── API.md                # API documentation
│
├── .gitignore
├── README.md
└── package.json              # Root package.json (optional)
```

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_premium BOOLEAN DEFAULT FALSE,
  premium_expires_at TIMESTAMP NULL
);

CREATE INDEX idx_users_email ON users(email);
```

### Conversations Table
```sql
CREATE TABLE conversations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  messages JSONB NOT NULL,  -- Array of {role: 'user'|'assistant', content: '...', timestamp}
  extracted_data JSONB NULL,  -- Structured data extracted from conversation
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_completed ON conversations(completed);
```

### Programs Table
```sql
CREATE TABLE programs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  conversation_id INTEGER REFERENCES conversations(id) ON DELETE SET NULL,
  program_name VARCHAR(255) NOT NULL,
  
  -- Workout program (JSONB)
  workout_program JSONB NOT NULL,
  /*
  Structure:
  {
    "duration_weeks": 8,
    "weekly_schedule": [
      {
        "day": "Monday",
        "session_name": "Upper Body Strength",
        "duration_minutes": 30,
        "exercises": [
          {
            "name": "Dumbbell Bench Press",
            "sets": 3,
            "reps": "10-12",
            "weight_lbs": 25,
            "rest_seconds": 90,
            "notes": "Focus on control",
            "substitution": "Push-ups if no dumbbells"
          }
        ]
      }
    ],
    "progression_plan": "Increase weight by 2.5-5 lbs when completing all reps"
  }
  */
  
  -- Nutrition plan (JSONB)
  nutrition_plan JSONB NOT NULL,
  /*
  Structure:
  {
    "daily_targets": {
      "calories": 1800,
      "protein_g": 130,
      "carbs_g": 180,
      "fat_g": 60
    },
    "meal_timing": "3 meals + 1-2 snacks",
    "sample_meals": [
      {
        "meal": "Breakfast",
        "example": "3 eggs, toast, coffee",
        "calories": 400,
        "protein_g": 25
      }
    ],
    "guidelines": ["Drink 80-100oz water", "..."]
  }
  */
  
  -- Flexibility program (JSONB)
  flexibility_program JSONB NOT NULL,
  /*
  Structure:
  {
    "routine": [
      {
        "name": "Hip Flexor Stretch",
        "hold_seconds": 60,
        "reps_per_side": 2,
        "when": "After every workout",
        "target": "Hip flexors",
        "cues": "Push hips forward, stay upright"
      }
    ],
    "frequency": "Daily recommended, minimum 3x/week",
    "progression": "Increase hold time monthly"
  }
  */
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_programs_user_id ON programs(user_id);
CREATE INDEX idx_programs_active ON programs(is_active);
```

### Workout Logs Table
```sql
CREATE TABLE workout_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  program_id INTEGER REFERENCES programs(id) ON DELETE CASCADE,
  workout_date DATE NOT NULL,
  day_name VARCHAR(50) NOT NULL,  -- "Monday", "Wednesday", etc.
  session_name VARCHAR(255) NOT NULL,  -- "Upper Body Strength"
  
  -- Exercises performed (JSONB array)
  exercises_logged JSONB NOT NULL,
  /*
  Structure:
  [
    {
      "name": "Dumbbell Bench Press",
      "sets_completed": 3,
      "reps_performed": [10, 10, 9],
      "weight_used_lbs": [25, 25, 25],
      "notes": "Felt strong today"
    }
  ]
  */
  
  completed BOOLEAN DEFAULT FALSE,
  duration_minutes INTEGER NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workout_logs_user_id ON workout_logs(user_id);
CREATE INDEX idx_workout_logs_date ON workout_logs(workout_date);
CREATE INDEX idx_workout_logs_program_id ON workout_logs(program_id);
```

### Progress Stats Table
```sql
CREATE TABLE progress_stats (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  
  -- Aggregate stats
  total_workouts_completed INTEGER DEFAULT 0,
  current_streak_days INTEGER DEFAULT 0,
  longest_streak_days INTEGER DEFAULT 0,
  last_workout_date DATE NULL,
  
  -- Weight progression for key lifts (JSONB)
  lift_progression JSONB NULL,
  /*
  Structure:
  {
    "Dumbbell Bench Press": {
      "starting_weight": 20,
      "current_weight": 30,
      "history": [
        {"date": "2024-01-15", "weight": 20},
        {"date": "2024-01-22", "weight": 25},
        {"date": "2024-02-01", "weight": 30}
      ]
    }
  }
  */
  
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_progress_stats_user_id ON progress_stats(user_id);
```

---

## API Endpoints

### Authentication

**POST /api/auth/signup**
- Body: `{ email, password }`
- Returns: `{ token, user: { id, email, is_premium } }`
- Creates new user account

**POST /api/auth/login**
- Body: `{ email, password }`
- Returns: `{ token, user: { id, email, is_premium } }`
- Authenticates existing user

**POST /api/auth/verify**
- Headers: `Authorization: Bearer <token>`
- Returns: `{ user: { id, email, is_premium } }`
- Verifies JWT token validity

---

### Intake Conversation

**POST /api/intake/start**
- Headers: `Authorization: Bearer <token>`
- Returns: `{ conversation_id, message: "Welcome! Let's build your program..." }`
- Starts new intake conversation

**POST /api/intake/message**
- Headers: `Authorization: Bearer <token>`
- Body: `{ conversation_id, message: "user's response" }`
- Returns: `{ response: "AI's reply", completed: false }`
- Sends user message, receives AI response

**GET /api/intake/:conversation_id**
- Headers: `Authorization: Bearer <token>`
- Returns: `{ conversation_id, messages: [...], extracted_data: {...}, completed: true }`
- Retrieves full conversation history

**POST /api/intake/:conversation_id/confirm**
- Headers: `Authorization: Bearer <token>`
- Body: `{ confirmed: true }`
- Returns: `{ extracted_data: {...} }`
- User confirms AI's understanding, finalizes intake

---

### Program Generation

**POST /api/program/generate**
- Headers: `Authorization: Bearer <token>`
- Body: `{ conversation_id }`
- Returns: `{ program_id, status: "generating" }`
- Triggers AI program generation (async)

**GET /api/program/status/:program_id**
- Headers: `Authorization: Bearer <token>`
- Returns: `{ status: "complete", program: {...} }` or `{ status: "generating", progress: 60 }`
- Checks program generation status

**GET /api/program/:program_id**
- Headers: `Authorization: Bearer <token>`
- Returns: Full program object with workout, nutrition, flexibility plans
- Retrieves complete program

**GET /api/program/active**
- Headers: `Authorization: Bearer <token>`
- Returns: User's currently active program
- Gets active program for logged-in user

**POST /api/program/regenerate**
- Headers: `Authorization: Bearer <token>`
- Body: `{ reason: "injury"|"goal_change"|"equipment_change", notes: "..." }`
- Returns: `{ conversation_id }` for new intake conversation
- Premium only: Start program regeneration

---

### Progress Tracking

**POST /api/progress/log-workout**
- Headers: `Authorization: Bearer <token>`
- Body: 
```json
{
  "program_id": 1,
  "workout_date": "2024-01-15",
  "day_name": "Monday",
  "session_name": "Upper Body Strength",
  "exercises_logged": [
    {
      "name": "Dumbbell Bench Press",
      "sets_completed": 3,
      "reps_performed": [10, 10, 9],
      "weight_used_lbs": [25, 25, 25],
      "notes": "Felt strong"
    }
  ],
  "completed": true,
  "duration_minutes": 35
}
```
- Returns: `{ success: true, workout_log_id: 123 }`
- Logs completed workout

**GET /api/progress/stats**
- Headers: `Authorization: Bearer <token>`
- Returns: 
```json
{
  "total_workouts": 42,
  "current_streak": 7,
  "longest_streak": 14,
  "last_workout": "2024-01-15",
  "this_week_completed": 3,
  "this_week_total": 4
}
```
- Gets user's progress statistics

**GET /api/progress/history**
- Headers: `Authorization: Bearer <token>`
- Query: `?days=30` (optional, default 30)
- Returns: Array of workout logs for past N days
- Gets workout history

**GET /api/progress/lift/:exercise_name**
- Headers: `Authorization: Bearer <token>`
- Returns: Weight progression data for specific exercise
- Example: `/api/progress/lift/Dumbbell%20Bench%20Press`

---

## Component Structure

### Pages

**HomePage**
- Landing page for non-authenticated users
- Value proposition, features, CTA to signup
- Routes: `/`

**SignupPage / LoginPage**
- Authentication forms
- Routes: `/signup`, `/login`

**IntakePage**
- Conversational AI intake interface
- Chat-like UI with AI responses
- Routes: `/intake`

**DashboardPage**
- Main hub after intake complete
- Shows today's workout, weekly progress, streak
- Quick access to workout/nutrition/flexibility
- Routes: `/dashboard`

**WorkoutPage**
- Displays workout program
- Weekly calendar view
- Daily workout detail with exercises
- Checkboxes for tracking sets
- Weight logging
- Routes: `/workout`, `/workout/:day`

**NutritionPage**
- Displays nutrition plan
- Daily targets, sample meals, guidelines
- Routes: `/nutrition`

**FlexibilityPage**
- Displays flexibility/mobility routine
- Stretch list with hold times
- Routes: `/flexibility`

**ProgressPage**
- Stats, calendar view, graphs
- Weight progression charts
- Workout history
- Routes: `/progress`

---

### Key Components

**ChatInterface**
- Props: `conversationId`
- Displays conversation messages
- Input field for user responses
- Auto-scrolls to latest message
- Shows typing indicator when AI is responding

**WorkoutCard**
- Props: `exercise: { name, sets, reps, weight, rest, notes }`
- Displays single exercise with all details
- Checkboxes for set completion
- Input for logging actual weight used

**ProgressChart**
- Props: `exercise_name, data: [{ date, weight }]`
- Line chart showing weight progression over time
- Uses chart library (Chart.js or Recharts)

**StreakCounter**
- Props: `current_streak, longest_streak`
- Visual display of workout streak
- Motivational messaging

**Navigation**
- Bottom navigation bar (mobile)
- Links to: Dashboard, Workout, Progress, Profile
- Highlights current page

---

## Environment Variables

### Server (.env)

```env
# Server
NODE_ENV=development
PORT=5000

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/myfitnesscoachai

# For Railway production:
# DATABASE_URL will be auto-injected by Railway

# JWT
JWT_SECRET=your_secure_random_secret_here_minimum_32_characters

# Claude API
ANTHROPIC_API_KEY=your_claude_api_key_here

# CORS (for development)
CLIENT_URL=http://localhost:3000

# For production:
# CLIENT_URL=https://myfitnesscoachai.com
```

### Client (.env)

```env
REACT_APP_API_URL=http://localhost:5000/api

# For production:
# REACT_APP_API_URL=https://api.myfitnesscoachai.com/api
# or
# REACT_APP_API_URL=https://myfitnesscoachai.com/api
```

---

## Local Development Setup

### Prerequisites

1. **Node.js 18+** installed
2. **PostgreSQL** installed locally
3. **Git** installed
4. **Claude API key** from Anthropic

### Initial Setup Steps

**1. Create local PostgreSQL database**

```bash
# Open PostgreSQL CLI
psql postgres

# Create database
CREATE DATABASE myfitnesscoachai;

# Create user (optional, or use existing user)
CREATE USER fitnessapp WITH PASSWORD 'yourpassword';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE myfitnesscoachai TO fitnessapp;

# Exit
\q
```

**2. Clone and setup project**

```bash
# Create project directory
mkdir myfitnesscoachai
cd myfitnesscoachai

# Initialize git
git init

# Create project structure (Claude Code will do this)
```

**3. Install dependencies**

```bash
# Server
cd server
npm init -y
npm install express pg cors dotenv bcrypt jsonwebtoken @anthropic-ai/sdk
npm install --save-dev nodemon

# Client
cd ../client
npx create-react-app .
npm install axios react-router-dom
```

**4. Setup database schema**

```bash
# From project root
psql -U fitnessapp -d myfitnesscoachai -f database/schema.sql
```

**5. Configure environment variables**

Create `.env` files in both `/server` and `/client` directories using the templates above.

**6. Start development servers**

```bash
# Terminal 1: Start backend
cd server
npm run dev  # Uses nodemon for auto-restart

# Terminal 2: Start frontend
cd client
npm start
```

**7. Access app**

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

---

## Development Workflow

### Daily workflow

```bash
# Pull latest changes
git pull

# Make changes to code

# Test locally (both servers running)

# Commit changes
git add .
git commit -m "Descriptive message"
git push
```

### Testing endpoints

Use Postman, Insomnia, or curl to test API endpoints:

```bash
# Example: Test signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Example: Test authenticated endpoint
curl http://localhost:5000/api/program/active \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

---

## Claude API Integration

### Conversation Prompts

**System Prompt for Intake**

```javascript
const INTAKE_SYSTEM_PROMPT = `You are an expert personal trainer conducting an intake conversation with a new client.

Your goals:
1. Understand their complete fitness situation
2. Build rapport and trust
3. Extract information needed to create a personalized program
4. Make them feel heard and understood

Key areas to cover:
- Demographics (age, gender optional)
- Primary fitness goals (why?)
- Current fitness level and experience
- Available time and schedule
- Equipment access
- Injuries, limitations, medical conditions
- Past fitness attempts (what worked/didn't)
- Lifestyle factors (job, stress, family)
- Psychological factors (motivation style)

Conversation style:
- Warm, professional, encouraging
- Ask ONE question at a time
- Follow up based on answers
- Summarize understanding periodically

When you have enough info, say:
"Let me summarize what I understand: [summary]. Does this sound accurate?"

If confirmed, respond with: "INTAKE_COMPLETE"`;
```

**Program Generation Prompts**

```javascript
const WORKOUT_GENERATION_PROMPT = `Generate a personalized workout program for this user:

User Data: ${JSON.stringify(extracted_data)}

Return ONLY valid JSON in this exact structure:
{
  "duration_weeks": 8,
  "weekly_schedule": [
    {
      "day": "Monday",
      "session_name": "Upper Body Strength",
      "duration_minutes": 30,
      "exercises": [
        {
          "name": "Exercise name",
          "sets": 3,
          "reps": "10-12",
          "weight_lbs": 25,
          "rest_seconds": 90,
          "notes": "Form cues",
          "substitution": "Alternative exercise"
        }
      ]
    }
  ],
  "progression_plan": "How to progress"
}

Requirements:
- Only exercises for available equipment
- Avoid movements aggravating injuries
- Appropriate volume for fitness level
- Specify weight for every exercise
- Safe and effective progressions`;
```

### API Call Example

```javascript
// services/claudeService.js
const Anthropic = require('@anthropic-ai/sdk');
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

async function sendMessage(systemPrompt, messages) {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: systemPrompt,
    messages: messages
  });
  
  return response.content[0].text;
}

module.exports = { sendMessage };
```

---

## Railway Deployment (Future)

### Setup on Railway

**Note:** Do this after local development is working

1. **Create new Railway project**
   - Railway dashboard → New Project
   - Select "Deploy from GitHub repo"
   - Connect your GitHub repo

2. **Add PostgreSQL database**
   - Add PostgreSQL from Railway services
   - Railway auto-creates `DATABASE_URL` variable

3. **Configure environment variables**
   - Add all production env vars from template above
   - Railway injects `DATABASE_URL` automatically

4. **Deploy backend**
   - Railway detects Node.js app
   - Runs `npm install` and `npm start`
   - Provides deployment URL

5. **Deploy frontend**
   - Option A: Same Railway service (serve from Express)
   - Option B: Separate Railway service for frontend
   - Option C: Use Vercel/Netlify for frontend only

6. **Point domain**
   - Railway settings → Add domain: myfitnesscoachai.com
   - Update DNS settings at domain registrar
   - Railway handles SSL automatically

### Production Deployment Checklist

- [ ] Environment variables set on Railway
- [ ] Database schema applied to Railway PostgreSQL
- [ ] CORS configured for production domain
- [ ] JWT secret is strong and unique
- [ ] API rate limiting enabled
- [ ] Error logging configured
- [ ] Database backups enabled
- [ ] SSL certificate active
- [ ] Domain DNS pointed correctly

---

## MVP Feature Priority

### Phase 1: Foundation (Week 1-2)
- [ ] Project structure setup
- [ ] Database schema created
- [ ] User authentication (signup/login)
- [ ] Basic frontend routing
- [ ] API connection working

### Phase 2: Core AI Features (Week 3-4)
- [ ] Conversational intake interface
- [ ] Claude API integration
- [ ] Message storage in database
- [ ] Intake completion and data extraction

### Phase 3: Program Generation (Week 5-6)
- [ ] AI workout program generation
- [ ] AI nutrition plan generation
- [ ] AI flexibility program generation
- [ ] Program storage in database

### Phase 4: Program Display (Week 7-8)
- [ ] Dashboard with today's workout
- [ ] Workout program view
- [ ] Nutrition plan view
- [ ] Flexibility routine view

### Phase 5: Progress Tracking (Week 9-10)
- [ ] Workout logging with weight tracking
- [ ] Progress statistics
- [ ] Streak counter
- [ ] Weight progression charts

### Phase 6: Polish & Testing (Week 11-12)
- [ ] Free vs Premium tier implementation
- [ ] Mobile responsive design
- [ ] Bug fixes
- [ ] Beta testing with real users
- [ ] Performance optimization

### Phase 7: Voice Interface (Final Step)
- [ ] Add voice input/output capability to the conversational AI intake
- [ ] Implement speech-to-text for user responses
- [ ] Implement text-to-speech for AI coach responses
- [ ] Hands-free workout guidance during exercise sessions

---

## Known Limitations / Future Enhancements

**MVP Excludes:**
- Payment processing (Stripe) - add post-MVP
- Social features - Version 2
- Wearable integration - Version 2
- Video exercise library - Version 2
- Advanced analytics - Version 2

**Technical Debt to Address Later:**
- Database migrations system
- Automated testing (unit + integration)
- CI/CD pipeline
- Rate limiting on API
- Caching layer (Redis)
- Monitoring/logging (Sentry, LogRocket)

---

## Getting Started with Claude Code

**Tell Claude Code:**

```
I want to build MyFitnessCoachAI - an AI-powered fitness app.

Tech stack:
- Frontend: React
- Backend: Node.js + Express  
- Database: PostgreSQL (local for dev, Railway for production)
- AI: Claude API

Please:
1. Create the project folder structure as specified
2. Set up package.json files with dependencies
3. Create database schema file
4. Set up basic Express server
5. Create React app structure
6. Configure environment variables

Start with the foundation and we'll build features incrementally.

Here's the complete specification: [paste this document]
```

**Then work through features phase by phase, asking Claude Code to implement one section at a time.**

---

## Questions?

If anything is unclear or you need clarification on any section, ask before starting implementation. Better to clarify upfront than build the wrong thing.