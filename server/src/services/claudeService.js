const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const INTAKE_SYSTEM_PROMPT = `You are an expert fitness coach, certified nutritionist, and mobility specialist conducting an intake session for MyFitnessCoachAI.

YOUR PURPOSE:
After this conversation, you will create THREE personalized programs for this client:
1. WORKOUT PROGRAM - Weekly exercise routine with specific exercises, sets, reps, and weights
2. NUTRITION PLAN - Daily calorie/macro targets and meal guidelines
3. FLEXIBILITY/MOBILITY PROGRAM - Stretching routine to improve mobility and prevent injury

To create effective, personalized programs, you MUST gather specific information in each area.

INFORMATION YOU NEED TO COLLECT:

FOR THE WORKOUT PROGRAM:
- Primary fitness goal (build muscle, lose fat, get stronger, improve endurance, general fitness)
- Current fitness level (complete beginner, some experience, intermediate, advanced)
- How many days per week they can commit to exercise
- How much time per session (15 min, 30 min, 45 min, 60 min)
- Available equipment (bodyweight only, dumbbells, full gym, home gym - be specific)
- Any exercises they can't do or should avoid

FOR THE NUTRITION PLAN:
- Current body weight (approximate is fine)
- Goal: lose weight, maintain, or gain muscle
- Any dietary restrictions (vegetarian, vegan, allergies, religious restrictions)
- Eating preferences (how many meals per day, cooking ability, meal prep willingness)
- Current eating habits (to understand their starting point)

FOR THE FLEXIBILITY PROGRAM:
- Areas of tightness or pain (lower back, hips, shoulders, etc.)
- Current stretching habits (none, occasional, regular)
- Any injuries or mobility limitations
- Job type (desk job = tight hip flexors, physical job = different needs)

ALSO GATHER:
- Age (for appropriate exercise intensity)
- Any medical conditions that affect exercise
- Past fitness experience (what worked, what didn't)
- Motivation and accountability preferences

CONVERSATION STYLE:
- Be warm, encouraging, and professional
- Ask ONE focused question at a time
- Acknowledge their answers before moving on
- Keep responses to 2-3 sentences
- Use a natural flow - don't make it feel like a checklist
- If they give short answers, probe deeper

CONVERSATION FLOW:
1. Start with a warm greeting and ask about their main goal
2. Explore their "why" - motivation matters
3. Cover workout-related questions (schedule, equipment, experience)
4. Cover nutrition-related questions (weight goals, restrictions, habits)
5. Cover flexibility/mobility (pain points, tightness, sitting habits)
6. Fill in any gaps (age, medical conditions, past attempts)

ENDING THE CONVERSATION:
When you have enough information for all three programs, provide a comprehensive summary:

"Here's what I've learned about you: [Summarize their goals, schedule, equipment, nutrition needs, flexibility concerns, and any limitations]. Based on this, I'll create:
- A [X]-day workout program focused on [their goal]
- A nutrition plan targeting [calories/goal]
- A flexibility routine addressing [their problem areas]

Does this sound right? Anything you'd like to add or correct?"

After they confirm the summary is correct, ask ONE final safety question:

"Before I create your programs, I want to make sure we've covered everything. Are there any health conditions, mental health considerations, old injuries, or other situations you haven't mentioned that I should know about?"

If they say no or indicate everything is covered, respond with exactly: "INTAKE_COMPLETE"
If they add new information, acknowledge it, incorporate it into your understanding, and then respond with: "INTAKE_COMPLETE"

IMPORTANT: Never mention you're an AI. You are their personal fitness coach.`;

const STARTER_MESSAGE = `Hello! I'm excited to be your fitness coach. I'm here to create a complete personalized program for you - that includes your workouts, nutrition guidance, and a flexibility routine to keep you moving well.

To build something that actually works for YOUR life, I need to learn about you. Let's start with the big picture: What's the main fitness goal you want to achieve? Are you looking to lose weight, build muscle, get stronger, improve your energy, or something else?`;

async function sendIntakeMessage(conversationHistory) {
  // If no messages yet, return the starter message directly (no API call needed)
  if (conversationHistory.length === 0) {
    return STARTER_MESSAGE;
  }

  // Build messages for Claude - need to ensure proper alternation starting with user
  // The first message in history is our assistant greeting, so we prepend a user opener
  let messages = [];

  if (conversationHistory[0]?.role === 'assistant') {
    // Prepend a synthetic user message to maintain proper alternation
    messages = [
      { role: 'user', content: 'Hi, I\'m ready to start my fitness consultation.' },
      ...conversationHistory
    ];
  } else {
    messages = conversationHistory;
  }

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: INTAKE_SYSTEM_PROMPT,
    messages: messages
  });

  return response.content[0].text;
}

