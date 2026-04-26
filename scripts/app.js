/* ============================================================
   app.js  –  Multi-Agent AI System — Full Application Logic v2
   ============================================================ */

/* ═══════════════════════════════════════════
   THEME TOGGLE
═══════════════════════════════════════════ */
const root        = document.documentElement;
const themeToggle = document.getElementById('theme-toggle');
const themeIcon   = document.getElementById('theme-icon');

function applyTheme(t) {
  root.setAttribute('data-theme', t);
  themeIcon.textContent = t === 'dark' ? 'light_mode' : 'dark_mode';
  localStorage.setItem('theme', t);
}
themeToggle.addEventListener('click', () =>
  applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'));
applyTheme(localStorage.getItem('theme') || 'dark');


/* ═══════════════════════════════════════════
   BACK-TO-TOP
═══════════════════════════════════════════ */
const btt = document.getElementById('back-to-top');
window.addEventListener('scroll', () =>
  btt.classList.toggle('hidden', window.scrollY < 300));


/* ═══════════════════════════════════════════
   HAMBURGER / SIDEBAR
═══════════════════════════════════════════ */
const sidebar   = document.getElementById('sidebar');
const hamburger = document.getElementById('hamburger');
hamburger.addEventListener('click', () => sidebar.classList.toggle('open'));


/* ═══════════════════════════════════════════
   NOTIFICATION DROPDOWN
═══════════════════════════════════════════ */
const notifBtn      = document.getElementById('notif-btn');
const notifDropdown = document.getElementById('notif-dropdown');
const notifBadge    = document.getElementById('notif-badge');

notifBtn.addEventListener('click', e => {
  e.stopPropagation();
  notifDropdown.classList.toggle('open');
  avatarDropdown.classList.remove('open');
});

window.viewAllNotifications = () => {
  scrollToSection('tasks');
  notifDropdown.classList.remove('open');
  showToast('📋 Showing all recent activity');
};

window.markAllRead = () => {
  document.querySelectorAll('.notif-item').forEach(el => el.classList.add('read'));
  notifBadge.textContent = '0';
  notifBadge.style.display = 'none';
  notifDropdown.classList.remove('open');
  showToast('✅ All notifications marked as read');
};


/* ═══════════════════════════════════════════
   AVATAR DROPDOWN
═══════════════════════════════════════════ */
const avatarBtn      = document.getElementById('avatar-btn');
const avatarDropdown = document.getElementById('avatar-dropdown');

avatarBtn.addEventListener('click', e => {
  e.stopPropagation();
  avatarDropdown.classList.toggle('open');
  notifDropdown.classList.remove('open');
});

// Profile / Account / Logout handlers
document.querySelectorAll('.dropdown-item').forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    const text = item.textContent.trim();
    avatarDropdown.classList.remove('open');
    if (text.includes('Logout')) {
      showToast('👋 Logged out successfully');
      setTimeout(() => location.reload(), 1500);
    } else if (text.includes('Profile')) {
      showToast('👤 Profile page coming soon');
    } else if (text.includes('Account')) {
      showToast('⚙️ Account settings coming soon');
    }
  });
});

document.addEventListener('click', () => {
  notifDropdown.classList.remove('open');
  avatarDropdown.classList.remove('open');
  searchResults.classList.remove('open');
});


/* ═══════════════════════════════════════════
   NAV LINKS — smooth scroll + active state
═══════════════════════════════════════════ */
document.querySelectorAll('.nav-link, .sidebar-item').forEach(link => {
  link.addEventListener('click', e => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      const target = document.getElementById(href.slice(1));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.querySelectorAll('.sidebar-item').forEach(l => l.classList.remove('active'));
    document.querySelectorAll(`[href="${href}"]`).forEach(l => l.classList.add('active'));
  });
});


/* ═══════════════════════════════════════════
   GLOBAL SEARCH
═══════════════════════════════════════════ */
const globalSearch  = document.getElementById('global-search');
const searchResults = document.getElementById('search-results');

const searchData = [
  { label: '🧠 Planner Agent',         section: 'agents' },
  { label: '🔍 Research Agent',         section: 'agents' },
  { label: '💡 Decision Agent',         section: 'agents' },
  { label: '⚡ Executor Agent',         section: 'agents' },
  { label: '📊 Quick Stats',            section: 'analytics' },
  { label: '📋 Recent Tasks',           section: 'tasks' },
  { label: '🔀 Workflow Pipeline',      section: 'pipeline-section' },
  { label: '⚡ Quick Actions',          section: 'quick-actions-section' },
  { label: '🤖 AI Assistant',           section: 'assistant-section' },
];

