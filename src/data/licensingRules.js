export const PRICING_PLANS = {
  unified: {
    id: 'unified',
    name: 'Unified Pricing',
    unit: 'Platform Units (PU)',
    unitShort: 'PU',
    description: 'Consolidated consumption unit across all UiPath services',
  },
  flex: {
    id: 'flex',
    name: 'Flex Plan',
    unit: 'Agent Units (AU) + Robot Units (RU) + AI Units + Apps Units',
    unitShort: 'AU',
    description: 'Separate consumption units per service category',
  },
};

export const MODEL_TIERS = {
  standard: {
    id: 'standard',
    name: 'Standard Models',
    examples: 'GPT-4o, Claude 3.5 Sonnet, Gemini 3 Pro',
    unified: 0.2,
    flex: 1,
  },
  basic: {
    id: 'basic',
    name: 'Basic Models',
    examples: 'GPT-4o-mini, Claude Haiku 4.5, Gemini 2.0 Flash',
    unified: 0.16,
    flex: 0.8,
  },
  customer: {
    id: 'customer',
    name: 'Customer-Managed (BYOM)',
    examples: 'Your own hosted models (Azure OpenAI, Bedrock, Vertex, etc.)',
    unified: 0.2,
    flex: 1,
    perRun: true,
  },
};

export const MACHINE_SIZES = {
  small: { name: 'Small (Default)', unified: 0.2 },
  standard: { name: 'Standard', unified: 0.4 },
  medium: { name: 'Medium', unified: 0.8 },
  large: { name: 'Large', unified: 2.0 },
};

