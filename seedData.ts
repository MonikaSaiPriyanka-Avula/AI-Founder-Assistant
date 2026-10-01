import { StartupIdea, StartupSummary, AIEvaluation, User, Competitor } from './types';
import { generateContextualSwot } from './swotGenerator';

export function generateDefaultCompetitors(idea: {
  id?: string;
  name: string;
  industry: string;
  problem?: string;
  solution?: string;
}): Competitor[] {
  const combined = `${idea.name} ${idea.industry} ${idea.problem || ''} ${idea.solution || ''}`.toLowerCase();
  const prefix = idea.id || 'startup';

  if (
    idea.name.trim().toLowerCase() === 'skillbridge ai' ||
    combined.includes('edtech') ||
    combined.includes('education') ||
    combined.includes('learning') ||
    combined.includes('student') ||
    combined.includes('course')
  ) {
    return [
      {
        id: `${prefix}-comp-coursera`,
        name: 'Coursera',
        category: 'EdTech / Online Learning',
        description:
          'Online learning platform offering courses, professional certificates, and career-focused learning programs.',
        pricingModel: 'Freemium + Coursera Plus subscription & certificate fees',
        threatLevel: 'Direct',
        theirStrength:
          'Online learning platform offering courses, professional certificates, and career-focused learning programs.',
        theirWeakness:
          'Pre-recorded generic courses that lack personalized AI career roadmaps and adaptive project practice.',
        ourAdvantage:
          'Personalized learning roadmaps, project suggestions, practice tasks, and job preparation guidance tailored to individual career goals.',
      },
      {
        id: `${prefix}-comp-udemy`,
        name: 'Udemy',
        category: 'EdTech / Online Learning',
        description:
          'Online course marketplace covering programming, technology, business, and career skills.',
        pricingModel: 'Pay-per-course marketplace + subscription plan',
        threatLevel: 'Direct',
        theirStrength:
          'Online course marketplace covering programming, technology, business, and career skills.',
        theirWeakness:
          'Fragmented course catalog where learners struggle to choose the right skills or follow a structured job-ready plan.',
        ourAdvantage:
          'End-to-end guided skill roadmap combining curated projects, practice tasks, and job readiness in one platform.',
      },
    ];
  }

  if (
    combined.includes('climatetech') ||
    combined.includes('packaging') ||
    combined.includes('sustainable') ||
    combined.includes('eco') ||
    combined.includes('greenpack')
  ) {
    return [
      {
        id: `${prefix}-comp-ecoenclose`,
        name: 'EcoEnclose',
        category: 'ClimateTech / Sustainable Packaging',
        description:
          'Sustainable packaging supplier offering recycled and eco-friendly mailers, boxes, and shipping supplies for e-commerce brands.',
        pricingModel: 'Direct per-unit packaging catalog pricing',
        threatLevel: 'Direct',
        theirStrength:
          'Sustainable packaging supplier offering recycled and eco-friendly mailers, boxes, and shipping supplies for e-commerce brands.',
        theirWeakness:
          'Single-supplier catalog model without multi-supplier marketplace price comparison or local exchange network.',
        ourAdvantage:
          'Multi-supplier comparison marketplace and reusable packaging network that lowers per-shipment cost.',
      },
      {
        id: `${prefix}-comp-packhelp`,
        name: 'Packhelp',
        category: 'ClimateTech / Sustainable Packaging',
        description:
          'Custom packaging marketplace connecting businesses with eco-friendly and branded packaging manufacturers.',
        pricingModel: 'Custom order quotes + subscription tier',
        threatLevel: 'Direct',
        theirStrength:
          'Custom packaging marketplace connecting businesses with eco-friendly and branded packaging manufacturers.',
        theirWeakness:
          'Focused primarily on custom branded print runs with higher minimum order quantities for small businesses.',
        ourAdvantage:
          'Transparent environmental impact comparison and accessible low-MOQ sustainable packaging sourcing.',
      },
    ];
  }

  if (
    combined.includes('fintech') ||
    combined.includes('finance') ||
    combined.includes('invoice') ||
    combined.includes('payment') ||
    combined.includes('accounting')
  ) {
    return [
      {
        id: `${prefix}-comp-ramp`,
        name: 'Ramp',
        category: 'FinTech / Financial Automation',
        description:
          'Corporate spend management, invoice automation, and financial controls platform for modern businesses.',
        pricingModel: 'Freemium SaaS + interchange revenue',
        threatLevel: 'Direct',
        theirStrength:
          'Corporate spend management, invoice automation, and financial controls platform for modern businesses.',
        theirWeakness:
          'Horizontal finance platform not specialized in line-item industry SKU rate-card enforcement.',
        ourAdvantage:
          'Domain-specific automated audit and workflow built specifically for target industry operations.',
      },
      {
        id: `${prefix}-comp-bill`,
        name: 'Bill.com',
        category: 'FinTech / Back-Office Finance',
        description:
          'Cloud-based accounts payable, billing, and payment workflow automation platform for SMBs.',
        pricingModel: 'Per-user monthly SaaS subscription + transaction fees',
        threatLevel: 'Moderate',
        theirStrength:
          'Cloud-based accounts payable, billing, and payment workflow automation platform for SMBs.',
        theirWeakness:
          'Focuses on payment routing rather than automated vendor overcharge recovery and price-creep detection.',
        ourAdvantage:
          'Real-time discrepancy detection and automated credit recovery with zero manual bookkeeping setup.',
      },
    ];
  }

  if (
    combined.includes('healthtech') ||
    combined.includes('health') ||
    combined.includes('clinic') ||
    combined.includes('pharmacy') ||
    combined.includes('medical')
  ) {
    return [
      {
        id: `${prefix}-comp-temptrak`,
        name: 'TempTrak Enterprise',
        category: 'HealthTech / Clinical Monitoring',
        description:
          'Enterprise wireless monitoring and regulatory compliance logging system for hospitals and healthcare facilities.',
        pricingModel: 'Upfront hardware capex + annual maintenance contract',
        threatLevel: 'Moderate',
        theirStrength:
          'Enterprise wireless monitoring and regulatory compliance logging system for hospitals and healthcare facilities.',
        theirWeakness:
          'Expensive on-premise IT setup that is cost-prohibitive for independent clinics and pharmacies.',
        ourAdvantage:
          'Plug-and-play self-install architecture with automated compliance reporting and predictive alerts.',
      },
      {
        id: `${prefix}-comp-sensaphone`,
        name: 'Sensaphone Cloud',
        category: 'HealthTech / Remote Monitoring',
        description:
          'Cloud-connected environmental and cold-storage alerting platform for clinics, pharmacies, and laboratories.',
        pricingModel: 'Hardware purchase + monthly cloud alerting subscription',
        threatLevel: 'Direct',
        theirStrength:
          'Cloud-connected environmental and cold-storage alerting platform for clinics, pharmacies, and laboratories.',
        theirWeakness:
          'Basic threshold alarms without predictive failure analytics or one-click regulatory audit exports.',
        ourAdvantage:
          'Purpose-built predictive diagnostics and automated inspection-ready compliance documentation.',
      },
    ];
  }

  const cleanIndustry = idea.industry.trim() || 'SaaS / Technology';
  return [
    {
      id: `${prefix}-comp-incumbent`,
      name: `${cleanIndustry.split('/')[0].trim()} Enterprise Suite`,
      category: `${cleanIndustry} / Established Platform`,
      description: `Established platform offering general-purpose tools, workflows, and enterprise services in ${cleanIndustry}.`,
      pricingModel: 'Enterprise annual license',
      threatLevel: 'Direct',
      theirStrength: `Established platform offering general-purpose tools, workflows, and enterprise services in ${cleanIndustry}.`,
      theirWeakness: 'Complex onboarding, high cost, and lack of specialized automation for target users.',
      ourAdvantage: `Purpose-built workflow automation and faster time-to-value tailored specifically for ${idea.name} customers.`,
    },
    {
      id: `${prefix}-comp-manual`,
      name: 'Legacy Point Tools & Spreadsheets',
      category: `${cleanIndustry} / Status-Quo Alternative`,
      description: `Traditional manual workflows, spreadsheets, and disconnected tools currently used by customers in ${cleanIndustry}.`,
      pricingModel: 'Staff labor + fragmented tool subscriptions',
      threatLevel: 'High',
      theirStrength: `Traditional manual workflows, spreadsheets, and disconnected tools currently used by customers in ${cleanIndustry}.`,
      theirWeakness: 'High manual effort, frequent human error, and lack of real-time intelligence.',
      ourAdvantage: 'Unified end-to-end platform that replaces manual work with automated insights.',
    },
  ];
}