globalSearch.addEventListener('input', () => {
  const q = globalSearch.value.trim().toLowerCase();
  if (!q) { searchResults.classList.remove('open'); return; }
  const filtered = searchData.filter(d => d.label.toLowerCase().includes(q));
  searchResults.innerHTML = filtered.length
    ? filtered.map(d =>
        `<div class="search-result-item" onclick="scrollToSection('${d.section}');searchResults.classList.remove('open');globalSearch.value='';">${d.label}</div>`
      ).join('')
    : '<div class="search-result-item">No results found</div>';
  searchResults.classList.add('open');
});
globalSearch.addEventListener('click', e => e.stopPropagation());


/* ═══════════════════════════════════════════
   TOAST
═══════════════════════════════════════════ */
const toastEl = document.getElementById('toast');
let toastTimer;
function showToast(msg, duration = 3000) {
  toastEl.textContent = msg;
  toastEl.classList.remove('hidden');
  requestAnimationFrame(() => toastEl.classList.add('show'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.classList.remove('show');
    setTimeout(() => toastEl.classList.add('hidden'), 400);
  }, duration);
}


/* ═══════════════════════════════════════════
   UTILITIES
═══════════════════════════════════════════ */
window.fillCommand = txt => {
  document.getElementById('command-input').value = txt;
  document.getElementById('command-input').focus();
  scrollToCommand();
};
window.clearCommand = () => { document.getElementById('command-input').value = ''; };
window.scrollToCommand = () =>
  document.getElementById('command-input').scrollIntoView({ behavior: 'smooth', block: 'center' });
window.scrollToSection = id => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }


/* ═══════════════════════════════════════════
   SCROLL-IN ANIMATIONS
═══════════════════════════════════════════ */
document.querySelectorAll('.glass-card, .stat-card, .agent-card').forEach(el => {
  el.classList.add('fade-in');
});
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.08 });
document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));


/* ═══════════════════════════════════════════
   AGENT CONFIG
═══════════════════════════════════════════ */
const ALL_AGENTS = [
  {
    id: 'planner', label: 'Planner Agent', icon: '🗺️',
    pipe: 'pipe-planner', color: 'blue',
    thinkMsg: 'Planner Agent analyzing request and creating roadmap...',
    desc: 'Breaks complex tasks into actionable steps and creates execution roadmaps.',
    tags: ['Task Planning', 'Roadmap', 'Delegation', 'Sequencing'],
    metrics: [['Model Type','Chain-of-Thought'],['Avg Decision Time','0.15s'],['Tasks Planned','—'],['Success Rate','100%']],
  },
  {
    id: 'research', label: 'Research Agent', icon: '🔍',
    pipe: 'pipe-research', color: 'teal',
    thinkMsg: 'Research Agent searching knowledge bases and web sources...',
    desc: 'Searches and gathers relevant information from web data and knowledge bases.',
    tags: ['Web Search', 'Knowledge Retrieval', 'Data Mining', 'NLP'],
    metrics: [['Model Type','RAG + Retrieval'],['Avg Search Time','0.20s'],['Sources Explored','50+'],['Accuracy','94%']],
  },
  {
    id: 'decision', label: 'Decision Agent', icon: '🧠',
    pipe: 'pipe-decision', color: 'purple',
    thinkMsg: 'Decision Agent evaluating options and selecting best outcome...',
    desc: 'Analyzes options, applies reasoning and evaluation to select the best outcome.',
    tags: ['Reasoning', 'Evaluation', 'Multi-criteria', 'Optimization'],
    metrics: [['Model Type','Tree-of-Thought'],['Avg Eval Time','0.18s'],['Options Evaluated','10 avg'],['Decision Accuracy','97%']],
  },
  {
    id: 'executor', label: 'Executor Agent', icon: '⚡',
    pipe: 'pipe-executor', color: 'green',
    thinkMsg: 'Executor Agent generating final output and compiling report...',
    desc: 'Generates the final polished output and compiles reports from all findings.',
    tags: ['Output Generation', 'Report Creation', 'Formatting', 'Synthesis'],
    metrics: [['Model Type','Generative LLM'],['Avg Gen Time','0.12s'],['Reports Created','—'],['Output Quality','High']],
  },
];

/* ═══════════════════════════════════════════
   AGENT SELECTION (single-agent mode)
═══════════════════════════════════════════ */
let selectedAgents = new Set(['planner','research','decision','executor']); // default: all