export const PRODUCTS = [
  {
    id: 'agentBuilder',
    name: 'Agent Builder',
    subtitle: 'Low-code agents in Studio Web',
    category: 'Agents',
    status: 'GA',
    icon: '🤖',
    description: 'Visual canvas for building AI agents with drag-and-drop activities',
    inputs: [
      { id: 'agentRuns', label: 'Agent runs per month', type: 'number', default: 100 },
      { id: 'llmCallsPerRun', label: 'Avg LLM calls per run', type: 'number', default: 5 },
      { id: 'modelTier', label: 'Model tier', type: 'select', options: 'modelTiers', default: 'standard' },
    ],
    calculate: (inputs, plan) => {
      const tier = MODEL_TIERS[inputs.modelTier];
      const rate = plan === 'unified' ? tier.unified : tier.flex;
      const unit = plan === 'unified' ? 'PU' : 'AU';

      if (tier.perRun) {
        return {
          total: inputs.agentRuns * rate,
          unit,
          breakdown: `${inputs.agentRuns} runs × ${rate} ${unit}/run = ${(inputs.agentRuns * rate).toLocaleString()} ${unit}`,
          note: 'Customer-managed models: flat rate per run regardless of LLM calls',
        };
      }

      const totalCalls = inputs.agentRuns * inputs.llmCallsPerRun;
      const total = totalCalls * rate;
      return {
        total,
        unit,
        breakdown: `${inputs.agentRuns} runs × ${inputs.llmCallsPerRun} calls/run × ${rate} ${unit}/call = ${total.toLocaleString()} ${unit}`,
        note: `Token billing: charges in 64K input token increments. Calls exceeding 64K tokens incur multiple charges.`,
      };
    },
  },
  {
    id: 'codedAgents',
    name: 'Coded Agents',
    subtitle: 'Python pro-dev agents (LangGraph / LlamaIndex)',
    category: 'Agents',
    status: 'GA',
    icon: '🐍',
    description: 'Write agents in Python using LangGraph, LlamaIndex, or OpenAI Agents SDK',
    inputs: [
      { id: 'agentRuns', label: 'Agent runs per month', type: 'number', default: 100 },
      { id: 'llmCallsPerRun', label: 'Avg LLM calls per run', type: 'number', default: 5 },
      { id: 'modelTier', label: 'Model tier', type: 'select', options: 'modelTiers', default: 'standard' },
      { id: 'machineSize', label: 'Machine size', type: 'select', options: 'machineSizes', default: 'small' },
      { id: 'avgRunMinutes', label: 'Avg run duration (minutes)', type: 'number', default: 3 },
    ],
    calculate: (inputs, plan) => {
      const tier = MODEL_TIERS[inputs.modelTier];
      const llmRate = plan === 'unified' ? tier.unified : tier.flex;
      const unit = plan === 'unified' ? 'PU' : 'AU';

      const executionChunks = Math.ceil(inputs.avgRunMinutes / 5);

      let llmCost, execCost;

      if (tier.perRun) {
        llmCost = 0;
        execCost = 0;
      } else {
        const totalCalls = inputs.agentRuns * inputs.llmCallsPerRun;
        llmCost = totalCalls * llmRate;
      }

      if (plan === 'unified') {
        const machineRate = MACHINE_SIZES[inputs.machineSize].unified;
        execCost = inputs.agentRuns * executionChunks * machineRate;
      } else {
        execCost = inputs.agentRuns * executionChunks * 1;
      }

      let total;
      let breakdown;

      if (tier.perRun) {
        const perRunRate = plan === 'unified' ? tier.unified : tier.flex;
        total = inputs.agentRuns * perRunRate + execCost;
        breakdown = `LLM: ${inputs.agentRuns} runs × ${perRunRate} ${unit}/run = ${(inputs.agentRuns * perRunRate).toLocaleString()} ${unit}\nExecution: ${inputs.agentRuns} runs × ${executionChunks} chunk(s) × ${plan === 'unified' ? MACHINE_SIZES[inputs.machineSize].unified : 1} ${unit} = ${execCost.toLocaleString()} ${unit}`;
      } else {
        total = llmCost + execCost;
        const totalCalls = inputs.agentRuns * inputs.llmCallsPerRun;
        breakdown = `LLM: ${totalCalls.toLocaleString()} calls × ${llmRate} ${unit}/call = ${llmCost.toLocaleString()} ${unit}\nExecution: ${inputs.agentRuns} runs × ${executionChunks} chunk(s) × ${plan === 'unified' ? MACHINE_SIZES[inputs.machineSize].unified : 1} ${unit} = ${execCost.toLocaleString()} ${unit}`;
      }

      return {
        total,
        unit,
        breakdown,
        note: `Execution threshold: 5 minutes per chunk. ${inputs.avgRunMinutes > 5 ? `Your ${inputs.avgRunMinutes}min avg = ${executionChunks} chunks charged per run.` : 'Your runs fit in 1 chunk.'}`,
      };
    },
  },
  {
    id: 'codingAgents',
    name: 'Coding Agents',
    subtitle: 'UiPath for Coding Agents (Claude Code, Codex, Cursor)',
    category: 'Agents',
    status: 'Preview',
    icon: '💻',
    description: 'External AI coding assistants build UiPath automations — governed by the platform',
    inputs: [
      { id: 'automationsBuilt', label: 'Automations built per month', type: 'number', default: 10 },
      { id: 'runsPerAutomation', label: 'Production runs per automation/month', type: 'number', default: 50 },
      { id: 'llmCallsPerRun', label: 'Avg LLM calls per run', type: 'number', default: 3 },
      { id: 'modelTier', label: 'Model tier for production runs', type: 'select', options: 'modelTiers', default: 'standard' },
    ],
    calculate: (inputs, plan) => {
      const tier = MODEL_TIERS[inputs.modelTier];
      const rate = plan === 'unified' ? tier.unified : tier.flex;
      const unit = plan === 'unified' ? 'PU' : 'AU';

      const totalRuns = inputs.automationsBuilt * inputs.runsPerAutomation;
      const totalCalls = totalRuns * inputs.llmCallsPerRun;
      const total = tier.perRun ? totalRuns * rate : totalCalls * rate;

      return {
        total,
        unit,
        breakdown: tier.perRun
          ? `${totalRuns.toLocaleString()} production runs × ${rate} ${unit}/run = ${total.toLocaleString()} ${unit}`
          : `${totalRuns.toLocaleString()} runs × ${inputs.llmCallsPerRun} calls × ${rate} ${unit}/call = ${total.toLocaleString()} ${unit}`,
        note: 'Building automations with coding agents (design-time) is free. Only production runs consume units. The coding agent itself (Claude Code, Codex) has its own separate billing.',
      };
    },
  },
  {
    id: 'advancedAgents',
    name: 'Advanced Agents',
    subtitle: 'Multi-day, planning, sub-agent delegation',
    category: 'Agents',
    status: 'Preview',
    icon: '🧠',
    description: 'Explicit planning, persistent memory, resumable multi-day execution, audit trail',
    inputs: [
      { id: 'agentRuns', label: 'Agent runs per month', type: 'number', default: 20 },
      { id: 'llmCallsPerRun', label: 'Avg LLM calls per run (typically high)', type: 'number', default: 50 },
      { id: 'subAgentCalls', label: 'Sub-agent delegations per run', type: 'number', default: 3 },
      { id: 'modelTier', label: 'Model tier', type: 'select', options: 'modelTiers', default: 'standard' },
      { id: 'avgRunMinutes', label: 'Avg run duration (minutes)', type: 'number', default: 30 },
    ],
    calculate: (inputs, plan) => {
      const tier = MODEL_TIERS[inputs.modelTier];
      const rate = plan === 'unified' ? tier.unified : tier.flex;
      const unit = plan === 'unified' ? 'PU' : 'AU';

      const executionChunks = Math.ceil(inputs.avgRunMinutes / 5);
      const totalMainCalls = inputs.agentRuns * inputs.llmCallsPerRun;
      const totalSubCalls = inputs.agentRuns * inputs.subAgentCalls * Math.round(inputs.llmCallsPerRun * 0.3);

      const llmCost = (totalMainCalls + totalSubCalls) * rate;
      const execCost = plan === 'unified'
        ? inputs.agentRuns * executionChunks * MACHINE_SIZES.standard.unified
        : inputs.agentRuns * executionChunks * 1;

      const total = llmCost + execCost;

      return {
        total,
        unit,
        breakdown: `Main agent LLM: ${totalMainCalls.toLocaleString()} calls × ${rate} ${unit} = ${(totalMainCalls * rate).toLocaleString()} ${unit}\nSub-agent LLM: ${totalSubCalls.toLocaleString()} calls × ${rate} ${unit} = ${(totalSubCalls * rate).toLocaleString()} ${unit}\nExecution: ${inputs.agentRuns} × ${executionChunks} chunks = ${execCost.toLocaleString()} ${unit}`,
        note: `Advanced Agents are in Private Preview. Pricing shown is estimated based on standard agent rates. Sub-agent delegations each consume LLM calls independently. Duration: ${inputs.avgRunMinutes}min = ${executionChunks} execution chunks.`,
      };
    },
  },
  {
    id: 'conversationalAgents',
    name: 'Conversational Agents',
    subtitle: 'Chat-based agents via published channels',
    category: 'Agents',
    status: 'GA',
    icon: '💬',
    description: 'Agents exposed through chat channels (web, Teams, Slack) for end-users',
    inputs: [
      { id: 'users', label: 'Active users per month', type: 'number', default: 50 },
      { id: 'messagesPerUser', label: 'Avg messages per user/month', type: 'number', default: 100 },
      { id: 'userLicense', label: 'User license type', type: 'select', options: 'userLicenses', default: 'basic' },
      { id: 'modelTier', label: 'Model tier', type: 'select', options: 'modelTiers', default: 'standard' },
      { id: 'toolCallPct', label: '% of messages triggering tool calls', type: 'number', default: 30 },
    ],
    calculate: (inputs, plan) => {
      const tier = MODEL_TIERS[inputs.modelTier];
      const rate = plan === 'unified' ? tier.unified : tier.flex;
      const unit = plan === 'unified' ? 'PU' : 'AU';

      const freePerMonth = {
        express: 4, basic: 50, plus: 15000, pro: 15000,
      };
      const freeMessages = freePerMonth[inputs.userLicense] || 50;
      const totalMessages = inputs.users * inputs.messagesPerUser;
      const freeTotal = inputs.users * freeMessages;
      const billableMessages = Math.max(0, totalMessages - freeTotal);
      const messageCost = billableMessages * rate;

      const toolMessages = totalMessages * (inputs.toolCallPct / 100);
      const toolCost = toolMessages * 0.2;

      const total = messageCost + (plan === 'unified' ? toolCost : toolMessages * 1);

      return {
        total,
        unit,
        breakdown: `Messages: ${totalMessages.toLocaleString()} total - ${freeTotal.toLocaleString()} free = ${billableMessages.toLocaleString()} billable × ${rate} ${unit} = ${messageCost.toLocaleString()} ${unit}\nTool calls: ~${toolMessages.toLocaleString()} calls × ${plan === 'unified' ? '0.2' : '1'} ${unit} = ${(plan === 'unified' ? toolCost : toolMessages).toLocaleString()} ${unit}`,
        note: `Free tier: ${inputs.userLicense === 'plus' || inputs.userLicense === 'pro' ? 'Unlimited (fair use 500/day)' : `${freeMessages}/user/month`}. Messages ≤8 chars without tools don't count. Tool calls (Analyze Files, Context Grounding, RPA) add extra consumption.`,
      };
    },
  },
  {
    id: 'maestroFlow',
    name: 'Maestro Flow',
    subtitle: 'AI-native orchestration (.flow)',
    category: 'Orchestration',
    status: 'Preview',
    icon: '🔄',
    description: 'Fast, AI-native orchestration for agents + APIs + humans',
    inputs: [
      { id: 'processInstances', label: 'Process instances per month', type: 'number', default: 200 },
      { id: 'agentStepsPerProcess', label: 'Agent steps per process', type: 'number', default: 2 },
      { id: 'llmCallsPerAgentStep', label: 'LLM calls per agent step', type: 'number', default: 5 },
      { id: 'dmnEvaluations', label: 'DMN decision evaluations/month', type: 'number', default: 100 },
      { id: 'modelTier', label: 'Model tier for agent steps', type: 'select', options: 'modelTiers', default: 'standard' },
    ],
    calculate: (inputs, plan) => {
      const tier = MODEL_TIERS[inputs.modelTier];
      const rate = plan === 'unified' ? tier.unified : tier.flex;
      const unit = plan === 'unified' ? 'PU' : 'AU';

      const instanceCost = plan === 'unified' ? inputs.processInstances * 1 : inputs.processInstances * 1;
      const agentLLMCost = inputs.processInstances * inputs.agentStepsPerProcess * inputs.llmCallsPerAgentStep * rate;
      const dmnCost = plan === 'unified' ? inputs.dmnEvaluations * 0.2 : inputs.dmnEvaluations * 0.2;

      const total = instanceCost + agentLLMCost + dmnCost;

      return {
        total,
        unit,
        breakdown: `Process instances: ${inputs.processInstances} × 1 ${unit} = ${instanceCost.toLocaleString()} ${unit}\nAgent LLM calls: ${inputs.processInstances} × ${inputs.agentStepsPerProcess} steps × ${inputs.llmCallsPerAgentStep} calls × ${rate} ${unit} = ${agentLLMCost.toLocaleString()} ${unit}\nDMN evaluations: ${inputs.dmnEvaluations} × 0.2 ${unit} = ${dmnCost.toLocaleString()} ${unit}`,
        note: 'Debugging does not consume units. HITL (Action Center) tasks within the flow do not have separate consumption.',
      };
    },
  },
  {
    id: 'maestroBpmn',
    name: 'Maestro BPMN',
    subtitle: 'Governance-heavy process orchestration (.bpmn)',
    category: 'Orchestration',
    status: 'GA',
    icon: '📋',
    description: 'Standard BPMN 2.0 for structured, compliance-heavy end-to-end processes',
    inputs: [
      { id: 'processInstances', label: 'Process instances per month', type: 'number', default: 500 },
      { id: 'agentStepsPerProcess', label: 'Agent steps per process', type: 'number', default: 1 },
      { id: 'llmCallsPerAgentStep', label: 'LLM calls per agent step', type: 'number', default: 5 },
      { id: 'dmnEvaluations', label: 'DMN decision evaluations/month', type: 'number', default: 500 },
      { id: 'modelTier', label: 'Model tier for agent steps', type: 'select', options: 'modelTiers', default: 'standard' },
    ],
    calculate: (inputs, plan) => {
      const tier = MODEL_TIERS[inputs.modelTier];
      const rate = plan === 'unified' ? tier.unified : tier.flex;
      const unit = plan === 'unified' ? 'PU' : 'AU';

      const instanceCost = inputs.processInstances * 1;
      const agentLLMCost = inputs.processInstances * inputs.agentStepsPerProcess * inputs.llmCallsPerAgentStep * rate;
      const dmnCost = inputs.dmnEvaluations * 0.2;
      const total = instanceCost + agentLLMCost + dmnCost;

      return {
        total,
        unit,
        breakdown: `Process instances: ${inputs.processInstances} × 1 ${unit} = ${instanceCost.toLocaleString()} ${unit}\nAgent LLM calls: ${(inputs.processInstances * inputs.agentStepsPerProcess * inputs.llmCallsPerAgentStep).toLocaleString()} × ${rate} ${unit} = ${agentLLMCost.toLocaleString()} ${unit}\nDMN evaluations: ${inputs.dmnEvaluations} × 0.2 ${unit} = ${dmnCost.toLocaleString()} ${unit}`,
        note: 'Same runtime engine as Maestro Flow. BPMN is recommended for compliance-heavy processes. 30 industry templates available (APQC, BIAN, eTOM).',
      };
    },
  },
  {
    id: 'maestroCase',
    name: 'Maestro Case',
    subtitle: 'Agentic case management (caseplan.json)',
    category: 'Orchestration',
    status: 'GA',
    icon: '📁',
    description: 'Living business entities with lifecycle — case manager agent + stage manager agents',
    inputs: [
      { id: 'casesPerMonth', label: 'Cases per month', type: 'number', default: 100 },
      { id: 'stagesPerCase', label: 'Avg stages per case', type: 'number', default: 4 },
      { id: 'agentActionsPerStage', label: 'Agent actions per stage', type: 'number', default: 3 },
      { id: 'modelTier', label: 'Model tier', type: 'select', options: 'modelTiers', default: 'standard' },
    ],
    calculate: (inputs, plan) => {
      const tier = MODEL_TIERS[inputs.modelTier];
      const rate = plan === 'unified' ? tier.unified : tier.flex;
      const unit = plan === 'unified' ? 'PU' : 'AU';

      const instanceCost = inputs.casesPerMonth * 1;
      const totalAgentCalls = inputs.casesPerMonth * inputs.stagesPerCase * inputs.agentActionsPerStage;
      const agentCost = totalAgentCalls * rate;
      const total = instanceCost + agentCost;

      return {
        total,
        unit,
        breakdown: `Case instances: ${inputs.casesPerMonth} × 1 ${unit} = ${instanceCost.toLocaleString()} ${unit}\nAgent actions: ${inputs.casesPerMonth} cases × ${inputs.stagesPerCase} stages × ${inputs.agentActionsPerStage} actions × ${rate} ${unit} = ${agentCost.toLocaleString()} ${unit}`,
        note: 'Case manager agent governs lifecycle. Stage manager agents drive each phase. Context complexity model — use when the "case" carries its own data, participants, and timeline.',
      };
    },
  },
  {
    id: 'codedApps',
    name: 'Coded Apps',
    subtitle: 'TypeScript web apps on @uipath/uipath-typescript',
    category: 'Apps',
    status: 'GA',
    icon: '🌐',
    description: 'Custom React UIs hosted on <org>.uipath.host, built with UiPath TypeScript SDK',
    inputs: [
      { id: 'activeUsers', label: 'Active users per month', type: 'number', default: 50 },
      { id: 'sessionsPerUser', label: 'Avg sessions per user/month', type: 'number', default: 20 },
      { id: 'apiCallsPerSession', label: 'UiPath API calls per session', type: 'number', default: 5 },
    ],
    calculate: (inputs, plan) => {
      const unit = plan === 'unified' ? 'PU' : 'Apps Units';
      const totalSessions = inputs.activeUsers * inputs.sessionsPerUser;
      const totalAPICalls = totalSessions * inputs.apiCallsPerSession;
      const rate = plan === 'unified' ? 0.02 : 1;
      const total = totalAPICalls * rate;

      return {
        total,
        unit,
        breakdown: `${inputs.activeUsers} users × ${inputs.sessionsPerUser} sessions × ${inputs.apiCallsPerSession} API calls × ${rate} ${unit}/call = ${total.toLocaleString()} ${unit}`,
        note: 'Coded Apps require Apps Unit + Cloud Basic User license. Hosted on <org>.uipath.host. API calls to UiPath services (Orchestrator, Data Fabric, etc.) consume units.',
      };
    },
  },
];