async function extractUserData(conversationHistory) {
  const extractionPrompt = `Based on this fitness intake conversation, extract all relevant user information into structured JSON.

Conversation:
${conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n')}

Extract EVERYTHING mentioned. Return ONLY valid JSON:
{
  "personal": {
    "name": "string or null",
    "age": "number or null",
    "gender": "string or null",
    "current_weight_lbs": "number or null",
    "height": "string or null"
  },
  "goals": {
    "primary_goal": "string - main fitness objective",
    "goal_reason": "string - their motivation/why",
    "weight_goal": "lose|maintain|gain or null",
    "target_weight_lbs": "number or null"
  },
  "workout": {
    "experience_level": "beginner|intermediate|advanced",
    "days_per_week": "number",
    "minutes_per_session": "number",
    "preferred_time": "morning|afternoon|evening or null",
    "equipment_location": "home|gym|both|outdoor",
    "available_equipment": ["array of specific equipment"],
    "exercises_to_avoid": ["array of exercises or movements to avoid"],
    "current_routine": "string describing current exercise habits or null"
  },
  "nutrition": {
    "meals_per_day": "number or null",
    "dietary_restrictions": ["array: vegetarian, vegan, gluten-free, dairy-free, allergies, etc."],
    "cooking_ability": "none|basic|moderate|advanced or null",
    "meal_prep_willing": "boolean or null",
    "current_eating_habits": "string or null",
    "water_intake": "string or null"
  },
  "flexibility": {
    "problem_areas": ["array: lower back, hips, shoulders, neck, hamstrings, etc."],
    "current_stretching": "none|occasional|regular",
    "injuries": ["array of current or past injuries"],
    "job_type": "sedentary|moderate|active",
    "hours_sitting_daily": "number or null"
  },
  "health": {
    "medical_conditions": ["array of conditions affecting exercise"],
    "medications": "string or null",
    "sleep_hours": "number or null",
    "stress_level": "low|moderate|high or null"
  },
  "psychology": {
    "past_fitness_attempts": "string describing what they've tried",
    "what_worked": "string or null",
    "what_didnt_work": "string or null",
    "accountability_style": "self-motivated|needs-accountability|competitive or null"
  }
}`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [{ role: 'user', content: extractionPrompt }]
  });

  const text = response.content[0].text;

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  throw new Error('Failed to extract structured data from conversation');
}

// ============ PROGRAM GENERATION ============

async function generateWorkoutProgram(userData) {
  const prompt = `You are an expert personal trainer creating a workout program. Based on this client data, create a detailed weekly workout program.

CLIENT DATA:
${JSON.stringify(userData, null, 2)}

Create a workout program that:
- Matches their ${userData.workout?.days_per_week || 3} days per week availability
- Fits within ${userData.workout?.minutes_per_session || 45} minutes per session
- Uses only their available equipment: ${JSON.stringify(userData.workout?.available_equipment || ['bodyweight'])}
- Matches their ${userData.workout?.experience_level || 'beginner'} experience level
- Focuses on their goal: ${userData.goals?.primary_goal || 'general fitness'}
- Avoids: ${JSON.stringify(userData.workout?.exercises_to_avoid || [])}
- Considers injuries: ${JSON.stringify(userData.flexibility?.injuries || [])}

Return ONLY valid JSON in this exact structure:
{
  "program_name": "string - catchy name for their program",
  "duration_weeks": 8,
  "overview": "2-3 sentence description of the program approach",
  "weekly_schedule": [
    {
      "day": "Monday",
      "day_number": 1,
      "session_name": "Upper Body Strength",
      "focus": "chest, shoulders, triceps",
      "duration_minutes": 45,
      "exercises": [
        {
          "name": "Push-ups",
          "sets": 3,
          "reps": "10-12",
          "weight": "bodyweight",
          "rest_seconds": 60,
          "notes": "Keep core tight, full range of motion",
          "substitution": "Knee push-ups if needed"
        }
      ],
      "warmup": "5 min light cardio + arm circles",
      "cooldown": "5 min stretching"
    }
  ],
  "rest_days": ["Sunday"],
  "progression_plan": "How to progress over the 8 weeks",
  "tips": ["array of 3-4 helpful tips for success"]
}

Include specific weights where appropriate based on their experience level. For beginners, start conservative.`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }]
  });

  const text = response.content[0].text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  throw new Error('Failed to generate workout program');
}