function refreshAgentCardStyles() {
  ALL_AGENTS.forEach(a => {
    const card = document.getElementById(`agent-${a.id}`);
    if (!card) return;
    if (selectedAgents.has(a.id)) {
      card.classList.add('selected');
      card.querySelector('.agent-select-badge').textContent = '✓ Selected';
      card.querySelector('.agent-select-badge').classList.add('on');
    } else {
      card.classList.remove('selected');
      card.querySelector('.agent-select-badge').textContent = '+ Select';
      card.querySelector('.agent-select-badge').classList.remove('on');
    }
  });
  const count = selectedAgents.size;
  const modeEl = document.getElementById('agent-mode-label');
  if (modeEl) {
    modeEl.textContent = count === 4
      ? '🔄 Full Pipeline Mode (all 4 agents)'
      : count === 1
        ? `🎯 Single Agent Mode — ${ALL_AGENTS.find(a => selectedAgents.has(a.id))?.label}`
        : `🔀 Custom Mode — ${count} agents selected`;
  }
}

window.toggleAgentSelection = function(id, e) {
  e.stopPropagation();
  if (selectedAgents.has(id)) {
    if (selectedAgents.size === 1) { showToast('⚠️ At least one agent must be selected'); return; }
    selectedAgents.delete(id);
  } else {
    selectedAgents.add(id);
  }
  refreshAgentCardStyles();
  showToast(selectedAgents.has(id)
    ? `✅ ${ALL_AGENTS.find(a=>a.id===id).label} added`
    : `❌ ${ALL_AGENTS.find(a=>a.id===id).label} removed`);
};

window.selectOnlyAgent = function(id) {
  selectedAgents = new Set([id]);
  refreshAgentCardStyles();
  showToast(`🎯 ${ALL_AGENTS.find(a=>a.id===id).label} selected — Single Agent Mode`);
};

window.selectAllAgents = function() {
  selectedAgents = new Set(['planner','research','decision','executor']);
  refreshAgentCardStyles();
  showToast('🔄 Full Pipeline Mode — all 4 agents active');
};


/* ═══════════════════════════════════════════
   STATS & HISTORY
═══════════════════════════════════════════ */
let taskCount    = parseInt(localStorage.getItem('taskCount') || '5');
let successCount = parseInt(localStorage.getItem('successCount') || '5');
let totalTime    = parseFloat(localStorage.getItem('totalTime') || '3.0');
let taskHistory  = JSON.parse(localStorage.getItem('taskHistory') || '[]');

function updateStats() {
  const rate = taskCount > 0 ? Math.min(100, Math.round(successCount / taskCount * 100)) : 100;
  const avg  = taskCount > 0 ? (totalTime / taskCount).toFixed(1) : '0.0';
  setText('stat-tasks',   taskCount);
  setText('stat-success', rate + '%');
  setText('stat-time',    avg + 's');
  setText('hero-tasks',   taskCount);
  setText('hero-success', rate + '%');
  setText('stat-agents',  selectedAgents.size);
  setText('hero-agents',  selectedAgents.size);
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

renderTasksTable();
updateStats();
refreshAgentCardStyles();

// Greeting
const greetEl = document.querySelector('.hero-greeting');
if (greetEl) {
  const h = new Date().getHours();
  greetEl.textContent = h < 12 ? '☀️ Good morning' : h < 17 ? '🌤️ Good afternoon' : h < 21 ? '🌆 Good evening' : '🌙 Good night';
}


/* ═══════════════════════════════════════════
   AGENT STATUS HELPERS
═══════════════════════════════════════════ */
function setAgentStatus(id, status) {
  const el = document.getElementById(`status-${id}`);
  if (!el) return;
  const colors = { idle:'yellow', active:'green', thinking:'yellow', completed:'green', error:'red' };
  const labels = { idle:'Idle', active:'⚡ Active', thinking:'💭 Thinking', completed:'✅ Done', error:'❌ Error' };
  el.innerHTML = `<span class="status-dot ${colors[status] || 'yellow'}"></span> ${labels[status] || status}`;
  document.getElementById(`agent-${id}`)?.classList.toggle('active', ['active','thinking'].includes(status));
}

function setProgress(id, pct) {
  const fill  = document.getElementById(`prog-${id}`);
  const label = document.getElementById(`prog-${id}-label`);
  if (fill)  fill.style.width  = pct + '%';
  if (label) label.textContent = pct + '%';
}

function animateProgress(id, duration) {
  return new Promise(res => {
    let cur = 0;
    const step = () => {
      cur = Math.min(cur + 1, 100);
      setProgress(id, cur);
      if (cur < 100) setTimeout(step, duration / 100);
      else res();
    };
    step();
  });
}

function lightPipe(nodeId) {
  document.getElementById(nodeId)?.classList.add('lit');
}

function unlightPipe(nodeId) {
  document.getElementById(nodeId)?.classList.remove('lit');
}

function addToFeed(text, type = 'smart_toy') {
  const feedList = document.getElementById('feed-list');
  if (!feedList) return;
  const now  = new Date();
  const time = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const li   = document.createElement('li');
  li.className = 'feed-item';
  li.innerHTML = `<span class="material-icons feed-icon">${type}</span><span>${text}</span><time>${time}</time>`;
  feedList.prepend(li);
  while (feedList.children.length > 25) feedList.removeChild(feedList.lastChild);
}

function addThinkingLine(msg) {
  const log = document.getElementById('thinking-log');
  if (!log) return;
  const div = document.createElement('div');
  div.className = 'thinking-line';
  div.innerHTML = `<span class="material-icons">arrow_right</span>${msg}`;
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}

function setAssistantStatus(text, active = false) {
  const el    = document.getElementById('assistant-status');
  const robot = document.getElementById('robot-scene');
  if (el)    el.innerHTML = `<span class="status-dot ${active ? 'green' : 'yellow'}"></span> ${text}`;
  if (robot) robot.classList.toggle('executing', active);
}

/* Timer */
let timerInterval, timerStart;
function startTimer() {
  timerStart = Date.now();
  const display = document.getElementById('timer-display');
  document.getElementById('task-timer')?.classList.remove('hidden');
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (display) display.textContent = ((Date.now() - timerStart) / 1000).toFixed(1) + 's';
  }, 100);
}
function stopTimer() {
  clearInterval(timerInterval);
  return ((Date.now() - timerStart) / 1000).toFixed(2);
}