export const DEMO_USER: User = {
  id: 'usr-founder-01',
  name: 'Alex Rivera',
  email: 'alex@founder.io',
  role: 'Founder & Product Architect',
  createdAt: '2026-08-12T09:00:00Z',
};

export function generateBasicSummaryFromIdea(idea: StartupIdea): StartupSummary {
  const completedTasks = idea.tasks.filter((t) => t.status === 'Completed').length;
  const inProgressTasks = idea.tasks.filter((t) => t.status === 'In Progress').length;
  const totalTasks = idea.tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const paybackMonths =
    idea.expectedMonthlyRevenue > 0
      ? Math.ceil(idea.estimatedInvestment / idea.expectedMonthlyRevenue)
      : 0;

  const topStrength =
    idea.strengths.length > 0
      ? idea.strengths[0].title
      : 'focused execution and lean validation approach';
  const topWeakness =
    idea.weaknesses.length > 0
      ? idea.weaknesses[0].title
      : 'early-stage brand awareness and distribution';
  const topOpportunity =
    idea.opportunities && idea.opportunities.length > 0
      ? idea.opportunities[0].title
      : 'expanding demand for specialized digital workflows';
  const topThreat =
    idea.threats && idea.threats.length > 0
      ? idea.threats[0].title
      : 'competition from established platforms';
  const competitorNames =
    idea.competitors.length > 0
      ? idea.competitors.map((c) => c.name).join(', ')
      : 'incumbent legacy solutions';

  return {
    elevatorPitch: `${idea.name} is a ${idea.industry} venture currently in the ${idea.stage} stage that helps ${idea.targetCustomers.split('.')[0] || 'target customers'} solve ${idea.problem.split('.')[0]?.toLowerCase() || 'critical workflow bottlenecks'} through ${idea.solution.split('.')[0]?.toLowerCase() || 'a modern, automated solution'}.`,
    executiveOverview: `${idea.name} ("${idea.tagline}") addresses a high-friction pain point in the ${idea.industry} sector. By targeting ${idea.targetCustomers}, the venture monetizes via ${idea.businessModel}. With an estimated initial capital requirement of $${idea.estimatedInvestment.toLocaleString()}, the startup projects $${idea.expectedMonthlyRevenue.toLocaleString()} in monthly recurring revenue at maturity.`,
    coreValueProposition: `Problem: ${idea.problem}\n\nSolution: ${idea.solution}`,
    financialSnapshot: `Estimated Capital Required: $${idea.estimatedInvestment.toLocaleString()} (Product Dev: $${idea.investmentBreakdown.productDev.toLocaleString()}, Marketing/GTM: $${idea.investmentBreakdown.marketing.toLocaleString()}, Operations: $${idea.investmentBreakdown.operations.toLocaleString()}, Legal/Misc: $${idea.investmentBreakdown.legalAndMisc.toLocaleString()}). Target Monthly Revenue: $${idea.expectedMonthlyRevenue.toLocaleString()}/mo${paybackMonths > 0 ? ` (~${paybackMonths} months gross capital payback)` : ''}.`,
    competitivePositioning: `Competes in a landscape alongside ${competitorNames}. Key internal strength centers on "${topStrength}" while addressing "${topWeakness}". Externally positioned to capture "${topOpportunity}" while defending against "${topThreat}".`,
    executionStatusSummary: `${completedTasks} of ${totalTasks} milestone tasks completed (${completionRate}% progress), with ${inProgressTasks} active workstreams currently in progress.`,
    generatedAt: new Date().toISOString(),
  };
}

