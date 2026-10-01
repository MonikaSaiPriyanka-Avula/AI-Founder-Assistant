export interface User {
  id: string;
  user_id?: number;
  name: string;
  username?: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface Competitor {
  id: string;
  name: string;
  category: string;
  description?: string;
  pricingModel: string;
  threatLevel: 'Low' | 'Moderate' | 'High' | 'Direct';
  theirStrength: string;
  theirWeakness: string;
  ourAdvantage: string;
}

export type SwotCategory = 'strength' | 'weakness' | 'opportunity' | 'threat';

export interface SwotItem {
  id: string;
  type: SwotCategory;
  title: string;
  impact: 'High' | 'Medium' | 'Low';
  details: string;
  actionPlan: string;
  source?: 'auto' | 'user';
}

export type TaskCategory =
  | 'Product'
  | 'Market Research'
  | 'Business Model'
  | 'Legal & Finance'
  | 'Go-To-Market';

export type TaskPriority = 'High' | 'Medium' | 'Low';
export type TaskStatus = 'Todo' | 'In Progress' | 'Completed';

export interface StartupTask {
  id: string;
  title: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  notes?: string;
  createdAt: string;
}

export interface StartupSummary {
  elevatorPitch: string;
  executiveOverview: string;
  coreValueProposition: string;
  financialSnapshot: string;
  competitivePositioning: string;
  executionStatusSummary: string;
  generatedAt: string;
}

export interface RecommendedTaskSuggestion {
  title: string;
  category: TaskCategory;
  priority: TaskPriority;
  rationale: string;
}

export interface AIEvaluation {
  viabilityScore: number;
  clarityScore: number;
  marketFitScore: number;
  executionScore: number;
  overallVerdict: string;
  problemSolutionCritique: string;
  targetCustomerSuggestions: string[];
  businessModelSuggestions: string[];
  competitiveMoatSuggestions: string[];
  riskMitigationSteps: string[];
  recommendedTasks: RecommendedTaskSuggestion[];
  generatedAt: string;
  source: 'gemini-ai' | 'structured-engine';
}

export type StartupStage =
  | 'Ideation'
  | 'Validation'
  | 'MVP Building'
  | 'Early Traction'
  | 'Seed Ready';

export interface InvestmentBreakdown {
  productDev: number;
  marketing: number;
  operations: number;
  legalAndMisc: number;
}

export interface StartupIdea {
  id: string;
  userId: string;
  name: string;
  tagline: string;
  industry: string;
  stage: StartupStage;
  problem: string;
  solution: string;
  targetCustomers: string;
  businessModel: string;
  estimatedInvestment: number;
  investmentBreakdown: InvestmentBreakdown;
  expectedMonthlyRevenue: number;
  competitors: Competitor[];
  strengths: SwotItem[];
  weaknesses: SwotItem[];
  opportunities: SwotItem[];
  threats: SwotItem[];
  tasks: StartupTask[];
  summary: StartupSummary | null;
  aiEvaluation: AIEvaluation | null;
  createdAt: string;
  updatedAt: string;
}

export type ActiveTab =
  | 'dashboard'
  | 'create-startup'
  | 'my-startups'
  | 'competitors'
  | 'swot'
  | 'tasks'
  | 'startup-summary'
  | 'ai-suggestions';