/* ═══════════════════════════════════════════
   MOCK RESULT BUILDER
═══════════════════════════════════════════ */
function buildMockResult(task, agentIds) {
  const lc    = task.toLowerCase();
  const names = agentIds.map(id => ALL_AGENTS.find(a => a.id === id)?.label || id);

  let steps = [
    'Parsed and understood user request',
    'Created execution plan',
    'Retrieved relevant data and knowledge',
    'Applied reasoning algorithms',
    'Synthesized all findings',
    'Compiled final structured report',
  ].filter((_, i) => {
    if (agentIds.length === 1) return i === 0 || i === 5; // only start + end for single
    if (agentIds.length === 2) return [0, 2, 5].includes(i);
    return true;
  });

  if (lc.includes('goa') || lc.includes('trip') || lc.includes('travel')) {
    return {
      summary: `AI trip planning complete for: "${task}"`,
      agents: names,
      steps,
      data: [
        'Best travel months: October – March (dry season)',
        'Cheapest flights: ₹2,800 round trip (avg)',
        'Budget hotels available: ₹1,200–₹2,500/night',
        'top activities: beach, fort, waterfall excursions',
        '12 itinerary options generated',
      ],
      final: `🏖️ <strong>Goa Trip Plan</strong><br>Budget: ₹9,500 | Duration: 4 nights / 5 days<br><br>🏨 <strong>Hotel:</strong> Sea Pearl Resort — ₹2,000/night (incl. breakfast)<br>🚌 <strong>Transport:</strong> Overnight Volvo Bus — ₹800 round trip<br>🍽️ <strong>Food estimate:</strong> ₹2,500<br>🎯 <strong>Top Activities:</strong> Baga Beach, Fort Aguada, Dudhsagar Falls, Calangute night market<br>💰 <strong>Total:</strong> ₹9,300 (₹700 buffer remaining)`,
      sections: [
        { title: 'Day-wise Itinerary', body: 'Day 1: Travel & check-in → Day 2: North Goa beaches → Day 3: Heritage & forts tour → Day 4: Dudhsagar Falls → Day 5: Shopping & return' },
        { title: 'Budget Breakdown', body: '🏨 Hotel: ₹8,000 (4 nights) | 🚌 Transport: ₹800 | 🍽️ Food: ₹2,500 | 🎯 Activities: ₹1,200 | 🛍️ Shopping: ₹1,000 | 💰 Total: ₹9,500' },
        { title: 'Pro Tips', body: '• Book bus tickets 2 weeks in advance for best prices\n• Carry sunscreen & cash (many beach shacks don\'t accept cards)\n• Rent a scooter (₹300/day) for local travel to save auto fare' },
      ]
    };
  }

  if (lc.includes('stock') || lc.includes('market') || lc.includes('analy')) {
    return {
      summary: `Market analysis completed for: "${task}"`,
      agents: names,
      steps,
      data: [
        'Nifty 50 7-day trend: +1.2%',
        'Top performing sector: IT (+3.4%)',
        'Volatility index (VIX): 16.8 (stable)',
        'FII inflows this week: +₹4,200 Cr',
        'Recommendation: Moderate Buy',
      ],
      final: `📈 <strong>Market Analysis Report</strong><br>Bullish trend detected in IT & Banking sectors.<br><br>📊 <strong>Portfolio Suggestion:</strong> 40% Large-cap | 35% Mid-cap | 25% Fixed Income<br>🎯 <strong>Target return:</strong> 12–15% annually<br>⚠️ <strong>Risk Level:</strong> Moderate`,
      sections: [
        { title: 'Top Stocks to Watch', body: 'TCS (+4.2%), HDFC Bank (+3.1%), Infosys (+5.0%), Reliance (+1.8%)' },
        { title: 'Sector Analysis', body: 'IT: Strong buy signal 🟢 | Banking: Buy 🟢 | FMCG: Hold 🟡 | Pharma: Hold 🟡 | Metals: Sell 🔴' },
        { title: 'Risk Assessment', body: 'Global uncertainty: Medium risk | Inflation: 4.2% (controlled) | RBI policy: Stable — next meeting in 3 weeks' },
      ]
    };
  }

  if (lc.includes('startup') || lc.includes('idea') || lc.includes('business')) {
    return {
      summary: `Startup research completed for: "${task}"`,
      agents: names,
      steps,
      data: [
        '34 startup ideas analyzed across verticals',
        'Total combined TAM: $2.3B',
        'Top 3 shortlisted by viability score',
        'Average funding round for similar startups: $1.2M',
        '3 comparable successful companies per idea found',
      ],
      final: `💡 <strong>Top AI Startup Ideas 2026</strong><br><br>1️⃣ AI-powered legal document assistant — TAM: $800M | Effort: Medium<br>2️⃣ Personalized health coach bot — TAM: $1.2B | Effort: High<br>3️⃣ Automated supply chain optimizer — TAM: $300M | Effort: Medium`,
      sections: [
        { title: 'Idea #1 Deep Dive', body: 'Legal AI: Draft contracts, review NDAs, summarize court orders. Cost to launch: $15K. Key competitors: DoNotPay, Harvey AI. Moat: Indic language support.' },
        { title: 'Idea #2 Deep Dive', body: 'Health Coach Bot: Daily check-ins, diet recommendations, habit tracking. FDA-exempt if advisory only. Moat: Vernacular languages + Ayurveda integration.' },
        { title: 'Idea #3 Deep Dive', body: 'Supply Chain Optimizer: Real-time demand forecasting, supplier scoring, route optimization. B2B SaaS model. Target: mid-size manufacturers in Tier 2 cities.' },
      ]
    };
  }

  if (lc.includes('marketing') || lc.includes('strategy')) {
    return {
      summary: `Marketing strategy created for: "${task}"`,
      agents: names,
      steps,
      data: [
        'Target audience: 18–35 urban professionals',
        '5 competitor campaigns analyzed',
        'Best channels: Instagram Reels + LinkedIn',
        'Estimated CPL (Cost Per Lead): ₹85',
        'Budget recommendation: ₹50,000/month',
      ],
      final: `📣 <strong>90-Day Marketing Strategy</strong><br><br>Phase 1 (Weeks 1–4): Brand awareness via Instagram Reels & LinkedIn posts<br>Phase 2 (Weeks 5–8): Lead gen via paid ads + email drip campaigns<br>Phase 3 (Weeks 9–12): Retention + referral program launch<br><br>🎯 <strong>KPI:</strong> 500 qualified leads in 60 days`,
      sections: [
        { title: 'Content Calendar (Week 1)', body: 'Mon: Brand story reel | Wed: Product demo | Fri: Customer testimonial | Sun: Behind-the-scenes' },
        { title: 'Paid Ad Strategy', body: 'Instagram: ₹20K/month | Google Search: ₹15K/month | LinkedIn Ads: ₹15K/month | Total: ₹50K/month' },
        { title: 'KPIs & Tracking', body: 'Weekly: Reach, impressions, CTR | Monthly: CPL, conversion rate, CAC | Quarterly: LTV, churn rate, NPS' },
      ]
    };
  }

  return {
    summary: `Task completed successfully using ${names.join(', ')}: "${task}"`,
    agents: names,
    steps,
    data: [
      `${agentIds.length} agent(s) executed the pipeline`,
      'Knowledge base queried: 200+ documents',
      '0 errors encountered',
      'Output quality score: 94/100',
      'Confidence level: High (92%)',
    ],
    final: `✅ <strong>Task Result</strong><br>Your task "<em>${task}</em>" was processed successfully by ${names.join(' → ')}.<br><br>🔑 <strong>Key Findings:</strong> Based on available data and reasoning, the recommended course of action has been identified with 92% confidence.<br><br>📌 <strong>Next Step:</strong> Review the detailed breakdown in the sections below and take action accordingly.`,
    sections: [
      { title: 'Executive Summary', body: `The task was analyzed, researched, evaluated and executed in sequence. All agents reported successful completion. Total processed data: ~200 relevant sources.` },
      { title: 'Confidence Analysis', body: 'Input comprehension: 98% | Data relevance: 91% | Decision confidence: 94% | Output quality: 96%' },
      { title: 'Recommended Next Steps', body: '1. Review the final output above\n2. Apply the recommendations to your use case\n3. Run a follow-up task for deeper analysis if needed\n4. Export or share this report' },
    ]
  };
}