async function generateNutritionPlan(userData) {
  const prompt = `You are a certified nutritionist creating a personalized nutrition plan. Based on this client data, create a practical nutrition plan.

CLIENT DATA:
${JSON.stringify(userData, null, 2)}

Create a nutrition plan that:
- Supports their goal: ${userData.goals?.primary_goal || 'general fitness'} / ${userData.goals?.weight_goal || 'maintain'}
- Considers their weight: ${userData.personal?.current_weight_lbs || 'unknown'} lbs
- Respects restrictions: ${JSON.stringify(userData.nutrition?.dietary_restrictions || [])}
- Matches their cooking ability: ${userData.nutrition?.cooking_ability || 'basic'}
- Fits ${userData.nutrition?.meals_per_day || 3} meals per day preference

Return ONLY valid JSON in this exact structure:
{
  "plan_name": "string - name for their nutrition approach",
  "overview": "2-3 sentence description of the nutrition strategy",
  "daily_targets": {
    "calories": 2000,
    "protein_g": 150,
    "carbs_g": 200,
    "fat_g": 65,
    "fiber_g": 30,
    "water_oz": 80
  },
  "calorie_explanation": "Why this calorie target was chosen",
  "meal_timing": {
    "meals_per_day": 3,
    "snacks_per_day": 1,
    "pre_workout": "What to eat before training",
    "post_workout": "What to eat after training"
  },
  "sample_meals": [
    {
      "meal": "Breakfast",
      "time": "7:00 AM",
      "options": [
        {
          "name": "Protein Oatmeal",
          "description": "Oatmeal with protein powder, banana, and almonds",
          "calories": 450,
          "protein_g": 30,
          "prep_time_minutes": 10
        }
      ]
    }
  ],
  "grocery_staples": ["array of 10-15 foods to always have on hand"],
  "foods_to_limit": ["array of foods to reduce"],
  "hydration_tips": ["array of 3 hydration tips"],
  "practical_tips": ["array of 4-5 practical eating tips"]
}

Be practical and realistic. Give specific food examples they can actually make.`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }]
  });

  const text = response.content[0].text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  throw new Error('Failed to generate nutrition plan');
}

async function generateFlexibilityProgram(userData) {
  const prompt = `You are a mobility specialist creating a flexibility/stretching program. Based on this client data, create a targeted flexibility routine.

CLIENT DATA:
${JSON.stringify(userData, null, 2)}

Create a flexibility program that:
- Addresses their problem areas: ${JSON.stringify(userData.flexibility?.problem_areas || ['general tightness'])}
- Considers their job type: ${userData.flexibility?.job_type || 'sedentary'} (${userData.flexibility?.hours_sitting_daily || 8} hours sitting)
- Works around injuries: ${JSON.stringify(userData.flexibility?.injuries || [])}
- Builds on current habits: ${userData.flexibility?.current_stretching || 'none'}
- Complements their workout program

Return ONLY valid JSON in this exact structure:
{
  "program_name": "string - name for their flexibility program",
  "overview": "2-3 sentence description of the mobility approach",
  "frequency": "Daily recommended, minimum 3x per week",
  "total_time_minutes": 15,
  "routines": {
    "morning": {
      "name": "Morning Wake-Up Routine",
      "duration_minutes": 5,
      "when": "Right after waking",
      "stretches": [
        {
          "name": "Cat-Cow Stretch",
          "target_area": "spine, core",
          "hold_seconds": 30,
          "reps": 10,
          "instructions": "On hands and knees, alternate between arching and rounding your back",
          "breathing": "Inhale as you arch, exhale as you round",
          "modification": "Can do seated version in a chair"
        }
      ]
    },
    "post_workout": {
      "name": "Post-Workout Cooldown",
      "duration_minutes": 10,
      "when": "After every workout",
      "stretches": []
    },
    "evening": {
      "name": "Evening Wind-Down",
      "duration_minutes": 10,
      "when": "Before bed",
      "stretches": []
    }
  },
  "desk_breaks": [
    {
      "name": "Neck Rolls",
      "frequency": "Every 2 hours",
      "duration_seconds": 30,
      "instructions": "Slowly roll head in circles, 5 each direction"
    }
  ],
  "progression": "How flexibility will improve over 8 weeks",
  "tips": ["array of 3-4 flexibility tips"]
}

Focus especially on their problem areas. Include specific breathing cues and modifications.`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }]
  });

  const text = response.content[0].text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  throw new Error('Failed to generate flexibility program');
}

async function generateAllPrograms(userData) {
  // Generate all three programs in parallel for speed
  const [workout, nutrition, flexibility] = await Promise.all([
    generateWorkoutProgram(userData),
    generateNutritionPlan(userData),
    generateFlexibilityProgram(userData)
  ]);

  return { workout, nutrition, flexibility };
}

module.exports = {
  sendIntakeMessage,
  extractUserData,
  STARTER_MESSAGE,
  generateWorkoutProgram,
  generateNutritionPlan,
  generateFlexibilityProgram,
  generateAllPrograms
};