export function generateFallbackAIEvaluation(idea: StartupIdea): AIEvaluation {
  const hasProblem = idea.problem.trim().length > 40;
  const hasSolution = idea.solution.trim().length > 40;
  const hasCustomers = idea.targetCustomers.trim().length > 25;
  const hasModel = idea.businessModel.trim().length > 25;
  const compCount = idea.competitors.length;
  const opportunitiesList = idea.opportunities || [];
  const threatsList = idea.threats || [];
  const swotCount =
    idea.strengths.length +
    idea.weaknesses.length +
    opportunitiesList.length +
    threatsList.length;
  const completedTasks = idea.tasks.filter((t) => t.status === 'Completed').length;
  const totalTasks = idea.tasks.length;

  const clarityScore = Math.min(
    96,
    55 + (hasProblem ? 15 : 5) + (hasSolution ? 15 : 5) + (hasCustomers ? 10 : 0)
  );
  const marketFitScore = Math.min(
    94,
    50 + (hasCustomers ? 15 : 5) + (hasModel ? 15 : 5) + Math.min(compCount * 6, 14)
  );
  const executionScore = Math.min(
    95,
    45 +
      (totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 35) : 0) +
      Math.min(swotCount * 2, 15)
  );
  const viabilityScore = Math.round(
    clarityScore * 0.35 + marketFitScore * 0.35 + executionScore * 0.3
  );

  return {
    viabilityScore,
    clarityScore,
    marketFitScore,
    executionScore,
    overallVerdict: `${idea.name} demonstrates a well-structured ${idea.industry} thesis with a clear link between customer pain and proposed solution. With $${idea.estimatedInvestment.toLocaleString()} in planned capital and ${swotCount} mapped SWOT factors, the highest-leverage priority is validating willingness-to-pay among early ${idea.targetCustomers.split(',')[0] || 'adopters'} while capitalizing on "${opportunitiesList[0]?.title || 'emerging market demand'}".`,
    problemSolutionCritique: `Your problem statement clearly identifies operational friction, and your solution directly addresses it. To strengthen investor readiness, quantify the exact cost of inaction for your customers (in hours saved or revenue recovered) within the first 30 days of onboarding.`,
    targetCustomerSuggestions: [
      `Narrow your initial beachhead segment within "${idea.targetCustomers.slice(0, 60)}..." to decision-makers who already have budget authority and immediate urgency.`,
      `Capitalize on key market opportunity: "${opportunitiesList[0]?.title || 'Growing demand for specialized automation'}" by tailoring onboarding templates to this segment.`,
      `Conduct 15 structured discovery interviews focused on past purchasing behavior rather than hypothetical interest in ${idea.name}.`,
    ],
    businessModelSuggestions: [
      `Test a tiered pricing structure anchored on measurable value metrics aligned with "${idea.businessModel.slice(0, 50)}..." rather than flat licensing alone.`,
      `Pursue strategic expansion opportunity: "${opportunitiesList[2]?.title || opportunitiesList[1]?.title || 'Institutional and channel partnerships'}" to lower customer acquisition costs.`,
      `Keep customer acquisition cost (CAC) payback under 6 months by pairing founder-led outbound sales with product-led referral loops.`,
    ],
    competitiveMoatSuggestions: [
      idea.competitors.length > 0
        ? `Differentiate sharply against ${idea.competitors.map((c) => c.name).join(' and ')} by competing on speed-to-value and workflow automation rather than feature bloat.`
        : `Defend against external threat: "${threatsList[0]?.title || 'Incumbent and status-quo alternatives'}" by building specialized domain workflows.`,
      `Embed proprietary workflow templates and domain-specific data benchmarks that increase switching costs over time.`,
      `Turn your primary internal strength ("${idea.strengths[0]?.title || 'agile product velocity'}") into a visible guarantee in your sales messaging.`,
    ],
    riskMitigationSteps: [
      `Mitigate internal weakness: "${idea.weaknesses[0]?.title || 'Early customer acquisition bottleneck'}" by allocating at least 30% of founder bandwidth to distribution and user activation.`,
      `Counter external threat: "${threatsList[1]?.title || threatsList[0]?.title || 'Market & technology shifts'}" through continuous curriculum/workflow updates and customer feedback loops.`,
      `Stage the $${idea.estimatedInvestment.toLocaleString()} budget across milestone gates—unlock marketing scale only after achieving >40% weekly active retention in your MVP cohort.`,
    ],
    recommendedTasks: [
      {
        title: `Interview 10 target buyers in ${idea.industry} to validate pricing tiers`,
        category: 'Market Research',
        priority: 'High',
        rationale: 'Confirms willingness-to-pay before committing full product development budget.',
      },
      {
        title: `Build interactive clickable prototype & onboarding flow for ${idea.name}`,
        category: 'Product',
        priority: 'High',
        rationale: 'Reduces engineering rework and tests core activation loop with design partners.',
      },
      {
        title: `Create competitive battlecard comparing ${idea.name} vs top alternatives`,
        category: 'Go-To-Market',
        priority: 'Medium',
        rationale: 'Equips founder-led sales with crisp objection-handling talking points.',
      },
      {
        title: `Model 12-month cash flow and runway sensitivity against $${idea.estimatedInvestment.toLocaleString()} budget`,
        category: 'Legal & Finance',
        priority: 'Medium',
        rationale: 'Ensures disciplined capital allocation across product and marketing milestones.',
      },
    ],
    generatedAt: new Date().toISOString(),
    source: 'structured-engine',
  };
}

