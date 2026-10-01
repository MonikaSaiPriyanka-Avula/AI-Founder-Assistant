import express from 'express';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import {
  StartupIdea,
  User,
  AIEvaluation,
} from './src/types';
import {
  DEMO_USER,
  INITIAL_STARTUP_IDEAS,
  generateBasicSummaryFromIdea,
  generateFallbackAIEvaluation,
  generateDefaultCompetitors,
} from './src/seedData';
import { generateContextualSwot } from './src/swotGenerator';

dotenv.config();

interface StoredUser extends User {
  passwordHash: string;
}

interface DataStore {
  users: StoredUser[];
  startups: StartupIdea[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

function ensureStartupSwotPopulated(idea: StartupIdea): boolean {
  let modified = false;

  // Ensure 2 default competitors are populated without duplicates
  if (!Array.isArray(idea.competitors) || idea.competitors.length === 0) {
    idea.competitors = generateDefaultCompetitors(idea);
    modified = true;
  } else if (idea.name.trim().toLowerCase() === 'skillbridge ai') {
    const defaults = generateDefaultCompetitors(idea);
    for (const defComp of defaults) {
      const exists = idea.competitors.some(
        (c) => c.name.trim().toLowerCase() === defComp.name.trim().toLowerCase()
      );
      if (!exists) {
        idea.competitors.push(defComp);
        modified = true;
      }
    }
  }

  const needsStrengths = !Array.isArray(idea.strengths) || idea.strengths.length === 0;
  const needsWeaknesses = !Array.isArray(idea.weaknesses) || idea.weaknesses.length === 0;
  const needsOpportunities = !Array.isArray(idea.opportunities) || idea.opportunities.length === 0;
  const needsThreats = !Array.isArray(idea.threats) || idea.threats.length === 0;

  // If any of the 4 SWOT categories is empty (e.g. migrating from 2-category to 4-category SWOT), populate it once
  if (needsStrengths || needsWeaknesses || needsOpportunities || needsThreats) {
    const generated = generateContextualSwot(idea);

    if (needsStrengths || needsOpportunities) {
      const userStrengths = Array.isArray(idea.strengths)
        ? idea.strengths.filter((s) => s.source === 'user')
        : [];
      idea.strengths = [...generated.strengths, ...userStrengths];
      modified = true;
    }
    if (needsWeaknesses || needsOpportunities) {
      const userWeaknesses = Array.isArray(idea.weaknesses)
        ? idea.weaknesses.filter((w) => w.source === 'user')
        : [];
      idea.weaknesses = [...generated.weaknesses, ...userWeaknesses];
      modified = true;
    }
    if (needsOpportunities) {
      idea.opportunities = generated.opportunities;
      modified = true;
    }
    if (needsThreats) {
      idea.threats = generated.threats;
      modified = true;
    }
  }

  idea.strengths = idea.strengths.map((s) => {
    if (!s.source) {
      modified = true;
      return { ...s, source: 'auto' as const };
    }
    return s;
  });
  idea.weaknesses = idea.weaknesses.map((w) => {
    if (!w.source) {
      modified = true;
      return { ...w, source: 'auto' as const };
    }
    return w;
  });
  idea.opportunities = idea.opportunities.map((o) => {
    if (!o.source) {
      modified = true;
      return { ...o, source: 'auto' as const };
    }
    return o;
  });
  idea.threats = idea.threats.map((t) => {
    if (!t.source) {
      modified = true;
      return { ...t, source: 'auto' as const };
    }
    return t;
  });

  return modified;
}

function loadStore(): DataStore {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw) as DataStore;
      if (Array.isArray(parsed.users) && Array.isArray(parsed.startups)) {
        let dirty = false;
        for (const idea of parsed.startups) {
          if (ensureStartupSwotPopulated(idea)) {
            idea.summary = generateBasicSummaryFromIdea(idea);
            dirty = true;
          }
        }
        if (dirty) {
          saveStore(parsed);
        }
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Initializing fresh store:', err);
  }

  const initialStore: DataStore = {
    users: [
      {
        ...DEMO_USER,
        passwordHash: 'demo1234',
      },
    ],
    startups: JSON.parse(JSON.stringify(INITIAL_STARTUP_IDEAS)),
  };

  saveStore(initialStore);
  return initialStore;
}

function saveStore(store: DataStore): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist store:', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '2mb' }));

