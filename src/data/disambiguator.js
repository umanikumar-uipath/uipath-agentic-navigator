export const DISAMBIGUATION_QUESTIONS = [
  {
    id: 'who_builds',
    question: 'Who is building the automation?',
    options: [
      { label: 'A business user / citizen developer', value: 'citizen', icon: '👤' },
      { label: 'A developer writing Python code', value: 'prodev', icon: '🐍' },
      { label: 'An AI coding assistant (Claude Code, Codex, Cursor)', value: 'coding_agent', icon: '💻' },
      { label: 'Nobody — I need to orchestrate existing automations', value: 'orchestrate', icon: '🔄' },
    ],
  },
  {
    id: 'what_type',
    question: 'What kind of thing are you building?',
    options: [
      { label: 'An AI agent that reasons and uses tools', value: 'agent', icon: '🤖' },
      { label: 'A structured business process with multiple steps', value: 'process', icon: '📋' },
      { label: 'A case management workflow with lifecycle', value: 'case', icon: '📁' },
      { label: 'A web app / UI for end-users', value: 'app', icon: '🌐' },
    ],
  },
  {
    id: 'complexity',
    question: 'How complex is the execution?',
    options: [
      { label: 'Simple — single session, minutes to complete', value: 'simple', icon: '⚡' },
      { label: 'Medium — needs human approval at some point', value: 'hitl', icon: '✋' },
      { label: 'Complex — multi-day, multiple agents coordinating', value: 'multi_agent', icon: '🧠' },
      { label: 'End-user facing — chat-based interaction', value: 'conversational', icon: '💬' },
    ],
  },
];