export const INITIAL_STARTUP_IDEAS: StartupIdea[] = [
  {
    id: 'idea-skillbridge-01',
    userId: 'usr-founder-01',
    name: 'SkillBridge AI',
    tagline: 'Personalized AI learning roadmaps, project suggestions, and career prep for students',
    industry: 'EdTech / Artificial Intelligence',
    stage: 'Validation',
    problem:
      'Many students learn different technologies but struggle to choose the right skills, create a learning plan, and prepare for jobs.',
    solution:
      "SkillBridge AI provides personalized learning roadmaps, project suggestions, practice tasks, and job preparation guidance based on a student's career goal.",
    targetCustomers:
      'College students, fresh graduates, and entry-level job seekers',
    businessModel:
      'Freemium subscription',
    estimatedInvestment: 25000,
    investmentBreakdown: {
      productDev: 11250,
      marketing: 6250,
      operations: 5000,
      legalAndMisc: 2500,
    },
    expectedMonthlyRevenue: 9500,
    competitors: [],
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: [],
    tasks: [
      {
        id: 'tsk-sb-1',
        title: 'Survey 30 college students and fresh graduates on career roadmap pain points',
        category: 'Market Research',
        priority: 'High',
        status: 'Completed',
        dueDate: '2026-09-12',
        notes: 'Validated that 83% struggle to bridge tutorial learning into job-ready projects.',
        createdAt: '2026-09-01T10:00:00Z',
      },
      {
        id: 'tsk-sb-2',
        title: 'Build personalized AI career roadmap generator and skill assessment flow',
        category: 'Product',
        priority: 'High',
        status: 'In Progress',
        dueDate: '2026-10-05',
        notes: 'Integrating role-specific project templates and practice task rubrics.',
        createdAt: '2026-09-10T10:00:00Z',
      },
      {
        id: 'tsk-sb-3',
        title: 'Partner with 3 university coding clubs for freemium beta launch',
        category: 'Go-To-Market',
        priority: 'Medium',
        status: 'Todo',
        dueDate: '2026-10-20',
        notes: 'Offer free mock-interview credits for early student ambassadors.',
        createdAt: '2026-09-15T10:00:00Z',
      },
    ],
    summary: null,
    aiEvaluation: null,
    createdAt: '2026-09-01T09:00:00Z',
    updatedAt: '2026-09-28T10:00:00Z',
  },
  {
    id: 'idea-greenpack-01',
    userId: 'usr-founder-01',
    name: 'GreenPack Exchange',
    tagline: 'Reusable smart-tagged B2B packaging exchange & reverse logistics network',
    industry: 'ClimateTech / Sustainable Packaging',
    stage: 'Validation',
    problem:
      'E-commerce and food-delivery brands generate millions of tons of single-use corrugated and plastic packaging waste while paying rising per-unit packaging costs and facing strict EPR sustainability mandates.',
    solution:
      'GreenPack Exchange provides standardized, reusable smart-tagged shipping containers and a B2B reverse-logistics exchange network that lowers per-shipment packaging cost by 30% and tracks carbon savings.',
    targetCustomers:
      'Mid-market D2C e-commerce brands, regional meal-kit & grocery delivery operators, and sustainable CPG distributors.',
    businessModel:
      'B2B container-as-a-service subscription + per-cycle sanitization and exchange fee.',
    estimatedInvestment: 28500,
    investmentBreakdown: {
      productDev: 12825,
      marketing: 7125,
      operations: 5700,
      legalAndMisc: 2850,
    },
    expectedMonthlyRevenue: 8000,
    competitors: [
      {
        id: 'comp-gp-1',
        name: 'Single-Use Corrugated Suppliers',
        category: 'Legacy Packaging',
        pricingModel: '$1.40–$2.80 per single-use box',
        threatLevel: 'High',
        theirStrength: 'Ubiquitous supply chain and zero reverse-logistics requirement.',
        theirWeakness: '100% landfill/recycling waste after one trip and rising pulp costs.',
        ourAdvantage: '30% lower cost per shipment over 20+ reuse cycles with automated ESG reporting.',
      },
    ],
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: [],
    tasks: [
      {
        id: 'tsk-gp-1',
        title: 'Run 60-day reusable container pilot with 3 regional meal-kit brands',
        category: 'Market Research',
        priority: 'High',
        status: 'In Progress',
        dueDate: '2026-10-12',
        notes: 'Tracking container return rates and wash-cycle turnaround time.',
        createdAt: '2026-09-05T10:00:00Z',
      },
    ],
    summary: null,
    aiEvaluation: null,
    createdAt: '2026-09-03T09:00:00Z',
    updatedAt: '2026-09-27T14:00:00Z',
  },
  {
    id: 'idea-pulseflow-01',
    userId: 'usr-founder-01',
    name: 'PulseFlow ColdChain',
    tagline: 'Predictive IoT & compliance automation for independent pharmacy & clinic cold storage',
    industry: 'HealthTech / B2B SaaS',
    stage: 'Validation',
    problem:
      'Independent pharmacies, fertility clinics, and specialty medical practices lose $35,000+ annually per site due to vaccine and biologics temperature excursions, manual paper temperature logs, and failed CDC/FDA compliance audits.',
    solution:
      'Plug-and-play wireless sub-zero IoT sensors paired with an automated cloud compliance dashboard that predicts compressor failure 48 hours in advance and auto-generates audit-ready FDA/CDC temperature logs.',
    targetCustomers:
      'Independent retail pharmacies (22,000+ in the US), outpatient specialty clinics, veterinary hospitals, and regional diagnostic labs managing $50k–$500k in refrigerated inventory.',
    businessModel:
      'Hardware-enabled SaaS (HaaS): $0 upfront sensor kit with a $149/month per-location subscription (24-month contract) + $39/month per additional ultra-low freezer probe. 82% gross software margin.',
    estimatedInvestment: 45000,
    investmentBreakdown: {
      productDev: 21000,
      marketing: 11000,
      operations: 8000,
      legalAndMisc: 5000,
    },
    expectedMonthlyRevenue: 14900,
    competitors: [
      {
        id: 'comp-1',
        name: 'TempTrak Enterprise',
        category: 'Legacy Hospital Hardware',
        pricingModel: '$12,000+ upfront capex + annual maintenance contract',
        threatLevel: 'Moderate',
        theirStrength: 'Deep entrenchment in large hospital networks and multi-building campuses.',
        theirWeakness: 'Requires expensive on-premise IT installation; unaffordable for independent clinics.',
        ourAdvantage: '5-minute self-install cellular hub with zero upfront hardware capex and predictive alerts.',
      },
      {
        id: 'comp-2',
        name: 'Sensaphone Cloud',
        category: 'General Industrial Monitoring',
        pricingModel: '$350 hardware + $15/mo basic alerting',
        threatLevel: 'Direct',
        theirStrength: 'Low cost and reliable basic SMS/email threshold alarms.',
        theirWeakness: 'Generic industrial UI; lacks automated CDC VFC compliance reports and predictive failure diagnostics.',
        ourAdvantage: 'Purpose-built one-click VFC/FDA regulatory audit reports and compressor anomaly detection.',
      },
      {
        id: 'comp-3',
        name: 'Manual Clipboard & USB Loggers',
        category: 'Status Quo / Manual Process',
        pricingModel: '$60 one-time USB stick + 15 mins/day staff labor',
        threatLevel: 'High',
        theirStrength: 'Zero monthly subscription cost and familiar habit for clinic staff.',
        theirWeakness: 'No real-time weekend/overnight spoilage alerts; high human error during inspections.',
        ourAdvantage: 'Saves 90+ hours of pharmacist/nurse logging per year and prevents single $18,000 overnight outage.',
      },
    ],
    strengths: [
      {
        id: 'swot-s1',
        type: 'strength',
        title: 'Immediate ROI vs Single Spoilage Event',
        impact: 'High',
        details: 'One saved refrigerator outage ($15k–$40k in biologics/vaccines) pays for 8+ years of subscription.',
        actionPlan: 'Anchor all sales demos around an interactive Spoilage Risk & Audit Labor Calculator.',
      },
      {
        id: 'swot-s2',
        type: 'strength',
        title: 'Zero-IT Cellular Plug-and-Play Architecture',
        impact: 'High',
        details: 'Uses pre-activated LTE-M cellular backhaul so clinics never have to configure hospital firewalls or Wi-Fi.',
        actionPlan: 'Offer a 14-day live trial sensor kit shipped directly to pharmacy owners.',
      },
      {
        id: 'swot-s3',
        type: 'strength',
        title: 'High Switching Costs & Net Dollar Retention',
        impact: 'Medium',
        details: 'Once compliance logs and historical audit trails live in PulseFlow, churn drops below 3% annually.',
        actionPlan: 'Lock in 24-month agreements with automated state pharmacy board audit export templates.',
      },
    ],
    weaknesses: [
      {
        id: 'swot-w1',
        type: 'weakness',
        title: 'Working Capital Tied Up in Sensor Inventory',
        impact: 'High',
        details: 'Offering $0 upfront hardware requires financing $115 BOM cost per kit before subscription payback.',
        actionPlan: 'Charge an annual upfront prepay option (2 months free) or a $199 activation fee to cover hardware COGS.',
      },
      {
        id: 'swot-w2',
        type: 'weakness',
        title: 'Fragmented SMB Pharmacy Distribution',
        impact: 'Medium',
        details: 'Independent pharmacies are busy and skeptical of cold calls during business hours.',
        actionPlan: 'Partner with regional pharmacy buying groups (PSAO) and compounding pharmacy associations.',
      },
    ],
    opportunities: [],
    threats: [],
    tasks: [
      {
        id: 'tsk-101',
        title: 'Complete 15 customer discovery interviews with independent pharmacy owners',
        category: 'Market Research',
        priority: 'High',
        status: 'Completed',
        dueDate: '2026-09-05',
        notes: '12 of 15 confirmed they still use manual USB loggers and dread state board inspections.',
        createdAt: '2026-08-15T10:00:00Z',
      },
      {
        id: 'tsk-102',
        title: 'Assemble 10 LTE-M prototype sensor kits with NIST-calibrated probes',
        category: 'Product',
        priority: 'High',
        status: 'Completed',
        dueDate: '2026-09-14',
        notes: 'Sourced enclosures and calibrated probes; BOM landed at $112/unit at small batch.',
        createdAt: '2026-08-20T10:00:00Z',
      },
      {
        id: 'tsk-103',
        title: 'Build automated CDC VFC PDF compliance report generator in web dashboard',
        category: 'Product',
        priority: 'High',
        status: 'In Progress',
        dueDate: '2026-09-30',
        notes: 'Core telemetry ingestion complete; formatting official state inspection PDF signature block.',
        createdAt: '2026-09-01T10:00:00Z',
      },
      {
        id: 'tsk-104',
        title: 'Sign 5 paid pilot clinics at $149/mo for 60-day live field validation',
        category: 'Go-To-Market',
        priority: 'High',
        status: 'In Progress',
        dueDate: '2026-10-10',
        notes: '3 pharmacies onboarded; 2 fertility clinics reviewing pilot agreement.',
        createdAt: '2026-09-08T10:00:00Z',
      },
      {
        id: 'tsk-105',
        title: 'Finalize hardware lease & limitation-of-liability terms with healthcare counsel',
        category: 'Legal & Finance',
        priority: 'Medium',
        status: 'Todo',
        dueDate: '2026-10-18',
        notes: 'Ensure clear SLA boundaries so software subscription is not liable for power grid outages.',
        createdAt: '2026-09-12T10:00:00Z',
      },
      {
        id: 'tsk-106',
        title: 'Establish partnership with Specialty Pharmacy Insurance Broker for 10% premium discount',
        category: 'Business Model',
        priority: 'Low',
        status: 'Todo',
        dueDate: '2026-10-28',
        notes: 'Insurers reduce spoilage policy rates when continuous cellular monitoring is active.',
        createdAt: '2026-09-15T10:00:00Z',
      },
    ],
    summary: null,
    aiEvaluation: null,
    createdAt: '2026-08-15T09:30:00Z',
    updatedAt: '2026-09-25T16:20:00Z',
  },
  {
    id: 'idea-cartonloop-02',
    userId: 'usr-founder-01',
    name: 'VendorShield AI',
    tagline: 'Automated invoice reconciliation & contract price-creep detection for mid-market hospitality groups',
    industry: 'FinTech / Vertical SaaS',
    stage: 'Ideation',
    problem:
      'Multi-location restaurant and boutique hotel operators lose 3.5% to 6% of food, linen, and beverage COGS due to silent vendor price creep, delivery short-weights, and SKU substitution errors buried across hundreds of paper and PDF invoices weekly.',
    solution:
      'An automated accounts-payable copilot that ingests vendor delivery receipts via mobile photo or email, cross-checks every line item against contracted rate cards in real time, and automatically dispatches credit memo requests to suppliers.',
    targetCustomers:
      'Multi-unit restaurant groups (3 to 40 locations), independent boutique hotel operators, and regional catering commissaries spending $1M–$15M annually on perishable vendor supplies.',
    businessModel:
      'Tiered SaaS + Performance Share: $249/month per location base platform fee, or 20% contingency share on verified vendor overcharge credits recovered during the first 90 days.',
    estimatedInvestment: 28000,
    investmentBreakdown: {
      productDev: 14500,
      marketing: 7500,
      operations: 3500,
      legalAndMisc: 2500,
    },
    expectedMonthlyRevenue: 11200,
    competitors: [
      {
        id: 'comp-201',
        name: 'MarginEdge',
        category: 'Restaurant Back-Office Suite',
        pricingModel: '$330/month per location flat fee',
        threatLevel: 'Direct',
        theirStrength: 'Strong POS integrations and recipe costing features.',
        theirWeakness: 'Focuses on historical accounting exports rather than automated vendor contract dispute recovery.',
        ourAdvantage: 'Zero-setup contract rate-card enforcement and 1-click automated vendor credit claim workflows.',
      },
      {
        id: 'comp-202',
        name: 'Manual Spreadsheet Spot-Checks',
        category: 'Status Quo / Internal Bookkeeper',
        pricingModel: '10+ hours/week of GM or chef time',
        threatLevel: 'High',
        theirStrength: 'No software cost; chefs feel they know their local purveyors.',
        theirWeakness: 'Only catches ~15% of gradual SKU price increases and weight discrepancies.',
        ourAdvantage: 'Audits 100% of line items in 10 seconds and flags contract deviations before payment clears.',
      },
    ],
    strengths: [
      {
        id: 'swot-s201',
        type: 'strength',
        title: 'Self-Funding Value Proposition',
        impact: 'High',
        details: 'Average restaurant location recovers $850–$1,400/month in overcharges, making software 4x ROI positive in month one.',
        actionPlan: 'Offer a "90-Day Historical Invoice Audit" lead magnet that uncovers real overcharges for free.',
      },
    ],
    weaknesses: [
      {
        id: 'swot-w201',
        type: 'weakness',
        title: 'Messy Handwritten Delivery Invoices',
        impact: 'Medium',
        details: 'Drivers often scratch out quantities in pen on crumpled carbon paper at loading docks.',
        actionPlan: 'Use multimodal vision extraction with human-in-the-loop confidence flags for low-legibility lines.',
      },
    ],
    opportunities: [],
    threats: [],
    tasks: [
      {
        id: 'tsk-201',
        title: 'Collect 200 real historical foodservice invoices from 3 local restaurant groups',
        category: 'Market Research',
        priority: 'High',
        status: 'Completed',
        dueDate: '2026-09-10',
        notes: 'Found $4,120 in uncontracted price creep across just 60 days of produce and dairy invoices.',
        createdAt: '2026-08-28T10:00:00Z',
      },
      {
        id: 'tsk-202',
        title: 'Build line-item SKU normalization and contract rate comparison engine',
        category: 'Product',
        priority: 'High',
        status: 'In Progress',
        dueDate: '2026-10-02',
        notes: 'Handling unit-of-measure conversions (case vs lb vs each).',
        createdAt: '2026-09-05T10:00:00Z',
      },
      {
        id: 'tsk-203',
        title: 'Launch "Free 60-Day Overcharge Audit" landing page for hospitality CFOs',
        category: 'Go-To-Market',
        priority: 'Medium',
        status: 'Todo',
        dueDate: '2026-10-15',
        notes: 'Target regional restaurant association newsletters.',
        createdAt: '2026-09-12T10:00:00Z',
      },
    ],
    summary: null,
    aiEvaluation: null,
    createdAt: '2026-08-28T14:00:00Z',
    updatedAt: '2026-09-24T11:15:00Z',
  },
];