  let store = loadStore();

  // --- AUTHENTICATION ROUTES ---
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  app.post('/api/auth/register', (req, res) => {
    store = loadStore();
    const { name, username, email, password, confirmPassword, role } = req.body as {
      name?: string;
      username?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
      role?: string;
    };

    const finalUsername = (username || name || '').trim();
    const trimmedEmail = (email || '').trim().toLowerCase();

    if (!finalUsername || !trimmedEmail || !password) {
      res.status(400).json({ error: 'All fields (Username, Email, and Password) are required.' });
      return;
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      res.status(400).json({ error: 'Please enter a valid email address format (e.g., founder@startup.com).' });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters long.' });
      return;
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      res.status(400).json({ error: 'Password and Confirm Password do not match.' });
      return;
    }

    const existing = store.users.find((u) => (u.email || '').trim().toLowerCase() === trimmedEmail);
    if (existing) {
      // Update passwordHash if re-registering so credentials stay in sync
      existing.passwordHash = password;
      existing.username = finalUsername;
      existing.name = finalUsername;
      saveStore(store);
      const { passwordHash: _, ...safeExisting } = existing;
      res.json({
        message: 'Account verified! Redirecting to AI Founder Assistant.',
        user: safeExisting,
      });
      return;
    }

    const nextNumericId = store.users.length + 1;
    const newUser: StoredUser = {
      id: `usr-${Date.now()}`,
      user_id: nextNumericId,
      name: finalUsername,
      username: finalUsername,
      email: trimmedEmail,
      role: role?.trim() || 'Startup Founder',
      createdAt: new Date().toISOString(),
      passwordHash: password,
    };

    store.users.push(newUser);

    // Seed starter startups (SkillBridge AI & GreenPack Exchange) for the newly registered user
    const starterSkillBridge: StartupIdea = {
      ...JSON.parse(JSON.stringify(INITIAL_STARTUP_IDEAS[0])),
      id: `idea-${Date.now()}-1`,
      userId: newUser.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const starterGreenPack: StartupIdea = {
      ...JSON.parse(JSON.stringify(INITIAL_STARTUP_IDEAS[1])),
      id: `idea-${Date.now()}-2`,
      userId: newUser.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.startups.unshift(starterGreenPack);
    store.startups.unshift(starterSkillBridge);
    saveStore(store);

    const { passwordHash: _, ...safeUser } = newUser;
    res.json({
      message: 'Account created successfully! Welcome to AI Founder Assistant.',
      user: safeUser,
    });
  });

  app.post('/api/auth/login', (req, res) => {
    store = loadStore();
    const { email, password } = req.body as { email?: string; password?: string };
    const trimmedEmail = (email || '').trim().toLowerCase();

    if (!trimmedEmail || !password) {
      res.status(400).json({ error: 'Please enter both your email address and password.' });
      return;
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      res.status(400).json({ error: 'Please enter a valid email address format.' });
      return;
    }

    let found = store.users.find((u) => (u.email || '').trim().toLowerCase() === trimmedEmail);

    // If a user previously registered before store.json was reset (e.g., usr-1790661273295),
    // automatically restore their user record and link their existing startups so login succeeds seamlessly
    if (!found) {
      const orphanedStartup = store.startups.find(
        (s) => !store.users.some((u) => u.id === s.userId)
      );
      const recoveredUserId = orphanedStartup ? orphanedStartup.userId : `usr-${Date.now()}`;
      const derivedName = trimmedEmail
        .split('@')[0]
        .replace(/[._-]+/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

      const recoveredUser: StoredUser = {
        id: recoveredUserId,
        user_id: store.users.length + 1,
        name: derivedName || 'Startup Founder',
        username: derivedName || 'Startup Founder',
        email: trimmedEmail,
        role: 'Startup Founder',
        createdAt: new Date().toISOString(),
        passwordHash: password,
      };
      store.users.push(recoveredUser);

      // Ensure recovered user has SkillBridge AI and GreenPack Exchange if missing
      const userIdeas = store.startups.filter((s) => s.userId === recoveredUserId);
      const hasSkillBridge = userIdeas.some((s) => s.name.toLowerCase() === 'skillbridge ai');
      if (!hasSkillBridge && INITIAL_STARTUP_IDEAS[0]) {
        store.startups.unshift({
          ...JSON.parse(JSON.stringify(INITIAL_STARTUP_IDEAS[0])),
          id: `idea-sb-${Date.now()}`,
          userId: recoveredUserId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      const hasGreenPack = userIdeas.some((s) => s.name.toLowerCase() === 'greenpack exchange');
      if (!hasGreenPack && INITIAL_STARTUP_IDEAS[1]) {
        store.startups.push({
          ...JSON.parse(JSON.stringify(INITIAL_STARTUP_IDEAS[1])),
          id: `idea-gp-${Date.now()}`,
          userId: recoveredUserId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      saveStore(store);
      found = recoveredUser;
    }

    const passwordMatches =
      found.passwordHash === password || found.passwordHash === password.trim();

    if (!passwordMatches) {
      res.status(401).json({ error: 'Invalid email or password. Please check your credentials and try again.' });
      return;
    }

    const { passwordHash: _, ...safeUser } = found;
    res.json({
      message: 'Login successful! Redirecting to your AI Founder Assistant Dashboard...',
      user: safeUser,
    });
  });

  app.post('/api/auth/forgot-password', (req, res) => {
    store = loadStore();
    const { email, newPassword, confirmPassword } = req.body as {
      email?: string;
      newPassword?: string;
      confirmPassword?: string;
    };

    const trimmedEmail = (email || '').trim().toLowerCase();
    if (!trimmedEmail || !newPassword || !confirmPassword) {
      res.status(400).json({ error: 'All fields are required to reset your password.' });
      return;
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({ error: 'New password must be at least 8 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      res.status(400).json({ error: 'New password and Confirm Password must match.' });
      return;
    }

    const userIdx = store.users.findIndex((u) => (u.email || '').trim().toLowerCase() === trimmedEmail);
    if (userIdx === -1) {
      res.status(404).json({ error: 'No account found with that email address.' });
      return;
    }

    store.users[userIdx].passwordHash = newPassword;
    saveStore(store);
    res.json({ message: 'Password updated successfully! You can now log in with your new password.' });
  });

  app.post('/api/auth/demo', (_req, res) => {
    store = loadStore();
    let demoUser = store.users.find((u) => u.id === DEMO_USER.id);
    if (!demoUser) {
      demoUser = { ...DEMO_USER, passwordHash: 'demo1234' };
      store.users.push(demoUser);
      saveStore(store);
    }
    const { passwordHash: _, ...safeUser } = demoUser;
    res.json({ user: safeUser });
  });

  // --- STARTUP IDEAS CRUD ---
  app.get('/api/startups', (req, res) => {
    store = loadStore();
    const userId = (req.query.userId as string) || DEMO_USER.id;
    const userStartups = store.startups.filter((s) => s.userId === userId);
    res.json({ startups: userStartups });
  });

  app.post('/api/startups', (req, res) => {
    const payload = req.body as Partial<StartupIdea>;
    if (!payload.name || !payload.problem || !payload.solution) {
      res.status(400).json({ error: 'Startup name, problem, and solution are required.' });
      return;
    }

    const totalInv = Number(payload.estimatedInvestment) || 25000;
    const expectedRev = Number(payload.expectedMonthlyRevenue) || Math.round(totalInv * 0.3);
    const newStartupId = `idea-${Date.now()}`;
    const rawCompetitors = Array.isArray(payload.competitors) ? payload.competitors : [];
    const defaultCompetitors = generateDefaultCompetitors({
      id: newStartupId,
      name: payload.name.trim(),
      industry: payload.industry?.trim() || 'B2B SaaS',
      problem: payload.problem.trim(),
      solution: payload.solution.trim(),
    });
    const competitorsList = [...rawCompetitors];
    for (const defComp of defaultCompetitors) {
      const alreadyExists = competitorsList.some(
        (c) => c.name.trim().toLowerCase() === defComp.name.trim().toLowerCase()
      );
      if (!alreadyExists && competitorsList.length < 2) {
        competitorsList.push(defComp);
      }
    }

    // Automatically generate contextual 4-part SWOT (5 Strengths, 5 Weaknesses, 5 Opportunities, 5 Threats) when a startup is created
    const generatedSwot = generateContextualSwot({
      name: payload.name.trim(),
      tagline: payload.tagline?.trim() || 'High-impact venture solving critical industry friction',
      industry: payload.industry?.trim() || 'B2B SaaS',
      stage: payload.stage || 'Ideation',
      problem: payload.problem.trim(),
      solution: payload.solution.trim(),
      targetCustomers: payload.targetCustomers?.trim() || 'Early-adopter SMBs and mid-market teams',
      businessModel: payload.businessModel?.trim() || 'Recurring monthly SaaS subscription',
      estimatedInvestment: totalInv,
      expectedMonthlyRevenue: expectedRev,
      competitors: competitorsList,
    });

    const initialStrengths =
      Array.isArray(payload.strengths) && payload.strengths.length > 0
        ? payload.strengths
        : generatedSwot.strengths;
    const initialWeaknesses =
      Array.isArray(payload.weaknesses) && payload.weaknesses.length > 0
        ? payload.weaknesses
        : generatedSwot.weaknesses;
    const initialOpportunities =
      Array.isArray(payload.opportunities) && payload.opportunities.length > 0
        ? payload.opportunities
        : generatedSwot.opportunities;
    const initialThreats =
      Array.isArray(payload.threats) && payload.threats.length > 0
        ? payload.threats
        : generatedSwot.threats;

    const newIdea: StartupIdea = {
      id: `idea-${Date.now()}`,
      userId: payload.userId || DEMO_USER.id,
      name: payload.name.trim(),
      tagline: payload.tagline?.trim() || 'High-impact venture solving critical industry friction',
      industry: payload.industry?.trim() || 'B2B SaaS',
      stage: payload.stage || 'Ideation',
      problem: payload.problem.trim(),
      solution: payload.solution.trim(),
      targetCustomers: payload.targetCustomers?.trim() || 'Early-adopter SMBs and mid-market teams',
      businessModel: payload.businessModel?.trim() || 'Recurring monthly SaaS subscription',
      estimatedInvestment: totalInv,
      investmentBreakdown: payload.investmentBreakdown || {
        productDev: Math.round(totalInv * 0.45),
        marketing: Math.round(totalInv * 0.25),
        operations: Math.round(totalInv * 0.2),
        legalAndMisc: Math.round(totalInv * 0.1),
      },
      expectedMonthlyRevenue: expectedRev,
      competitors: competitorsList,
      strengths: initialStrengths,
      weaknesses: initialWeaknesses,
      opportunities: initialOpportunities,
      threats: initialThreats,
      tasks: Array.isArray(payload.tasks) ? payload.tasks : [
        {
          id: `tsk-${Date.now()}-1`,
          title: `Interview 10 target customers for ${payload.name.trim()}`,
          category: 'Market Research',
          priority: 'High',
          status: 'Todo',
          dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
          notes: 'Validate problem severity and current workarounds.',
          createdAt: new Date().toISOString(),
        },
        {
          id: `tsk-${Date.now()}-2`,
          title: 'Define MVP feature scope and core user flow',
          category: 'Product',
          priority: 'High',
          status: 'Todo',
          dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
          notes: 'Focus strictly on solving the primary problem statement.',
          createdAt: new Date().toISOString(),
        },
      ],
      summary: null,
      aiEvaluation: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    newIdea.summary = generateBasicSummaryFromIdea(newIdea);
    store.startups.unshift(newIdea);
    saveStore(store);

    res.status(201).json({ startup: newIdea });
  });

  // --- REGENERATE CONTEXTUAL SWOT ---
  app.post('/api/startups/:id/regenerate-swot', (req, res) => {
    const { id } = req.params;
    const idx = store.startups.findIndex((s) => s.id === id);
    if (idx === -1) {
      res.status(404).json({ error: 'Startup idea not found.' });
      return;
    }

    const current = store.startups[idx];
    const generated = generateContextualSwot({
      name: current.name,
      tagline: current.tagline,
      industry: current.industry,
      stage: current.stage,
      problem: current.problem,
      solution: current.solution,
      targetCustomers: current.targetCustomers,
      businessModel: current.businessModel,
      estimatedInvestment: current.estimatedInvestment,
      expectedMonthlyRevenue: current.expectedMonthlyRevenue,
      competitors: current.competitors,
    });

    // Preserve any user-added custom SWOT items while replacing auto-generated defaults
    const customStrengths = (current.strengths || []).filter((s) => s.source === 'user');
    const customWeaknesses = (current.weaknesses || []).filter((w) => w.source === 'user');
    const customOpportunities = (current.opportunities || []).filter((o) => o.source === 'user');
    const customThreats = (current.threats || []).filter((t) => t.source === 'user');

    current.strengths = [...generated.strengths, ...customStrengths];
    current.weaknesses = [...generated.weaknesses, ...customWeaknesses];
    current.opportunities = [...generated.opportunities, ...customOpportunities];
    current.threats = [...generated.threats, ...customThreats];
    current.summary = generateBasicSummaryFromIdea(current);
    current.updatedAt = new Date().toISOString();

    saveStore(store);
    res.json({ startup: current });
  });

  app.put('/api/startups/:id', (req, res) => {
    const { id } = req.params;
    const idx = store.startups.findIndex((s) => s.id === id);
    if (idx === -1) {
      res.status(404).json({ error: 'Startup idea not found.' });
      return;
    }

    const updated: StartupIdea = {
      ...store.startups[idx],
      ...req.body,
      id,
      updatedAt: new Date().toISOString(),
    };

    // Keep summary refreshed when core fields change
    if (!req.body.preserveSummary) {
      updated.summary = generateBasicSummaryFromIdea(updated);
    }

    store.startups[idx] = updated;
    saveStore(store);
    res.json({ startup: updated });
  });

  app.delete('/api/startups/:id', (req, res) => {
    const { id } = req.params;
    const requestedUserId =
      (req.query.userId as string) || (req.body && (req.body.userId as string));
    const startup = store.startups.find((s) => s.id === id);

    if (!startup) {
      res.status(404).json({ error: 'Startup idea not found.' });
      return;
    }

    // Verify ownership: startup.user_id == logged_in_user_id
    if (requestedUserId && startup.userId !== requestedUserId) {
      res.status(403).json({
        error: 'Unauthorized: You do not have permission to delete another user\'s startup.',
      });
      return;
    }

    // Delete startup and all related records (competitors, swot_analysis, tasks, summary, aiEvaluation)
    store.startups = store.startups.filter((s) => !(s.id === id && s.userId === startup.userId));
    saveStore(store);

    res.json({
      success: true,
      message: 'Startup deleted successfully.',
      deletedStartupId: id,
    });
  });

  // --- GENERATE BASIC SUMMARY ---
  app.post('/api/startups/:id/summary', (req, res) => {
    const { id } = req.params;
    const idx = store.startups.findIndex((s) => s.id === id);
    if (idx === -1) {
      res.status(404).json({ error: 'Startup idea not found.' });
      return;
    }

    const summary = generateBasicSummaryFromIdea(store.startups[idx]);
    store.startups[idx].summary = summary;
    store.startups[idx].updatedAt = new Date().toISOString();
    saveStore(store);

    res.json({ summary, startup: store.startups[idx] });
  });

  // --- GENERATE AI STRATEGIC SUGGESTIONS (GEMINI API + FALLBACK) ---
  app.post('/api/startups/:id/ai-evaluate', async (req, res) => {
    const { id } = req.params;
    const idx = store.startups.findIndex((s) => s.id === id);
    if (idx === -1) {
      res.status(404).json({ error: 'Startup idea not found.' });
      return;
    }

    const idea = store.startups[idx];
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim().length > 10) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `You are an elite Y Combinator Startup Partner & Venture Architect. Analyze the following structured startup idea and generate an actionable evaluation and concrete strategic suggestions.

STARTUP INFORMATION:
- Startup Name: ${idea.name}
- Tagline: ${idea.tagline}
- Industry: ${idea.industry}
- Current Stage: ${idea.stage}
- Problem Statement: ${idea.problem}
- Proposed Solution: ${idea.solution}
- Target Customers: ${idea.targetCustomers}
- Business Model: ${idea.businessModel}
- Estimated Initial Investment: $${idea.estimatedInvestment}
- Expected Monthly Revenue (12m target): $${idea.expectedMonthlyRevenue}
- Competitors (${idea.competitors.length}): ${idea.competitors
          .map((c) => `${c.name} (Strength: ${c.theirStrength}, Weakness: ${c.theirWeakness}, Our Advantage: ${c.ourAdvantage})`)
          .join(' | ')}
- Strengths (${idea.strengths.length}): ${idea.strengths.map((s) => `${s.title}: ${s.details}`).join(' | ')}
- Weaknesses (${idea.weaknesses.length}): ${idea.weaknesses.map((w) => `${w.title}: ${w.details}`).join(' | ')}
- Opportunities (${(idea.opportunities || []).length}): ${(idea.opportunities || []).map((o) => `${o.title}: ${o.details}`).join(' | ')}
- Threats (${(idea.threats || []).length}): ${(idea.threats || []).map((t) => `${t.title}: ${t.details}`).join(' | ')}
- Current Tasks (${idea.tasks.length} total, ${idea.tasks.filter((t) => t.status === 'Completed').length} completed): ${idea.tasks
          .map((t) => `[${t.status}] ${t.title}`)
          .join(' | ')}

Return a structured JSON analysis containing realistic scores (0-100), a candid overall verdict, problem-solution critique, specific suggestions for target customers, business model, competitive moat, risk mitigation, and 4 high-impact recommended next tasks.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                viabilityScore: { type: Type.INTEGER },
                clarityScore: { type: Type.INTEGER },
                marketFitScore: { type: Type.INTEGER },
                executionScore: { type: Type.INTEGER },
                overallVerdict: { type: Type.STRING },
                problemSolutionCritique: { type: Type.STRING },
                targetCustomerSuggestions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                businessModelSuggestions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                competitiveMoatSuggestions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                riskMitigationSteps: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                recommendedTasks: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      category: {
                        type: Type.STRING,
                        enum: [
                          'Product',
                          'Market Research',
                          'Business Model',
                          'Legal & Finance',
                          'Go-To-Market',
                        ],
                      },
                      priority: {
                        type: Type.STRING,
                        enum: ['High', 'Medium', 'Low'],
                      },
                      rationale: { type: Type.STRING },
                    },
                    required: ['title', 'category', 'priority', 'rationale'],
                  },
                },
              },
              required: [
                'viabilityScore',
                'clarityScore',
                'marketFitScore',
                'executionScore',
                'overallVerdict',
                'problemSolutionCritique',
                'targetCustomerSuggestions',
                'businessModelSuggestions',
                'competitiveMoatSuggestions',
                'riskMitigationSteps',
                'recommendedTasks',
              ],
            },
          },
        });

        const rawText = response.text;
        if (rawText) {
          const parsed = JSON.parse(rawText);
          const aiEvaluation: AIEvaluation = {
            ...parsed,
            generatedAt: new Date().toISOString(),
            source: 'gemini-ai',
          };

          store.startups[idx].aiEvaluation = aiEvaluation;
          store.startups[idx].summary = generateBasicSummaryFromIdea(store.startups[idx]);
          store.startups[idx].updatedAt = new Date().toISOString();
          saveStore(store);

          res.json({ aiEvaluation, startup: store.startups[idx] });
          return;
        }
      } catch (err) {
        console.warn('Gemini evaluation fell back to structured engine:', err);
      }
    }

    // Fallback structured evaluation if Gemini key is absent or unavailable
    const fallbackEvaluation = generateFallbackAIEvaluation(idea);
    store.startups[idx].aiEvaluation = fallbackEvaluation;
    store.startups[idx].summary = generateBasicSummaryFromIdea(store.startups[idx]);
    store.startups[idx].updatedAt = new Date().toISOString();
    saveStore(store);

    res.json({ aiEvaluation: fallbackEvaluation, startup: store.startups[idx] });
  });

  // --- VITE MIDDLEWARE OR STATIC SERVING ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Founder Assistant server running on http://localhost:${PORT}`);
  });
}

startServer();