/* ═══════════════════════════════════════════
   RESULT PANEL with expandable sections
═══════════════════════════════════════════ */
function renderResultPanel(result, elapsed) {
  const panel = document.getElementById('result-panel');

  document.getElementById('result-summary').textContent = result.summary;

  // Agents used badges
  const agentsUsedEl = document.getElementById('result-agents-used');
  if (agentsUsedEl) {
    agentsUsedEl.innerHTML = result.agents
      .map(a => `<span class="tag">${a}</span>`).join('');
  }

  // Steps
  const stepsList = document.getElementById('result-steps');
  stepsList.innerHTML = result.steps.map((s, i) =>
    `<li><span class="step-num">${i + 1}</span>${s}</li>`).join('');

  // Data found
  const dataList = document.getElementById('result-data');
  dataList.innerHTML = result.data.map(d =>
    `<li><span class="material-icons" style="font-size:.85rem;color:var(--clr-primary);vertical-align:middle">fiber_manual_record</span> ${d}</li>`).join('');

  // Final result
  document.getElementById('result-final').innerHTML = result.final;

  // Execution time
  document.getElementById('result-time-display').textContent = `⏱ ${elapsed}s`;

  // Detailed expandable sections
  const detailsContainer = document.getElementById('result-details-container');
  if (detailsContainer && result.sections) {
    detailsContainer.innerHTML = result.sections.map((sec, i) => `
      <div class="detail-section" id="detail-sec-${i}">
        <button class="detail-toggle" onclick="toggleDetail(${i})">
          <span class="material-icons detail-arrow" id="detail-arrow-${i}">expand_more</span>
          <span>${sec.title}</span>
        </button>
        <div class="detail-body hidden" id="detail-body-${i}">
          <p>${sec.body.replace(/\n/g, '<br>')}</p>
        </div>
      </div>
    `).join('');
  }

  panel.classList.remove('hidden');
  setTimeout(() => panel.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
}

window.toggleDetail = function(i) {
  const body  = document.getElementById(`detail-body-${i}`);
  const arrow = document.getElementById(`detail-arrow-${i}`);
  if (!body) return;
  const open = !body.classList.contains('hidden');
  body.classList.toggle('hidden', open);
  if (arrow) arrow.textContent = open ? 'expand_more' : 'expand_less';
};

window.expandAllDetails = function() {
  document.querySelectorAll('.detail-body').forEach((b, i) => {
    b.classList.remove('hidden');
    const arrow = document.getElementById(`detail-arrow-${i}`);
    if (arrow) arrow.textContent = 'expand_less';
  });
};

window.collapseAllDetails = function() {
  document.querySelectorAll('.detail-body').forEach((b, i) => {
    b.classList.add('hidden');
    const arrow = document.getElementById(`detail-arrow-${i}`);
    if (arrow) arrow.textContent = 'expand_more';
  });
};

window.copyReport = function() {
  const summary = document.getElementById('result-summary')?.textContent || '';
  const final   = document.getElementById('result-final')?.innerText || '';
  navigator.clipboard.writeText(`SUMMARY:\n${summary}\n\nFINAL RESULT:\n${final}`)
    .then(() => showToast('📋 Report copied to clipboard!'))
    .catch(() => showToast('❌ Copy failed — please copy manually'));
};

window.downloadReport = function() {
  const summary  = document.getElementById('result-summary')?.textContent || '';
  const steps    = Array.from(document.querySelectorAll('#result-steps li'))
                     .map((li, i) => `${i+1}. ${li.textContent.trim()}`).join('\n');
  const data     = Array.from(document.querySelectorAll('#result-data li'))
                     .map(li => `• ${li.textContent.trim()}`).join('\n');
  const finalTxt = document.getElementById('result-final')?.innerText || '';
  const now      = new Date().toLocaleString('en-IN');

  const content = `MULTI-AGENT AI SYSTEM — TASK REPORT\nGenerated: ${now}\n${'='.repeat(50)}\n\nSUMMARY\n${summary}\n\nSTEPS TAKEN\n${steps}\n\nDATA FOUND\n${data}\n\nFINAL RESULT\n${finalTxt}\n${'='.repeat(50)}\nPowered by Multi-Agent AI System v1.0`;

  const blob = new Blob([content], { type: 'text/plain' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `AI_Report_${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('📄 Report downloaded!');
};


/* ═══════════════════════════════════════════
   RUN TASK
═══════════════════════════════════════════ */
window.runTask = async function() {
  const input = document.getElementById('command-input').value.trim();
  if (!input) { showToast('⚠️ Please enter a task first!'); return; }
  if (selectedAgents.size === 0) { showToast('⚠️ Select at least one agent!'); return; }

  const runBtn = document.getElementById('run-task-btn');
  runBtn.disabled = true;

  // Reset pipeline
  document.querySelectorAll('.pipeline-node').forEach(n => n.classList.remove('lit'));
  document.getElementById('result-panel').classList.add('hidden');

  // Show thinking panel
  const thinkPanel = document.getElementById('thinking-panel');
  const thinkLog   = document.getElementById('thinking-log');
  thinkPanel.classList.remove('hidden');
  thinkLog.innerHTML = '';

  // Reset all agent cards
  ALL_AGENTS.forEach(a => { setAgentStatus(a.id, 'idle'); setProgress(a.id, 0); });

  setAssistantStatus('Executing task...', true);
  addToFeed(`🚀 New task: "${input.substring(0, 50)}${input.length > 50 ? '…' : ''}"`, 'play_arrow');

  startTimer();
  lightPipe('pipe-input');
  await delay(350);

  const activeAgents = ALL_AGENTS.filter(a => selectedAgents.has(a.id));

  for (const agent of activeAgents) {
    setAgentStatus(agent.id, 'thinking');
    lightPipe(agent.pipe);
    addThinkingLine(agent.thinkMsg);
    addToFeed(`${agent.icon} ${agent.label} started...`, 'smart_toy');
    await animateProgress(agent.id, 1600);
    setAgentStatus(agent.id, 'completed');
    addToFeed(`${agent.icon} ${agent.label} ✅ completed`, 'check_circle');
    await delay(300);
  }

  lightPipe('pipe-output');
  addThinkingLine('✅ All selected agents completed. Compiling final report...');

  const elapsed = stopTimer();
  setAssistantStatus('Idle', false);

  // Build result
  const result = buildMockResult(input, [...selectedAgents]);
  renderResultPanel(result, elapsed);

  // Stats
  taskCount++;
  successCount++;
  totalTime = parseFloat((totalTime + parseFloat(elapsed)).toFixed(2));
  localStorage.setItem('taskCount',    taskCount);
  localStorage.setItem('successCount', successCount);
  localStorage.setItem('totalTime',    totalTime);
  updateStats();

  // History
  const now = new Date();
  taskHistory.unshift({
    id:     taskCount,
    name:   input.substring(0, 50),
    agents: activeAgents.map(a => a.label).join(', '),
    status: 'completed',
    time:   elapsed + 's',
    date:   now.toLocaleDateString('en-IN'),
  });
  if (taskHistory.length > 30) taskHistory.pop();
  localStorage.setItem('taskHistory', JSON.stringify(taskHistory));
  renderTasksTable();

  showToast(`✅ Task done in ${elapsed}s using ${activeAgents.length} agent(s)!`);
  runBtn.disabled = false;
};


/* ═══════════════════════════════════════════
   TASKS TABLE
═══════════════════════════════════════════ */
function renderTasksTable() {
  const tbody   = document.getElementById('tasks-tbody');
  const emptyEl = document.getElementById('empty-tasks');
  const tableEl = document.getElementById('tasks-table');

  const seedData = [
    { id:1, name:'Research AI startup ideas',     agents:'All 4 Agents', status:'completed', time:'0.7s', date:'04/05/2026' },
    { id:2, name:'Analyze stock market trends',   agents:'All 4 Agents', status:'completed', time:'0.6s', date:'04/05/2026' },
    { id:3, name:'Plan a Goa trip under ₹10,000', agents:'All 4 Agents', status:'completed', time:'0.5s', date:'04/05/2026' },
    { id:4, name:'Create marketing strategy',     agents:'All 4 Agents', status:'completed', time:'0.8s', date:'04/05/2026' },
    { id:5, name:'Draft project proposal',        agents:'All 4 Agents', status:'completed', time:'0.4s', date:'04/05/2026' },
  ];
  const data = taskHistory.length ? taskHistory : seedData;

  if (!data.length) {
    tableEl.classList.add('hidden');
    emptyEl.classList.remove('hidden');
    return;
  }
  tableEl.classList.remove('hidden');
  emptyEl.classList.add('hidden');

  tbody.innerHTML = data.map(t => `
    <tr onclick="showTaskDetail(${JSON.stringify(t).replace(/"/g,'&quot;')})">
      <td>#${t.id} ${t.name}</td>
      <td>${t.agents}</td>
      <td><span class="status-badge ${t.status}">${t.status === 'completed' ? '✅ Completed' : t.status}</span></td>
      <td>${t.time}</td>
      <td>${t.date}</td>
    </tr>
  `).join('');
}

window.clearTasks = () => {
  taskHistory = [];
  localStorage.removeItem('taskHistory');
  renderTasksTable();
  showToast('🗑️ Task history cleared');
};

window.showTaskDetail = task => {
  document.getElementById('modal-content').innerHTML = `
    <h2 style="margin-bottom:.25rem">📋 Task Detail</h2>
    <p style="color:var(--clr-muted);font-size:.75rem;margin-bottom:1rem">Task #${task.id}</p>
    <div class="modal-metrics">
      <div class="modal-metric"><span>Task</span><span>${task.name}</span></div>
      <div class="modal-metric"><span>Agents</span><span>${task.agents}</span></div>
      <div class="modal-metric"><span>Status</span><span>✅ ${task.status}</span></div>
      <div class="modal-metric"><span>Time</span><span>⏱ ${task.time}</span></div>
      <div class="modal-metric"><span>Date</span><span>${task.date}</span></div>
    </div>
    <button class="btn-primary" style="margin-top:1rem;width:100%" onclick="fillCommand('${task.name.replace(/'/g,"\\'")}');closeModal()">
      <span class="material-icons">replay</span> Re-run this Task
    </button>
  `;
  openModal();
};


/* ═══════════════════════════════════════════
   AGENT DETAIL MODAL
═══════════════════════════════════════════ */
window.openAgentModal = function(id) {
  const info = ALL_AGENTS.find(a => a.id === id);
  if (!info) return;
  const selected = selectedAgents.has(id);
  document.getElementById('modal-content').innerHTML = `
    <h2 style="margin-bottom:.3rem">${info.icon} ${info.label}</h2>
    <p style="color:var(--clr-muted);font-size:.78rem;margin-bottom:.75rem">${info.desc}</p>
    <div class="modal-tags">${info.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
    <div class="modal-metrics" style="margin-top:.75rem">
      ${info.metrics.map(([k,v]) => `<div class="modal-metric"><span>${k}</span><span>${v}</span></div>`).join('')}
    </div>
    <div style="display:flex;gap:.6rem;margin-top:1rem;flex-wrap:wrap">
      <button class="btn-primary" onclick="selectOnlyAgent('${id}');closeModal()">
        <span class="material-icons">adjust</span> Use Only This Agent
      </button>
      <button class="btn-outline" onclick="toggleAgentSelection('${id}',event);closeModal()">
        <span class="material-icons">${selected ? 'remove_circle_outline' : 'add_circle_outline'}</span>
        ${selected ? 'Deselect' : 'Add to Pipeline'}
      </button>
    </div>
  `;
  openModal();
};

function openModal()  { document.getElementById('modal-overlay').classList.remove('hidden'); }
window.closeModal = () => document.getElementById('modal-overlay').classList.add('hidden');

// Close modal on overlay click
document.getElementById('modal-overlay').addEventListener('click', e => {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
});

// ESC to close modal
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