export const USER_LICENSES = {
  express: { name: 'Express / Automation Express', freeMessages: 4, period: 'year' },
  basic: { name: 'Basic / Cloud Basic User', freeMessages: 50, period: 'month' },
  plus: { name: 'Plus / Citizen Developer', freeMessages: 'Unlimited', period: 'day (fair use 500)' },
  pro: { name: 'Pro / Automation Developer', freeMessages: 'Unlimited', period: 'day (fair use 500)' },
};

export const FREE_DESIGN_TIME = {
  pro: { calls: 2500, runs: 500 },
  plus: { calls: 125, runs: 25 },
  basic: { calls: 50, runs: 10 },
  appTester: { calls: 2500, runs: 500 },
};

export const GOTCHAS = [
  {
    severity: 'critical',
    title: 'Platform Units + Agent Units conflict',
    description: 'You cannot have both Platform Units and Agent Units on the same license. If both exist, consumption defaults to Platform Units — causing potential silent mis-billing.',
    action: 'Verify your license plan type before deploying agents.',
  },
  {
    severity: 'critical',
    title: 'Token billing at 64K increments',
    description: 'LLM calls are charged in 64K input token increments. A call with 100K input tokens = 2 charges, not 1. System prompts, conversation history, and tool definitions all count toward input tokens.',
    action: 'Monitor average input token counts. Optimize system prompts and limit conversation history.',
  },
  {
    severity: 'warning',
    title: 'Design-time testing is FREE (mostly)',
    description: 'Studio Web test/preview, Autopilot, and score runs do NOT consume units. But debugging Coded Agents does consume execution units on Flex plan. Maestro debugging is free.',
    action: 'Use Studio Web for testing before deploying to production.',
  },
  {
    severity: 'warning',
    title: 'Coded Agent 5-minute execution threshold',
    description: 'Each 5-minute chunk of runtime = 1 execution charge. A 12-minute agent run = 3 execution charges. Long-running agents can become expensive.',
    action: 'Design agents for efficiency. Consider breaking long processes into smaller steps.',
  },
  {
    severity: 'warning',
    title: 'Conversational agent messages ≤8 chars are free',
    description: 'Short messages (like "ok", "yes", "no") without tool calls don\'t count toward consumption. But messages with tool calls always count regardless of length.',
    action: 'This is a minor savings — don\'t design around it.',
  },
  {
    severity: 'info',
    title: 'Free daily LLM call entitlements',
    description: 'Pro users get 2,500 free LLM calls/day (~500 agent runs). Plus users get 125. Basic users get 50. These are design-time only (Studio Web Agent Builder).',
    action: 'Use these for development and testing before going to production.',
  },
  {
    severity: 'info',
    title: 'Customer-managed models = flat rate per run',
    description: 'BYOM (Azure OpenAI, Bedrock, Vertex, etc.) charges a flat rate per agent run, regardless of how many LLM calls your agent makes. This can be significantly cheaper for multi-call agents.',
    action: 'If your agents make many LLM calls per run, BYOM can reduce consumption by 60-80%.',
  },
  {
    severity: 'info',
    title: 'Guardrails maturity status',
    description: 'Only 2 of 5 built-in validators are production-enabled: PII Detection and Prompt Injection. Harmful Content, IP, and User Prompt Attacks (via Azure AI Content Safety) are not yet live.',
    action: 'Factor external guardrail tooling into your architecture if compliance requires all 5.',
  },
  {
    severity: 'info',
    title: 'Advanced Agents are in Private Preview',
    description: 'Pricing shown for Advanced Agents is estimated based on standard agent rates. Actual consumption may differ at GA. Backed by LangGraph DeepAgents harness (P0) and Claude Agent SDK (P1).',
    action: 'Contact your UiPath rep for preview access and actual pricing guidance.',
  },
];
