import { SwotItem, StartupStage, Competitor } from './types';

export interface SwotGenerationInput {
  name: string;
  tagline?: string;
  industry: string;
  stage?: StartupStage | string;
  problem: string;
  solution: string;
  targetCustomers: string;
  businessModel: string;
  estimatedInvestment?: number;
  expectedMonthlyRevenue?: number;
  competitors?: Competitor[];
}

/**
 * Dynamically generates a complete 4-quadrant SWOT Analysis:
 * - 5 Strengths (internal advantages)
 * - 5 Weaknesses (internal limitations or challenges)
 * - 5 Opportunities (external market opportunities)
 * - 5 Threats (external risks, competitors, technology/regulatory shifts)
 * tailored to the startup's actual name, tagline, industry, stage, problem,
 * solution, target customers, business model, investment, revenue, and competitors.
 */
export function generateContextualSwot(input: SwotGenerationInput): {
  strengths: SwotItem[];
  weaknesses: SwotItem[];
  opportunities: SwotItem[];
  threats: SwotItem[];
} {
  const name = (input.name || 'The Startup').trim();
  const tagline = (input.tagline || '').trim();
  const industry = (input.industry || 'Technology').trim();
  const stage = (input.stage || 'Ideation').trim();
  const problem = (input.problem || '').trim();
  const solution = (input.solution || '').trim();
  const customers = (input.targetCustomers || 'target customers').trim();
  const model = (input.businessModel || 'subscription model').trim();
  const investment = Number(input.estimatedInvestment) || 25000;
  const revenue = Number(input.expectedMonthlyRevenue) || 8000;
  const competitors = Array.isArray(input.competitors) ? input.competitors : [];

  const combinedText =
    `${name} ${tagline} ${industry} ${problem} ${solution} ${customers} ${model}`.toLowerCase();

  const isEdTech =
    combinedText.includes('edtech') ||
    combinedText.includes('student') ||
    combinedText.includes('learning') ||
    combinedText.includes('education') ||
    combinedText.includes('course') ||
    combinedText.includes('graduate') ||
    combinedText.includes('skill') ||
    combinedText.includes('career');

  const isAI =
    combinedText.includes('ai') ||
    combinedText.includes('artificial intelligence') ||
    combinedText.includes('machine learning') ||
    combinedText.includes('llm') ||
    combinedText.includes('copilot') ||
    combinedText.includes('automated') ||
    combinedText.includes('predictive');

  const isClimate =
    combinedText.includes('climate') ||
    combinedText.includes('sustainability') ||
    combinedText.includes('reusable') ||
    combinedText.includes('carbon') ||
    combinedText.includes('energy') ||
    combinedText.includes('green') ||
    combinedText.includes('packaging') ||
    combinedText.includes('waste');

  const isFinTech =
    combinedText.includes('fintech') ||
    combinedText.includes('invoice') ||
    combinedText.includes('payment') ||
    combinedText.includes('finance') ||
    combinedText.includes('bank') ||
    combinedText.includes('accounting') ||
    combinedText.includes('credit') ||
    combinedText.includes('audit');

  const isHealthTech =
    combinedText.includes('health') ||
    combinedText.includes('medical') ||
    combinedText.includes('clinic') ||
    combinedText.includes('pharmacy') ||
    combinedText.includes('patient') ||
    combinedText.includes('biologic') ||
    combinedText.includes('vaccine') ||
    combinedText.includes('fda');

  const isFreemium = combinedText.includes('freemium') || combinedText.includes('free tier');
  const isSaaS =
    combinedText.includes('saas') ||
    combinedText.includes('subscription') ||
    combinedText.includes('monthly') ||
    combinedText.includes('recurring');

  const now = Date.now();
  const strengths: SwotItem[] = [];
  const weaknesses: SwotItem[] = [];
  const opportunities: SwotItem[] = [];
  const threats: SwotItem[] = [];

  // =========================================================================
  // 1. EDTECH / AI LEARNING & CAREER ROADMAP PROFILE (e.g., SkillBridge AI)
  // =========================================================================
  if (isEdTech && (isAI || combinedText.includes('roadmap') || combinedText.includes('job'))) {
    strengths.push(
      {
        id: `swot-s-${now}-1`,
        type: 'strength',
        title: 'Personalized learning recommendations based on individual career goals.',
        impact: 'High',
        details: `By tailoring roadmaps and guidance to each user's goal ("${solution.slice(0, 110)}${solution.length > 110 ? '...' : ''}"), ${name} directly solves skill-selection overload.`,
        actionPlan: `Showcase interactive personalized roadmap previews during user onboarding to maximize day-1 activation.`,
        source: 'auto',
      },
      {
        id: `swot-s-${now}-2`,
        type: 'strength',
        title: 'Combines learning roadmaps, projects, practice, and career preparation.',
        impact: 'High',
        details: `Consolidating fragmented learning steps, project building, and interview readiness into a single unified platform increases retention and daily engagement.`,
        actionPlan: `Guide learners seamlessly from roadmap milestones to portfolio-ready projects and job preparation checklists.`,
        source: 'auto',
      },
      {
        id: `swot-s-${now}-3`,
        type: 'strength',
        title: 'Large potential audience among students and fresh graduates.',
        impact: 'High',
        details: `Millions of ${customers.toLowerCase().replace(/\.$/, '')} enter the job market each year seeking structured career guidance and practical skill validation.`,
        actionPlan: `Drive organic campus adoption through student ambassadors, coding clubs, and graduate cohorts.`,
        source: 'auto',
      },
      {
        id: `swot-s-${now}-4`,
        type: 'strength',
        title: isFreemium
          ? 'Freemium model allows users to try the platform before subscribing.'
          : `Accessible ${model} pricing lowers friction for early student adopters.`,
        impact: 'Medium',
        details: `Allowing ${customers.toLowerCase()} to experience immediate value through a ${model} model reduces acquisition friction and fuels peer referrals.`,
        actionPlan: `Offer core roadmap generation for free while gating advanced project reviews and mock interviews in the premium tier.`,
        source: 'auto',
      },
      {
        id: `swot-s-${now}-5`,
        type: 'strength',
        title: 'Digital product can scale to users across multiple locations.',
        impact: 'Medium',
        details: `Cloud-native delivery enables ${name} to serve learners across universities and regions simultaneously with a lean $${investment.toLocaleString()} initial investment.`,
        actionPlan: `Ensure mobile-responsive, low-latency access to scale across tier-1, tier-2, and international student markets.`,
        source: 'auto',
      }
    );

    weaknesses.push(
      {
        id: `swot-w-${now}-1`,
        type: 'weakness',
        title: 'New platform may have limited brand recognition initially.',
        impact: 'High',
        details: `At the ${stage} stage, ${name} lacks the established reputation and alumni placement track record of older career platforms.`,
        actionPlan: `Publish verified student portfolio outcomes and early beta placement testimonials to build credibility quickly.`,
        source: 'auto',
      },
      {
        id: `swot-w-${now}-2`,
        type: 'weakness',
        title: 'AI recommendations may sometimes be inaccurate or too generic.',
        impact: 'High',
        details: `Without curated domain rubrics, automated skill roadmaps or project suggestions risk feeling repetitive or disconnected from employer expectations.`,
        actionPlan: `Ground AI learning paths in real employer job descriptions and industry-vetted skill competency matrices.`,
        source: 'auto',
      },
      {
        id: `swot-w-${now}-3`,
        type: 'weakness',
        title: 'Requires continuous updating of learning content and technology trends.',
        impact: 'Medium',
        details: `Fast-moving software frameworks and hiring criteria in ${industry} require ongoing maintenance of project templates and practice tasks.`,
        actionPlan: `Automate curriculum refreshes based on quarterly employer skill-demand signals.`,
        source: 'auto',
      },
      {
        id: `swot-w-${now}-4`,
        type: 'weakness',
        title: 'User engagement may decline if learning plans are not sufficiently personalized.',
        impact: 'Medium',
        details: `Students often abandon self-paced learning platforms after the first week if tasks do not adapt to their current skill level and schedule.`,
        actionPlan: `Add adaptive weekly milestones, progress streaks, and interactive code/project checkpoints.`,
        source: 'auto',
      },
      {
        id: `swot-w-${now}-5`,
        type: 'weakness',
        title: isFreemium
          ? 'Revenue may initially depend heavily on converting free users to paid users.'
          : `Early monthly revenue ($${revenue.toLocaleString()}/mo target) depends on proving clear ROI to price-sensitive learners.`,
        impact: 'High',
        details: `Students and fresh graduates have limited disposable budgets, which can constrain free-to-paid conversion rates.`,
        actionPlan: `Pair individual student subscriptions with B2B college placement-cell licensing and outcome-focused interview prep bundles.`,
        source: 'auto',
      }
    );

    opportunities.push(
      {
        id: `swot-o-${now}-1`,
        type: 'opportunity',
        title: 'Growing demand for job-oriented technical skills.',
        impact: 'High',
        details: `Employers increasingly prioritize demonstrable project portfolios and practical problem-solving over traditional academic credentials alone.`,
        actionPlan: `Align every roadmap module with a concrete, employer-verifiable portfolio project.`,
        source: 'auto',
      },
      {
        id: `swot-o-${now}-2`,
        type: 'opportunity',
        title: 'Increasing adoption of AI-based personalized learning.',
        impact: 'High',
        details: `Students and educators are actively embracing AI tutors and personalized study planners over one-size-fits-all video courses.`,
        actionPlan: `Position ${name} as a dedicated AI career co-pilot that adapts in real time to each learner's progress.`,
        source: 'auto',
      },
      {
        id: `swot-o-${now}-3`,
        type: 'opportunity',
        title: 'Partnerships with colleges, training institutes, and placement cells.',
        impact: 'High',
        details: `Universities and bootcamps seek scalable tools to improve graduate placement rates and track student career readiness.`,
        actionPlan: `Offer institutional B2B dashboards for college placement officers to onboard entire graduating batches.`,
        source: 'auto',
      },
      {
        id: `swot-o-${now}-4`,
        type: 'opportunity',
        title: 'Expansion into interview preparation and career guidance.',
        impact: 'Medium',
        details: `Learners completing technical roadmaps naturally need resume optimization, mock interviews, and employer referrals.`,
        actionPlan: `Launch AI mock technical interviews and role-specific job readiness assessments as premium add-ons.`,
        source: 'auto',
      },
      {
        id: `swot-o-${now}-5`,
        type: 'opportunity',
        title: 'Potential to provide specialized learning paths for different technology careers.',
        impact: 'Medium',
        details: `Strong demand exists across full-stack engineering, data science, AI engineering, cloud DevOps, and cybersecurity tracks.`,
        actionPlan: `Roll out modular role-specific career tracks co-designed with industry practitioners.`,
        source: 'auto',
      }
    );

    threats.push(
      {
        id: `swot-t-${now}-1`,
        type: 'threat',
        title: 'Competition from established learning and career platforms.',
        impact: 'High',
        details:
          competitors.length > 0
            ? `Faces direct and indirect competition from ${competitors.map((c) => c.name).join(', ')} as well as major MOOCs and coding platforms.`
            : `Established EdTech platforms, coding bootcamps, and career portals compete aggressively for student mindshare.`,
        actionPlan: `Differentiate through hyper-personalized, goal-specific execution roadmaps rather than generic video libraries.`,
        source: 'auto',
      },
      {
        id: `swot-t-${now}-2`,
        type: 'threat',
        title: 'Students have access to many free learning resources.',
        impact: 'High',
        details: `Open-source roadmaps, YouTube tutorials, and general-purpose AI chatbots provide free alternatives for self-directed learners.`,
        actionPlan: `Emphasize structured accountability, curated project evaluation, and end-to-end job readiness that free videos lack.`,
        source: 'auto',
      },
      {
        id: `swot-t-${now}-3`,
        type: 'threat',
        title: 'Rapid changes in AI and software technologies can make recommendations outdated.',
        impact: 'Medium',
        details: `New AI tools and shifting entry-level hiring standards can rapidly change which technical skills employers value most.`,
        actionPlan: `Continuously ingest live job-market data to keep skill roadmaps and project tasks current.`,
        source: 'auto',
      },
      {
        id: `swot-t-${now}-4`,
        type: 'threat',
        title: 'Privacy and responsible use of student data may create compliance requirements.',
        impact: 'Medium',
        details: `Handling student profiles, academic progress, and AI assessment data requires strict data privacy and security compliance.`,
        actionPlan: `Implement transparent data consent controls, encryption, and student privacy safeguards from day one.`,
        source: 'auto',
      },
      {
        id: `swot-t-${now}-5`,
        type: 'threat',
        title: 'Competitors may introduce similar AI-powered career features.',
        impact: 'High',
        details: `Larger learning portals or job boards could bundle automated roadmap generators into their existing student offerings.`,
        actionPlan: `Build deep community stickiness, university partnerships, and proprietary project assessment data.`,
        source: 'auto',
      }
    );

    return { strengths, weaknesses, opportunities, threats };
  }

  // =========================================================================
  // 2. DYNAMIC CONTEXTUAL GENERATION FOR ALL OTHER INDUSTRIES & STARTUPS
  // =========================================================================
  const paybackMonths = revenue > 0 ? Math.max(1, Math.round(investment / revenue)) : 12;
  const primaryCustomerSegment = customers.split(',')[0]?.trim() || customers;

  // --- STRENGTHS (5 Internal Advantages) ---
  if (isClimate) {
    strengths.push({
      id: `swot-s-${now}-1`,
      type: 'strength',
      title: `Direct cost-reduction and sustainability advantage tailored for ${industry}.`,
      impact: 'High',
      details: `${name} solves "${problem.slice(0, 100)}..." via "${solution.slice(0, 100)}...", pairing environmental compliance with lower operational costs.`,
      actionPlan: `Lead customer demos with a per-cycle savings and waste-reduction ROI calculator.`,
      source: 'auto',
    });
  } else if (isFinTech) {
    strengths.push({
      id: `swot-s-${now}-1`,
      type: 'strength',
      title: `Measurable bottom-line financial recovery and automated audit accuracy.`,
      impact: 'High',
      details: `By delivering "${solution.slice(0, 100)}...", ${name} directly eliminates financial leakage from "${problem.slice(0, 90)}...".`,
      actionPlan: `Offer a 14-day historical invoice/transaction audit to prove immediate dollar ROI.`,
      source: 'auto',
    });
  } else if (isHealthTech) {
    strengths.push({
      id: `swot-s-${now}-1`,
      type: 'strength',
      title: `Mission-critical risk prevention and automated regulatory compliance in ${industry}.`,
      impact: 'High',
      details: `${name} protects ${primaryCustomerSegment.toLowerCase()} against costly operational excursions and audit failures ("${problem.slice(0, 95)}...").`,
      actionPlan: `Anchor sales conversations on how preventing a single compliance or spoilage incident pays for multi-year subscriptions.`,
      source: 'auto',
    });
  } else {
    strengths.push({
      id: `swot-s-${now}-1`,
      type: 'strength',
      title: `Purpose-built solution directly solving acute friction for ${primaryCustomerSegment}.`,
      impact: 'High',
      details: `${name} ("${tagline || solution.slice(0, 80)}") replaces manual workarounds with a streamlined workflow.`,
      actionPlan: `Quantify time and money saved within the first 14 days of customer onboarding.`,
      source: 'auto',
    });
  }

  strengths.push(
    {
      id: `swot-s-${now}-2`,
      type: 'strength',
      title: `Clearly defined target customer segment (${customers.slice(0, 75)}${customers.length > 75 ? '...' : ''}).`,
      impact: 'High',
      details: `Focusing specifically on ${customers} enables ${name} to build domain-specific workflows that generic horizontal tools miss.`,
      actionPlan: `Focus initial go-to-market outreach exclusively on high-urgency buyers within ${primaryCustomerSegment}.`,
      source: 'auto',
    },
    {
      id: `swot-s-${now}-3`,
      type: 'strength',
      title: isFreemium
        ? `Freemium model allows users to try ${name} before upgrading to paid tiers.`
        : isSaaS
        ? `Recurring revenue business model (${model.slice(0, 65)}${model.length > 65 ? '...' : ''}) with strong unit economics.`
        : `Value-aligned monetization model (${model.slice(0, 65)}${model.length > 65 ? '...' : ''}).`,
      impact: 'High',
      details: `Targeting $${revenue.toLocaleString()}/mo in revenue on a $${investment.toLocaleString()} initial investment supports an estimated ~${paybackMonths}-month capital payback period.`,
      actionPlan: `Validate pricing tiers early through paid pilot agreements with design partners.`,
      source: 'auto',
    },
    {
      id: `swot-s-${now}-4`,
      type: 'strength',
      title: isAI
        ? `AI-driven automation combines detection, analysis, and execution in one platform.`
        : `Unified end-to-end platform consolidating fragmented tools and manual workflows.`,
      impact: 'Medium',
      details: `Our core architecture ("${solution.slice(0, 110)}${solution.length > 110 ? '...' : ''}") reduces manual labor and human error.`,
      actionPlan: `Build one-click reporting and workflow templates that embed ${name} into daily operations.`,
      source: 'auto',
    },
    {
      id: `swot-s-${now}-5`,
      type: 'strength',
      title:
        competitors.length > 0
          ? `Clear operational advantage over ${competitors.map((c) => c.name).join(', ')}.`
          : `Lean $${investment.toLocaleString()} capital structure enables rapid product iteration at the ${stage} stage.`,
      impact: 'Medium',
      details:
        competitors.length > 0
          ? `Differentiates from ${competitors[0].name} through ${competitors[0].ourAdvantage.toLowerCase()}.`
          : `Operating at the ${stage} stage allows fast customer feedback loops without legacy technical debt.`,
      actionPlan: `Ship weekly product improvements driven directly by early customer telemetry.`,
      source: 'auto',
    }
  );

  // --- WEAKNESSES (5 Internal Limitations / Challenges) ---
  weaknesses.push(
    {
      id: `swot-w-${now}-1`,
      type: 'weakness',
      title: `Limited initial brand recognition and track record at the ${stage} stage.`,
      impact: 'High',
      details: `As a newer entrant in ${industry}, ${name} must overcome buyer skepticism and build trust with ${primaryCustomerSegment.toLowerCase()}.`,
      actionPlan: `Onboard 5 flagship pilot customers and publish verified ROI case studies.`,
      source: 'auto',
    },
    {
      id: `swot-w-${now}-2`,
      type: 'weakness',
      title: isAI
        ? `AI models and automated recommendations require continuous tuning to avoid edge-case errors.`
        : isClimate || isHealthTech
        ? `Operational coordination, hardware/field logistics, and quality assurance require strict oversight.`
        : `Platform workflows and integrations require continuous updates as customer requirements evolve.`,
      impact: 'High',
      details: `Maintaining high reliability while delivering "${solution.slice(0, 90)}..." requires disciplined engineering and quality guardrails.`,
      actionPlan: `Implement automated quality checks and human-in-the-loop review for critical edge cases.`,
      source: 'auto',
    },
    {
      id: `swot-w-${now}-3`,
      type: 'weakness',
      title: `Constrained $${investment.toLocaleString()} initial budget across product engineering and customer acquisition.`,
      impact: 'Medium',
      details: `Allocating $${investment.toLocaleString()} across development, marketing, operations, and compliance leaves limited buffer for long sales cycles.`,
      actionPlan: `Prioritize high-intent founder-led sales and channel partnerships before scaling paid ads.`,
      source: 'auto',
    },
    {
      id: `swot-w-${now}-4`,
      type: 'weakness',
      title: `Customer onboarding and workflow migration require active user engagement.`,
      impact: 'Medium',
      details: `If setup or data ingestion feels complex, busy teams within ${primaryCustomerSegment.toLowerCase()} may delay full adoption.`,
      actionPlan: `Provide concierge zero-touch onboarding so customers see value in under 15 minutes.`,
      source: 'auto',
    },
    {
      id: `swot-w-${now}-5`,
      type: 'weakness',
      title: isFreemium
        ? `Revenue growth depends heavily on converting free users into paying subscribers.`
        : `Achieving $${revenue.toLocaleString()}/mo target revenue depends on validating willingness-to-pay under the ${model.slice(0, 45)} model.`,
      impact: 'High',
      details: `Early revenue predictability can fluctuate until pricing tiers and contract lock-in are fully proven in the market.`,
      actionPlan: `Tie pricing directly to measurable customer value milestones and offer annual pre-pay incentives.`,
      source: 'auto',
    }
  );

  // --- OPPORTUNITIES (5 External Market Opportunities) ---
  opportunities.push(
    {
      id: `swot-o-${now}-1`,
      type: 'opportunity',
      title: `Growing market urgency in ${industry} to eliminate manual inefficiencies and cost leakage.`,
      impact: 'High',
      details: `Organizations across ${customers.slice(0, 80)} are actively replacing legacy spreadsheets and manual processes with modern automation.`,
      actionPlan: `Publish industry benchmark reports highlighting the hidden cost of "${problem.slice(0, 70)}...".`,
      source: 'auto',
    },
    {
      id: `swot-o-${now}-2`,
      type: 'opportunity',
      title: isAI
        ? `Rapid enterprise and SMB adoption of AI-powered workflow co-pilots in ${industry}.`
        : `Increasing shift toward cloud-native, automated decision platforms in ${industry}.`,
      impact: 'High',
      details: `Buyers are more receptive than ever to adopting specialized solutions like ${name} that deliver immediate productivity gains.`,
      actionPlan: `Position ${name} as the category-defining intelligent platform for ${primaryCustomerSegment.toLowerCase()}.`,
      source: 'auto',
    },
    {
      id: `swot-o-${now}-3`,
      type: 'opportunity',
      title: `Strategic partnerships with industry associations, buying groups, and channel ecosystems.`,
      impact: 'High',
      details: `Partnering with existing aggregators, consultants, or trade organizations serving ${primaryCustomerSegment.toLowerCase()} can dramatically lower customer acquisition costs.`,
      actionPlan: `Establish 3 co-marketing or referral partnerships with trusted industry networks.`,
      source: 'auto',
    },
    {
      id: `swot-o-${now}-4`,
      type: 'opportunity',
      title: `Expansion into adjacent premium analytics, compliance reporting, or workflow modules.`,
      impact: 'Medium',
      details: `Once ${name} captures core operational data, upselling predictive insights or automated audit modules increases net dollar retention.`,
      actionPlan: `Design a modular product roadmap with high-margin add-on tiers for power users.`,
      source: 'auto',
    },
    {
      id: `swot-o-${now}-5`,
      type: 'opportunity',
      title: `Potential to scale into new geographic markets and adjacent vertical segments.`,
      impact: 'Medium',
      details: `The core workflow behind "${solution.slice(0, 80)}..." can be adapted to neighboring customer segments after beachhead dominance.`,
      actionPlan: `Document repeatable playbook templates from initial customers to accelerate multi-region expansion.`,
      source: 'auto',
    }
  );

  // --- THREATS (5 External Risks, Competitors, Market/Tech/Regulatory Changes) ---
  threats.push(
    {
      id: `swot-t-${now}-1`,
      type: 'threat',
      title:
        competitors.length > 0
          ? `Direct and indirect competition from ${competitors.map((c) => c.name).join(', ')}.`
          : `Competition from established software vendors and entrenched incumbent providers in ${industry}.`,
      impact: 'High',
      details:
        competitors.length > 0
          ? `Incumbents like ${competitors[0].name} (${competitors[0].theirStrength}) may discount pricing or bundle competing features.`
          : `Established players in ${industry} have larger sales budgets and existing customer relationships.`,
      actionPlan: `Win on specialized domain depth, faster deployment, and superior customer support.`,
      source: 'auto',
    },
    {
      id: `swot-t-${now}-2`,
      type: 'threat',
      title: `Customer inertia and reliance on free or manual status-quo workarounds.`,
      impact: 'High',
      details: `Some prospective buyers in ${primaryCustomerSegment.toLowerCase()} may continue using spreadsheets, manual labor, or free tools rather than adopting paid software.`,
      actionPlan: `Demonstrate undeniable ROI and offer a frictionless pilot that proves the cost of doing nothing.`,
      source: 'auto',
    },
    {
      id: `swot-t-${now}-3`,
      type: 'threat',
      title: `Rapid shifts in ${isAI ? 'AI models and ' : ''}technology standards in ${industry}.`,
      impact: 'Medium',
      details: `Fast-evolving underlying technologies and API ecosystems can require continuous re-engineering to maintain a competitive edge.`,
      actionPlan: `Maintain a modular architecture and focus on proprietary workflow data rather than commodity features.`,
      source: 'auto',
    },
    {
      id: `swot-t-${now}-4`,
      type: 'threat',
      title: `Data privacy, security, and evolving regulatory compliance requirements in ${industry}.`,
      impact: 'Medium',
      details: `Handling sensitive customer or operational data introduces compliance obligations and security review hurdles.`,
      actionPlan: `Build strict data encryption, role-based access controls, and compliance documentation from day one.`,
      source: 'auto',
    },
    {
      id: `swot-t-${now}-5`,
      type: 'threat',
      title: `Larger competitors may introduce similar features or aggressive pricing bundles.`,
      impact: 'High',
      details: `Horizontal platforms serving ${primaryCustomerSegment.toLowerCase()} could attempt to replicate ${name}'s core value proposition.`,
      actionPlan: `Deepen customer switching costs through historical data benchmarks, integrations, and specialized workflows.`,
      source: 'auto',
    }
  );

  return { strengths, weaknesses, opportunities, threats };
}