// Populate contextual default competitors (2 per startup without duplicates) & SWOT (5 strengths, 5 weaknesses, 5 opportunities, 5 threats), initial summaries & AI evaluations
for (const idea of INITIAL_STARTUP_IDEAS) {
  if (!Array.isArray(idea.competitors) || idea.competitors.length === 0) {
    idea.competitors = generateDefaultCompetitors(idea);
  } else if (idea.competitors.length < 2) {
    const defaults = generateDefaultCompetitors(idea);
    for (const defComp of defaults) {
      const alreadyExists = idea.competitors.some(
        (c) => c.name.trim().toLowerCase() === defComp.name.trim().toLowerCase()
      );
      if (!alreadyExists && idea.competitors.length < 2) {
        idea.competitors.push(defComp);
      }
    }
  }

  const generatedSwot = generateContextualSwot(idea);
  if (!Array.isArray(idea.strengths) || idea.strengths.length < 5) {
    idea.strengths = generatedSwot.strengths;
  } else {
    idea.strengths = idea.strengths.map((s) => ({ ...s, source: s.source || 'auto' }));
  }

  if (!Array.isArray(idea.weaknesses) || idea.weaknesses.length < 5) {
    idea.weaknesses = generatedSwot.weaknesses;
  } else {
    idea.weaknesses = idea.weaknesses.map((w) => ({ ...w, source: w.source || 'auto' }));
  }

  if (!Array.isArray(idea.opportunities) || idea.opportunities.length < 5) {
    idea.opportunities = generatedSwot.opportunities;
  } else {
    idea.opportunities = idea.opportunities.map((o) => ({ ...o, source: o.source || 'auto' }));
  }

  if (!Array.isArray(idea.threats) || idea.threats.length < 5) {
    idea.threats = generatedSwot.threats;
  } else {
    idea.threats = idea.threats.map((t) => ({ ...t, source: t.source || 'auto' }));
  }

  idea.summary = generateBasicSummaryFromIdea(idea);
}
INITIAL_STARTUP_IDEAS[0].aiEvaluation = generateFallbackAIEvaluation(INITIAL_STARTUP_IDEAS[0]);
INITIAL_STARTUP_IDEAS[1].aiEvaluation = generateFallbackAIEvaluation(INITIAL_STARTUP_IDEAS[1]);