export const DISAMBIGUATION_RESULTS = {
  'citizen+agent+simple': {
    product: 'Agent Builder',
    description: 'Low-code visual canvas in Studio Web. Drag-and-drop agent activities with prebuilt templates.',
    status: 'GA',
    when: 'Business users building simple AI agents without code',
    notThis: 'Not for complex multi-agent workflows or custom Python logic',
  },
  'citizen+agent+hitl': {
    product: 'Agent Builder + Action Center',
    description: 'Low-code agent with human-in-the-loop approval nodes via Action Center.',
    status: 'GA',
    when: 'Agents that need manager approval before proceeding',
    notThis: 'Not for multi-day running processes — use Maestro for that',
  },
  'citizen+agent+multi_agent': {
    product: 'Advanced Agents',
    description: 'Explicit planning, sub-agent delegation, persistent memory, resumable multi-day execution.',
    status: 'Private Preview',
    when: 'Complex scenarios: financial reconciliation, regulatory review, incident resolution',
    notThis: 'Overkill for simple single-agent tasks',
  },
  'citizen+agent+conversational': {
    product: 'Conversational Agents (Agent Builder)',
    description: 'Agents published to chat channels — web widget, Teams, Slack.',
    status: 'GA',
    when: 'End-user facing agents that respond to questions and take actions',
    notThis: 'Not for batch processing or background automation',
  },
  'citizen+process+simple': {
    product: 'Maestro Flow',
    description: 'AI-native orchestration canvas (.flow). Fast visual orchestration of agents, APIs, and humans.',
    status: 'Preview (70+ customers)',
    when: 'Quick orchestration across multiple systems with agent steps',
    notThis: 'For governance-heavy regulated processes, use Maestro BPMN instead',
  },
  'citizen+process+hitl': {
    product: 'Maestro BPMN',
    description: 'BPMN 2.0 process modeling with DMN decision logic. 30 industry templates. Full audit trail.',
    status: 'GA',
    when: 'Compliance-heavy end-to-end business processes needing audit trails',
    notThis: 'Not for quick prototyping — use Maestro Flow for speed',
  },
  'citizen+process+multi_agent': {
    product: 'Maestro BPMN + Advanced Agents',
    description: 'BPMN orchestration with Advanced Agents handling complex reasoning steps within the process.',
    status: 'GA + Private Preview',
    when: 'Regulated multi-day processes with complex AI reasoning requirements',
    notThis: 'Very advanced — start with Maestro BPMN alone first',
  },
  'citizen+case+simple': {
    product: 'Maestro Case',
    description: 'Case management where each case is a living entity with its own data, participants, and timeline.',
    status: 'GA',
    when: 'Cases with lifecycle stages: intake → review → resolution → closed',
    notThis: 'Not for linear sequential processes — use BPMN for that',
  },
  'citizen+case+hitl': {
    product: 'Maestro Case + Action Center',
    description: 'Case management with human review/approval gates at stage transitions.',
    status: 'GA',
    when: 'Cases that need human judgment at key decision points',
    notThis: 'If the process is strictly sequential, BPMN is simpler',
  },
  'citizen+app+simple': {
    product: 'UiPath Apps (Low-Code)',
    description: 'Drag-and-drop app builder in Studio Web. Quick internal tools and forms.',
    status: 'GA',
    when: 'Simple internal tools, form-based UIs, dashboards',
    notThis: 'For custom React UIs or mobile-first apps, use Coded Apps',
  },
  'prodev+agent+simple': {
    product: 'Coded Agents (Python)',
    description: 'Write agents in Python with LangGraph, LlamaIndex, or OpenAI Agents SDK. Deploy via UiPath CLI.',
    status: 'GA',
    when: 'Developers who want full control over agent logic in their own IDE',
    notThis: 'Not for citizen developers — use Agent Builder instead',
  },
  'prodev+agent+hitl': {
    product: 'Coded Agents + HITL nodes',
    description: 'Python agents with human-in-the-loop approval checkpoints via Action Center.',
    status: 'GA',
    when: 'Code-first agents that need human approval at critical steps',
    notThis: 'If you don\'t need code control, Agent Builder + Action Center is simpler',
  },
  'prodev+agent+multi_agent': {
    product: 'Advanced Agents (Coded)',
    description: 'Multi-agent Python systems with explicit planning, sub-agent delegation, persistent memory.',
    status: 'Private Preview',
    when: 'Complex multi-agent architectures with supervisor patterns',
    notThis: 'Still in preview — start with standard Coded Agents for production today',
  },
  'prodev+agent+conversational': {
    product: 'Conversational Agents (TypeScript SDK)',
    description: 'Build conversational agents with the @uipath/uipath-typescript SDK for web/Teams/Slack channels.',
    status: 'GA',
    when: 'Custom conversational experiences with full UI control',
    notThis: 'For quick chatbots, Agent Builder is faster',
  },
  'prodev+app+simple': {
    product: 'Coded Apps',
    description: 'TypeScript + React web apps using @uipath/uipath-typescript SDK. Hosted on <org>.uipath.host.',
    status: 'GA (May 2026)',
    when: 'Custom dashboards, process portals, mobile-friendly apps with full React control',
    notThis: 'For simple forms/CRUD, low-code Apps is faster',
  },
  'coding_agent+agent+simple': {
    product: 'UiPath for Coding Agents',
    description: 'Use Claude Code, OpenAI Codex, Cursor, etc. to build UiPath automations via natural language.',
    status: 'Public Preview (May 2026)',
    when: 'Developers who want an AI assistant to build automations through conversation',
    notThis: 'The coding agent itself has separate billing. This is about deploying what it builds.',
  },
  'coding_agent+agent+hitl': {
    product: 'UiPath for Coding Agents + HITL',
    description: 'AI coding assistant builds automations with human approval gates, governed by the platform.',
    status: 'Public Preview',
    when: 'AI-assisted development with enterprise governance',
    notThis: 'Coding agent is for building, not running — production runs use standard agent licensing',
  },
  'orchestrate+process+simple': {
    product: 'Maestro Flow',
    description: 'Orchestrate existing agents, RPA bots, APIs, and humans in a visual flow canvas.',
    status: 'Preview',
    when: 'Connecting existing automations into an end-to-end process',
    notThis: 'For building new agents from scratch, use Agent Builder or Coded Agents',
  },
  'orchestrate+process+hitl': {
    product: 'Maestro BPMN + Action Center',
    description: 'BPMN process orchestration with human-in-the-loop tasks. Full compliance and audit.',
    status: 'GA',
    when: 'Governed multi-system processes with human checkpoints',
    notThis: 'If speed matters more than compliance, try Maestro Flow',
  },
  'orchestrate+process+multi_agent': {
    product: 'Maestro + Multi-Agent (A2A)',
    description: 'Maestro orchestrating multiple agents via Access ToolUsePolicy. Agent→Agent, Agent→Flow, Agent→RPA.',
    status: 'Preview (GA target H1 2026)',
    when: 'Complex agent ecosystems needing centralized orchestration and governance',
    notThis: 'Most use cases don\'t need multi-agent yet — start with single agent + Maestro',
  },
};

export function getResult(answers) {
  const key = `${answers.who_builds}+${answers.what_type}+${answers.complexity}`;
  return DISAMBIGUATION_RESULTS[key] || {
    product: 'Custom Configuration',
    description: 'Your combination spans multiple products. Contact your UiPath representative for a tailored architecture recommendation.',
    status: 'N/A',
    when: 'Complex or unusual requirements',
    notThis: 'Consider breaking the use case into smaller components mapped to individual products',
  };
}
