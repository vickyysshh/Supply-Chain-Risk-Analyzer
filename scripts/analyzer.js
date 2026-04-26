/**
 * Supply Chain Risk Analyzer v2.0 Pro
 * Enterprise Dashboard JS — Full button functionality + dynamic sea routes
 */
'use strict';

const BASE_URL = 'http://localhost:5000/api';

const PORT_COORDS = {
  'Shanghai':    { lat:31.4136, lng:121.6147, country:'China',        flag:'🇨🇳', timezone:'UTC+8',  phone:'+86 21 6329 1900', email:'info@portshanghai.com' },
  'Los Angeles': { lat:33.7426, lng:-118.2718,country:'USA',          flag:'🇺🇸', timezone:'UTC-8',  phone:'+1 310 732 3508',  email:'info@portofla.org' },
  'Rotterdam':   { lat:51.9225, lng:4.2792,   country:'Netherlands',  flag:'🇳🇱', timezone:'UTC+1',  phone:'+31 10 252 1010',  email:'info@portofrotterdam.com' },
  'Singapore':   { lat:1.3521,  lng:103.8198, country:'Singapore',    flag:'🇸🇬', timezone:'UTC+8',  phone:'+65 6375 1600',    email:'info@mpa.gov.sg' },
  'Long Beach':  { lat:33.7494, lng:-118.1925,country:'USA',          flag:'🇺🇸', timezone:'UTC-8',  phone:'+1 562 283 7000',  email:'info@polb.com' },
  'Port Said':   { lat:31.2461, lng:32.2957,  country:'Egypt',        flag:'🇪🇬', timezone:'UTC+2',  phone:'+20 066 3237 860', email:'info@portsaid.gov.eg' }
};

const SEA_WAYPOINTS = {
  'Shanghai-Los Angeles': [[31.4136,121.6147],[30,140],[25,160],[20,-175],[22,-155],[18,-130],[25,-118],[33.7426,-118.2718]],
  'Shanghai-Long Beach':  [[31.4136,121.6147],[30,140],[25,160],[20,-175],[22,-155],[18,-128],[25,-118.5],[33.7494,-118.1925]],
  'Shanghai-Port Said':   [[31.4136,121.6147],[25,105],[10,80],[5,60],[11.5,44.5],[13.5,43],[28,33],[31.2461,32.2957]],
  'Rotterdam-Singapore':  [[51.9225,4.2792],[40,10],[36.5,20],[32,32],[28,33],[13,43.5],[11.5,44.5],[8,62],[1.3521,103.8198]],
  'Rotterdam-Shanghai':   [[51.9225,4.2792],[36.5,20],[32,32],[28,33],[13,43.5],[8,62],[15,90],[25,105],[31.4136,121.6147]],
  'Singapore-Rotterdam':  [[1.3521,103.8198],[5,80],[8,60],[11.5,50],[13,43],[28,33],[31.2461,32.2957],[36,12],[45,3],[51.9225,4.2792]],
  'Singapore-Los Angeles':[[1.3521,103.8198],[10,130],[18,-175],[22,-155],[25,-130],[30,-118.5],[33.7426,-118.2718]],
  'Port Said-Rotterdam':  [[31.2461,32.2957],[36,12],[40,7],[45,3],[51.9225,4.2792]],
  'Los Angeles-Shanghai': [[33.7426,-118.2718],[25,-118],[18,-130],[22,-155],[20,-175],[25,160],[30,140],[31.4136,121.6147]]
};

function getWaypoints(o, d) {
  const k = `${o}-${d}`;
  const kr = `${d}-${o}`;
  if (SEA_WAYPOINTS[k]) return SEA_WAYPOINTS[k];
  if (SEA_WAYPOINTS[kr]) return [...SEA_WAYPOINTS[kr]].reverse();
  // fallback: interpolate
  const oc = PORT_COORDS[o], dc = PORT_COORDS[d];
  if (!oc || !dc) return [];
  const pts = [];
  for (let i = 0; i <= 8; i++) {
    const t = i / 8;
    // Add a slight curve to the interpolation for better visuals
    const latCurve = Math.sin(t * Math.PI) * 10;
    pts.push([oc.lat + (dc.lat - oc.lat)*t + latCurve, oc.lng + (dc.lng - oc.lng)*t]);
  }
  return pts;
}

async function geocodeCity(cityName) {
  if (PORT_COORDS[cityName]) return PORT_COORDS[cityName];
  try {
     let res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}`);
     let data = await res.json();
     if (data && data.length > 0) {
        PORT_COORDS[cityName] = {
           lat: parseFloat(data[0].lat), 
           lng: parseFloat(data[0].lon), 
           country: 'Global', 
           flag:'🌐', 
           timezone:'UTC', 
           phone:'+1 800 555 0199', 
           email:'port@'+cityName.toLowerCase().replace(/\s/g,'')+'.com' 
        };
        return PORT_COORDS[cityName];
     }
  } catch(e) { console.warn('Geocode failed', e); }
  
  // fallback if offline or not found
  const h = Array.from(cityName).reduce((a,b) => a + b.charCodeAt(0), 0);
  PORT_COORDS[cityName] = {
    lat: (h % 140) - 70, 
    lng: ((h * 13) % 360) - 180, 
    country: 'Unknown',
    flag: '⚓',
    timezone: 'UTC',
    phone: 'N/A',
    email: 'info@' + cityName.toLowerCase().replace(/\s/g,'') + '.com'
  };
  return PORT_COORDS[cityName];
}

let appState = {
  map: null,
  map2: null,
  mapInitialized: false,
  map2Initialized: false,
  routeLayers: [],
  routeLayers2: [],
  analysis: null,
  currentView: 'idle',
  analysisCount: parseInt(localStorage.getItem('analysisCount') || '0'),
  history: JSON.parse(localStorage.getItem('analysisHistory') || '[]'),
  settings: JSON.parse(localStorage.getItem('userSettings') || '{}')
};

// defaults
appState.settings = Object.assign({
  defaultCurrency:'USD', autoRefresh:false, notifications:true, riskThreshold:60
}, appState.settings);

// ─── INIT ───
document.addEventListener('DOMContentLoaded', () => {
  updateCounter();
  updateFooterTime();
  setInterval(updateFooterTime, 60000);
  checkServer();
  setupForm();
  setupNavButtons();
  setupResultsButtons();
  setupFooterButtons();
  initIdleMap();
  updateHistoryBadge();
});

function updateCounter() {
  const el = document.getElementById('analysisCount');
  if (el) el.textContent = appState.analysisCount;
}

function updateHistoryBadge() {
  const badge = document.getElementById('historyBadge');
  if (badge) badge.textContent = appState.history.length;
}

function updateFooterTime() {
  const el = document.getElementById('footerTime');
  if (el) el.textContent = new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
}

async function checkServer() {
  try {
    const r = await fetch(`${BASE_URL}/health`, { signal: AbortSignal.timeout(4000) });
    setServerStatus(r.ok ? 'online' : 'offline');
  } catch { setServerStatus('offline'); }
}

function setServerStatus(s) {
  const dot = document.getElementById('serverDot');
  const txt = document.getElementById('serverStatus');
  if (dot) dot.className = 'status-dot ' + s;
  if (txt) txt.textContent = s === 'online' ? 'Server Online' : 'Server Offline';
}

// ─── IDLE MAP ───
function initIdleMap() {
  const container = document.getElementById('idleMap');
  if (!container || appState.mapInitialized) return;

  try {
    const idleMap = L.map('idleMap', {
      center:[20,30], zoom:2,
      zoomControl:false, attributionControl:false,
      interactive:false
    });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {maxZoom:19}).addTo(idleMap);
    setTimeout(() => idleMap.invalidateSize(), 200);
  } catch(e) { console.log('Idle map error', e); }
}

// ─── VIEW SWITCHING ───
// ─── VIEW COMPONENT LOADER ───
// Each sidebar button maps to a file in /components/
// Components are fetched once and cached in appState.viewCache
const VIEW_COMPONENTS = {
  dashboard : 'components/dashboard_view.html',
  risks     : 'components/risks_view.html',
  routes    : 'components/routes_view.html',
  ports     : 'components/ports_view.html',
  report    : 'components/report_view.html',
};

async function switchView(viewName, el) {
  // Update sidebar active state
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  if (el) el.classList.add('active');

  // Hide idle + loading states
  const idleEl = document.getElementById('idleState');
  const loadEl = document.getElementById('loadingState');
  if (idleEl) idleEl.style.display = 'none';
  if (loadEl) loadEl.style.display = 'none';

  if (!appState.analysis) {
    if (idleEl) idleEl.style.display = 'block';
    showToast('Run an analysis first', 'warning');
    return;
  }

  const container = document.getElementById('mainContent');
  if (!container) return;

  // Show the container
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.flex = '1';
  container.style.overflow = 'auto';

  // Load component (cached after first load)
  if (!appState.viewCache) appState.viewCache = {};
  if (!appState.viewCache[viewName]) {
    const url = VIEW_COMPONENTS[viewName];
    if (!url) { console.warn('Unknown view:', viewName); return; }
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      appState.viewCache[viewName] = await res.text();
    } catch(err) {
      console.error('Component load failed:', err);
      showToast('Failed to load view component', 'error');
      return;
    }
  }

  container.innerHTML = appState.viewCache[viewName];
  appState.currentView = viewName;

  // Post-load hooks per view — populate data + bind buttons
  if (viewName === 'dashboard') {
    setupResultsButtons();
    if (appState.analysis) populateDashboardView(appState.analysis);
    // Destroy old map so it gets re-created on the freshly loaded #map div
    if (appState.map) { appState.map.remove(); appState.map = null; appState.routeLayers = []; }
    initMap1();
    if (appState.analysis) {
      setTimeout(() => {
        appState.map?.invalidateSize();
        drawSeaRoutes(appState.map, appState.routeLayers, appState.analysis.userInput, appState.analysis.alternativeRoutes);
      }, 150);
    }
  }
  if (viewName === 'risks') {
    setupResultsButtons();
    if (appState.analysis) populateRisksView(appState.analysis);
  }
  if (viewName === 'routes') {
    setupResultsButtons();
    if (appState.map2) { appState.map2.remove(); appState.map2 = null; appState.routeLayers2 = []; }
    initMap2();
    setTimeout(() => {
      appState.map2?.invalidateSize();
      if (appState.analysis) {
        drawSeaRoutes(appState.map2, appState.routeLayers2, appState.analysis.userInput, appState.analysis.alternativeRoutes);
        populateRoutesView(appState.analysis);
      }
    }, 150);
  }
  if (viewName === 'ports') {
    setupResultsButtons();
    if (appState.analysis) populatePortsView(appState.analysis);
  }
  if (viewName === 'report') {
    setupResultsButtons();
    if (appState.analysis) populateReportView(appState.analysis);
  }
}


function switchTopNav(name, el) {
  document.querySelectorAll('.topbar-link').forEach(l => l.classList.remove('active'));
  el.classList.add('active');
  const viewMap = { global:'dashboard', predictive:'risks', resource:'report' };
  const sidebar = document.querySelector(`.nav-item[data-view="${viewMap[name] || 'dashboard'}"]`);
  switchView(viewMap[name] || 'dashboard', sidebar);
}

// ─── FORM ───
function setupForm() {
  document.getElementById('analysisForm')?.addEventListener('submit', handleSubmit);
  document.getElementById('resetBtn')?.addEventListener('click', () => {
    document.getElementById('analysisForm').reset();
    showToast('Form cleared', 'info');
  });
}

async function handleSubmit(e) {
  e.preventDefault();
  const origin = document.getElementById('origin').value;
  const destination = document.getElementById('destination').value;
  const product = document.getElementById('product').value;
  const shipmentType = document.getElementById('shipmentType').value;

  if (!origin||!destination||!product||!shipmentType) return showToast('Please fill all fields','warning');
  if (origin===destination) return showToast('Origin and destination must differ','warning');

  showLoading();
  try {
    simulateAgentProgress();
    
    // Geocode cities if they are new (for map plotting)
    await geocodeCity(origin);
    await geocodeCity(destination);
    
    const res = await fetch(`${BASE_URL}/analyze`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({origin,destination,product,shipmentType})
    });
    if (!res.ok) throw new Error('HTTP '+res.status);
    const result = await res.json();
    result.analysis.userInput = {origin,destination,product,shipmentType};
    
    // Map backend response structures to frontend variables
    result.analysis.port = result.analysis.portData || {origin:{}, destination:{}};
    result.analysis.news = result.analysis.newsData || {articles:[]};
    result.analysis.weather = result.analysis.weatherData || {alerts:[]};

    saveToHistory(result.analysis);
    appState.analysisCount++;
    localStorage.setItem('analysisCount', String(appState.analysisCount));
    updateCounter();
    updateHistoryBadge();

    await new Promise(r => setTimeout(r,800)); // show agents briefly
    displayResults(result);
  } catch(err) {
    console.error(err);
    hideLoading();
    showAlertBanner('Connection Error', 'Cannot reach backend on port 5000. Please start the server.', 'error');
    showToast('Analysis failed — check server connection','error');
  }
}

function simulateAgentProgress() {
  const agents = ['news','weather','port','risk','route','report'];
  const delays = [200,400,600,1000,1200,1500];
  agents.forEach((a,i) => setTimeout(() => {
    const item = document.querySelector(`.agent-status-item[data-agent="${a}"]`);
    if (!item) return;
    item.classList.add('done');
    const ast = item.querySelector('.ast');
    if (ast) { ast.className='ast done'; ast.textContent='✓ Done'; }
  }, delays[i]));
}

function showLoading() {
  document.getElementById('idleState').style.display = 'none';
  const mc = document.getElementById('mainContent');
  if (mc) mc.style.display = 'none';
  document.getElementById('loadingState').style.display = 'flex';
  // Reset agents
  document.querySelectorAll('.agent-status-item').forEach((item,i) => {
    item.classList.remove('done');
    const ast = item.querySelector('.ast');
    if (ast) { ast.className = i<3?'ast running':'ast waiting'; ast.textContent = i<3?'Analyzing...':'Waiting...'; }
  });
}

function hideLoading() {
  document.getElementById('loadingState').style.display = 'none';
}

// ─── DISPLAY RESULTS ───
function displayResults(result) {
  if (!result.success) { hideLoading(); showToast('Analysis failed','error'); return; }

  appState.analysis = result.analysis;
  // Clear view cache so all views re-render with new data
  appState.viewCache = {};
  hideLoading();

  // Switch to dashboard — switchView's post-load hook will call populateDashboardView
  const dashNav = document.querySelector('.nav-item[data-view="dashboard"]');
  switchView('dashboard', dashNav);

  // Alert banner if high risk
  const level = result.analysis.riskAssessment.riskLevel;
  if (level === 'HIGH') {
    showAlertBanner(
      'Port Congestion Warning: ' + result.analysis.userInput.origin + ' → ' + result.analysis.userInput.destination + ' Sector',
      'Risk level CRITICAL. ' + result.analysis.riskAssessment.keyFactors?.[0],
      'danger'
    );
  } else {
    const banner = document.getElementById('alertBanner');
    if (banner) banner.style.display = 'none';
  }
}

// Alias so switchView post-hooks can call displayRisksView
function displayRisksView(analysis)  { populateRisksView(analysis); }
function displayRoutesView(analysis) { populateRoutesView(analysis); }
function displayPortsView(analysis)  { populatePortsView(analysis); }
function displayReportView(analysis) { populateReportView(analysis); }


// ─── DASHBOARD VIEW ───
function populateDashboardView(analysis) {
  const {riskAssessment, alternativeRoutes, userInput, port, news, weather} = analysis;
  const comp = riskAssessment.components || {};

  // Map subtitle
  const sub = document.getElementById('mapSubtitle');
  if (sub) sub.textContent = `${userInput.origin} → ${userInput.destination} | ACTIVE MONITORING`;

  // Map badges
  const riskBadge = document.getElementById('mapRiskBadge');
  const assetsBadge = document.getElementById('mapAssetsBadge');
  if (riskBadge) {
    riskBadge.style.display='flex';
    document.getElementById('mapRiskBadgeText').textContent =
      riskAssessment.riskLevel === 'HIGH' ? '2 HIGH RISK ZONES' : '1 RISK ZONE DETECTED';
  }
  if (assetsBadge) {
    assetsBadge.style.display='flex';
    document.getElementById('mapAssetsText').textContent = `${Math.floor(Math.random()*10+8)} ASSETS IN TRANSIT`;
  }

  // Score ring
  const score = Math.round(riskAssessment.riskScore);
  const scoreBig = document.getElementById('scoreBig');
  const scoreDesc = document.getElementById('scoreDesc');
  const ring = document.getElementById('scoreRingFill');
  if (scoreBig) scoreBig.textContent = score;
  if (ring) {
    const circumference = 201;
    ring.style.strokeDashoffset = circumference - (circumference * score / 100);
    ring.style.stroke = score>=66?'#ef4444':score>=33?'#f59e0b':'#10b981';
  }
  if (scoreDesc) scoreDesc.textContent = riskAssessment.recommendation || '';

  // Cost card
  const cost = riskAssessment.costAnalysis;
  const costNum = document.getElementById('costBigNumber');
  const costTag = document.getElementById('costStatusTag');
  if (costNum) costNum.textContent = '$' + (cost.totalEstimatedCost||0).toLocaleString();
  if (costTag) {
    costTag.textContent = riskAssessment.riskLevel === 'LOW' ? 'OPTIMIZED' : riskAssessment.riskLevel === 'MEDIUM' ? 'MODERATE' : 'HIGH COST';
  }

  // ESG Carbon Card
  const carbonNum = document.getElementById('carbonBigNumber');
  const esgTag = document.getElementById('esgStatusTag');
  if (carbonNum && analysis.alternativeRoutes && analysis.alternativeRoutes.bestRoute) {
    const mt = analysis.alternativeRoutes.bestRoute.carbonMT || 0;
    carbonNum.textContent = mt.toLocaleString() + ' MT';
    
    // Simple conditional tag logic
    if(esgTag) {
      if(mt < 5000) { esgTag.textContent = "ECO-EFFICIENT"; esgTag.style.color = "var(--success)"; esgTag.style.background = "var(--success-soft)"; }
      else if(mt < 15000) { esgTag.textContent = "STANDARD EMISSIONS"; esgTag.style.color = "#f59e0b"; esgTag.style.background = "rgba(245, 158, 11, 0.1)"; }
      else { esgTag.textContent = "HIGH CARBON IMPACT"; esgTag.style.color = "var(--danger)"; esgTag.style.background = "var(--danger-soft)"; }
    }
  }

  // Delay chart
  buildDelayChart(analysis);

  // Vector bars
  updateVectorBars(comp, port, weather, news, riskAssessment.esg);

  // Event log
  buildEventLog(analysis);

  // Port quick cards
  updatePortQuick(port);

  // Initialize map and draw routes
  initMap1();
  setTimeout(() => {
    drawSeaRoutes(appState.map, appState.routeLayers, userInput, alternativeRoutes);
  }, 200);
}

function updateVectorBars(comp, port, weather, news, esg) {
  const sets = [
    {bar:'congBar', pct:'congPct', tag:'congStatusTag', det:'congDetail', val:comp.congestionRisk||0, pctSuffix:'%',
     extra:`${port?.origin?.name || 'N/A'}: ${port?.origin?.congestion||'N/A'} | ${port?.destination?.name || 'N/A'}: ${port?.destination?.congestion||'N/A'}`},
    {bar:'weatherBar', pct:'weatherPct', tag:'weatherStatusTag', det:'weatherDetail', val:comp.weatherRisk||0, pctSuffix:'%',
     extra: weather?.forecast || (weather?.alerts?.[0]?.alert) || 'Normal conditions'},
    {bar:'newsBar', pct:'newsPct', tag:'newsStatusTag', det:'newsDetail', val:comp.newsRisk||0, pctSuffix:'%',
     extra: news?.articles?.[0]?.headline || 'Monitoring geopolitical signals'},
    {bar:'taxBar', pct:'taxPct', tag:'taxStatusTag', det:'taxDetail', val:comp.taxRisk||0, pctSuffix:'%',
     extra: `Origin tax: ${port?.origin?.tax||'N/A'} | Dest tax: ${port?.destination?.tax||'N/A'}`},
    {bar:'esgBar', pct:'esgPct', tag:'esgStatusTag', det:'esgDetail', 
     val: Math.min((esg?.carbonEmissionsMT || 0) / 100, 100) || 0,
     pctText: `${Math.round(esg?.carbonEmissionsMT || 0)} MT`,
     extra: `Emissions: ${Math.round(esg?.carbonEmissionsMT || 0)} MT | Savings via AI eco-route: ${Math.round(esg?.ecoRouteSavingsMT || 0)} MT`}
  ];

  sets.forEach(s => {
    const bar = document.getElementById(s.bar);
    const pct = document.getElementById(s.pct);
    const tag = document.getElementById(s.tag);
    const det = document.getElementById(s.det);
    const v = Math.round(s.val);
    if (bar) bar.style.width = v+'%';
    if (pct) pct.textContent = s.pctText ? s.pctText : v + (s.pctSuffix||'%');
    if (det) det.textContent = s.extra;
    if (tag) {
      if (s.bar === 'esgBar') {
        const mt = esg?.carbonEmissionsMT || 0;
        tag.className = 'vector-status-tag';
        if(mt <= 3000) { tag.textContent = "ECO-EFFICIENT"; tag.style.color = "var(--success)"; tag.style.background = "var(--success-soft)"; }
        else if(mt <= 4000) { tag.textContent = "STANDARD EMISSIONS"; tag.style.color = "#f59e0b"; tag.style.background = "rgba(245, 158, 11, 0.1)"; }
        else { tag.textContent = "HIGH CARBON IMPACT"; tag.style.color = "var(--danger)"; tag.style.background = "var(--danger-soft)"; }
      } else {
        tag.style.cssText = '';
        if (v >= 66) { tag.textContent='CRITICAL'; tag.className='vector-status-tag'; }
        else if (v >= 33) { tag.textContent='ELEVATED'; tag.className='vector-status-tag warning'; }
        else { tag.textContent='STABLE'; tag.className='vector-status-tag stable'; }
      }
    }
  });
}

function buildEventLog(analysis) {
  const {news, port, weather, riskAssessment, userInput} = analysis;
  const events = [];

  if (news.articles?.length) {
    events.push({ name: news.articles[0].headline, time: new Date(news.articles[0].timestamp).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})+' UTC', type:'danger' });
  }
  if (port.origin?.congestion) {
    events.push({ name: `${port.origin.name} — ${port.origin.congestion} Congestion`, time: new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})+' UTC', type:'warning' });
  }
  if (weather.alerts?.length) {
    events.push({ name: weather.alerts[0].location + ': ' + weather.alerts[0].alert, time: new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})+' UTC', type:'info' });
  }
  events.push({ name: `Analysis complete: ${riskAssessment.riskLevel} risk for ${userInput.origin}→${userInput.destination}`, time: new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})+' UTC', type:'info' });

  const container = document.getElementById('eventLogList');
  if (!container) return;
  container.innerHTML = events.slice(0,4).map(ev => `
    <div class="event-item">
      <div class="event-bar ${ev.type}"></div>
      <div class="event-info">
        <div class="event-name">${ev.name}</div>
        <div class="event-time">${ev.time}</div>
      </div>
    </div>
  `).join('');
}

function buildDelayChart(analysis, futureOffsetDays = 0) {
  const chart = document.getElementById('delayChart');
  if (!chart) return;
  const best = analysis?.alternativeRoutes?.bestRoute || {};
  const dur = best.duration || 14;
  const days = [];
  const now = new Date();
  
  if (futureOffsetDays > 0) {
    now.setDate(now.getDate() + futureOffsetDays);
  }

  const monthNames = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  for (let i = 0; i < 6; i++) {
    const base = dur + (Math.random() * 4 - 2);
    // Add an escalating trend if we are predicting far into the future (simulating holiday spikes etc)
    const futureMultiplier = futureOffsetDays > 0 ? 1 + (futureOffsetDays / 100) : 1;
    
    const stepDate = new Date(now);
    stepDate.setDate(now.getDate() + i);
    days.push({ 
      val: Math.max(1, Math.round(base * futureMultiplier)), 
      date: `${monthNames[stepDate.getMonth()]} ${stepDate.getDate()}` 
    });
  }
  const maxVal = Math.max(...days.map(d=>d.val));
  const peakIdx = days.findIndex(d=>d.val===maxVal);

  chart.innerHTML = days.map((d,i) => `
    <div class="delay-bar-wrap">
      <div class="delay-bar ${i===peakIdx?'peak':''}" style="height:${Math.round((d.val/maxVal)*60)}px"></div>
      <div class="delay-bar-label">${d.date}${i===peakIdx?'<br>(PEAK)':''}</div>
    </div>
  `).join('');
}

window.forecastDelay = function(days) {
  if (!appState.analysis) return showToast('Run analysis first to use predictive ML timeline','warning');
  const context = days === 0 ? "Real-time" : `Predictive (+${days} Days)`;
  showToast(`Simulating timeline: ${context}`, 'info');
  buildDelayChart(appState.analysis, days);
};

function updatePortQuick(port) {
  const oName = document.getElementById('originPortName');
  const dName = document.getElementById('destPortName');
  if (oName) oName.textContent = (PORT_COORDS[port.origin?.name]?.flag||'') + ' ' + (port.origin?.name||'—');
  if (dName) dName.textContent = (PORT_COORDS[port.destination?.name]?.flag||'') + ' ' + (port.destination?.name||'—');

  const portRowsHTML = (p) => `
    <div class="pqc-row"><span>Status</span><span>${p.status||'Operational'}</span></div>
    <div class="pqc-row"><span>Congestion</span><span style="color:${getCongColor(p.congestion)}">${p.congestion||'N/A'}</span></div>
    <div class="pqc-row"><span>Wait</span><span>${((p.waitTime||0)/24).toFixed(1)}d</span></div>
    <div class="pqc-row"><span>Charge</span><span>$${(p.price||0).toLocaleString()}</span></div>
  `;

  const oRows = document.getElementById('originPortRows');
  const dRows = document.getElementById('destPortRows');
  if (oRows) oRows.innerHTML = portRowsHTML(port.origin||{});
  if (dRows) dRows.innerHTML = portRowsHTML(port.destination||{});
}

// ─── RISKS VIEW ───
function populateRisksView(analysis) {
  displayRisksView(analysis);
}

function displayRisksView(analysis) {
  const {riskAssessment, alternativeRoutes, userInput, port, news, weather} = analysis;
  const comp = riskAssessment.components || {};

  // Risk badge
  const badge = document.getElementById('rcBadgeLabel');
  const sub = document.getElementById('rcBadgeSub');
  const desc = document.getElementById('rcDesc');
  if (badge) { badge.textContent = riskAssessment.riskLevel + ' RISK'; badge.className = `risk-badge-label ${riskAssessment.riskLevel}`; }
  if (sub) sub.textContent = `Detected in ${userInput.origin}–${userInput.destination} Route`;
  if (desc) desc.textContent = riskAssessment.recommendation || '';

  // Confidence
  const confPct = document.getElementById('confPct');
  const confCircle = document.getElementById('confCircle');
  const conf = Math.round((riskAssessment.confidence||0.85)*100);
  if (confPct) confPct.textContent = conf+'%';
  if (confCircle) {
    const c = 251;
    confCircle.style.strokeDashoffset = c - (c*conf/100);
    confCircle.style.stroke = riskAssessment.riskLevel==='HIGH'?'#ef4444':riskAssessment.riskLevel==='MEDIUM'?'#f59e0b':'#10b981';
  }

  // Financial
  const cost = riskAssessment.costAnalysis || {};
  const finTag = document.getElementById('finTag');
  const finExp = document.getElementById('finExposure');
  const finRows = document.getElementById('finRows');
  if (finTag) finTag.textContent = `+${Math.round(riskAssessment.riskScore/10)+5}% EST. COST`;
  if (finExp) finExp.textContent = '$' + (cost.totalEstimatedCost||0).toLocaleString() + ' USD';
  if (finRows) finRows.innerHTML = `
    <div class="fin-row"><span>Landed Cost Variance</span><span style="color:var(--danger)">+$${(cost.portCharges||0).toLocaleString()}</span></div>
    <div class="fin-row"><span>Port Charges</span><span>+$${(cost.portCharges||0).toLocaleString()}</span></div>
    <div class="fin-row"><span>Insurance Premium</span><span>+$${(cost.insurance||0).toLocaleString()}</span></div>
    <div class="fin-row"><span>Customs Duty</span><span>+$${(cost.customs||0).toLocaleString()}</span></div>
  `;

  // Strategy
  const strat = document.getElementById('stratTitle');
  const stratDesc = document.getElementById('stratDesc');
  const proposed = document.getElementById('proposedAction');
  const paRoute = document.getElementById('paRoute');
  if (strat) strat.textContent = 'AI-Driven Route Optimization';
  if (stratDesc) stratDesc.textContent = riskAssessment.recommendation || 'AI analysis complete. See key factors below.';
  if (proposed) proposed.style.display='flex';
  if (paRoute) paRoute.textContent = `Via ${alternativeRoutes.bestRoute.name}`;

  // Scenarios
  const allRoutes = [alternativeRoutes.bestRoute, ...alternativeRoutes.alternatives];
  const baseRoute = allRoutes[0];
  const scenBody = document.getElementById('scenariosBody');
  if (scenBody) {
    scenBody.innerHTML = allRoutes.map((r,i) => {
      const delta = i===0 ? '$0' : (r.cost > baseRoute.cost ? `+$${Math.round(r.cost-baseRoute.cost).toLocaleString()}` : `-$${Math.round(baseRoute.cost-r.cost).toLocaleString()}`);
      const rScore = (r.riskScore||0)*100;
      const rLevel = rScore>=66?'critical':rScore>=33?'med':'low';
      return `
        <div class="sc-row">
          <div><div class="sc-name">${i===0?'⭐ ':''} ${r.name}</div><div class="sc-sub">${r.pros||''}</div></div>
          <div class="sc-cost-delta ${i===0?'neutral':''}">${delta}</div>
          <div class="sc-lead">${r.duration} Days</div>
          <div><span class="sc-rating ${rLevel}">${rLevel.toUpperCase()}</span></div>
          <div><button class="sc-action-btn" onclick="selectScenario(${i})">SELECT</button></div>
        </div>
      `;
    }).join('');
  }

  // News feed
  const newsFeed = document.getElementById('newsRiskDetails');
  if (newsFeed) {
    const articles = news.articles || [];
    newsFeed.innerHTML = articles.length ? articles.slice(0,4).map(a => `
      <div class="news-item">
        <div class="news-headline">${a.headline}</div>
        <div class="news-meta">${a.source} • ${new Date(a.timestamp).toLocaleDateString()} • Score: ${Math.round((a.riskScore||0)*100)}%</div>
      </div>
    `).join('') : '<div class="news-placeholder">No news signals detected</div>';
  }

  // Weather
  const weatherFeed = document.getElementById('weatherRiskDetails');
  if (weatherFeed) {
    const alerts = weather.alerts || [];
    const ow = weather.originWeather || {};
    const dw = weather.destinationWeather || {};
    const oName = analysis.userInput?.origin || 'Origin';
    const dName = analysis.userInput?.destination || 'Destination';

    weatherFeed.innerHTML = `
      <div style="display:flex; gap:16px; margin-bottom:12px;">
        <div style="flex:1; background:#1c2333; padding:16px; border-radius:8px; border:1px solid var(--border);">
          <div style="font-size:0.75rem; color:#8b949e; text-transform:uppercase; letter-spacing:1px;">⬇️ Export Point</div>
          <div style="font-weight:600; font-size:1.2rem; color:#e6edf3; margin-top:4px;">${oName}</div>
          <div style="margin-top:12px; display:flex; justify-content:space-between; align-items:center;">
             <span style="font-size:1.6rem; font-weight:700;">${ow.temp !== undefined ? ow.temp+'°C' : '--'}</span>
             <span style="color:var(--primary); font-weight:500;">${ow.condition||'Clear'}</span>
          </div>
        </div>
        <div style="flex:1; background:#1c2333; padding:16px; border-radius:8px; border:1px solid var(--border);">
          <div style="font-size:0.75rem; color:#8b949e; text-transform:uppercase; letter-spacing:1px;">⬆️ Import Point</div>
          <div style="font-weight:600; font-size:1.2rem; color:#e6edf3; margin-top:4px;">${dName}</div>
          <div style="margin-top:12px; display:flex; justify-content:space-between; align-items:center;">
             <span style="font-size:1.6rem; font-weight:700;">${dw.temp !== undefined ? dw.temp+'°C' : '--'}</span>
             <span style="color:var(--primary); font-weight:500;">${dw.condition||'Clear'}</span>
          </div>
        </div>
      </div>
      <div class="fin-row" style="padding:12px 0; border-bottom:1px solid var(--border); font-size:0.9rem;">
        <span>Forecast System</span><span style="color:#a5b4fc;">${weather.forecast||'Tracking normal route vectors'}</span>
      </div>
      <div style="margin-top:12px;">
        ${alerts.length ? alerts.map(a => `
          <div class="weather-alert-item" style="padding:12px; background:rgba(239, 68, 68, 0.05); border-left:4px solid ${a.severity>1?'#ef4444':'#f59e0b'}; margin-bottom:8px; border-radius:4px;">
            <span style="color:${a.severity>1?'#ef4444':'#f59e0b'}; font-size:0.8rem; font-weight:bold; letter-spacing:1px;">⚠️ SEV ${a.severity}/3</span>
            <div style="margin-top:8px; font-size:0.95rem; color:#e6edf3;"><strong>${a.location}</strong>: ${a.alert}</div>
          </div>
        `).join('') : '<div class="news-placeholder" style="padding:12px 0; color:#10b981; font-weight:500;">✅ No severe meteorological hazards detected across primary global route.</div>'}
      </div>
    `;
  }
}

// ─── ROUTES VIEW ───
function populateRoutesView(analysis) {
  const {alternativeRoutes, userInput} = analysis;
  const allRoutes = [alternativeRoutes.bestRoute, ...alternativeRoutes.alternatives];

  const container = document.getElementById('routesContainer');
  if (container) {
    container.innerHTML = allRoutes.map((r,i) => {
      const isRec = i===0;
      const rPct = Math.round((r.riskScore||0)*100);
      return `
        <div class="route-card ${isRec?'recommended':''}" onclick="highlightRoute2(${i})">
          <div class="rc-header">
            <span class="rc-name">${isRec?'⭐ ':''} ${r.name}</span>
            <span class="rc-badge ${isRec?'recommended':'alt'}">${isRec?'RECOMMENDED':'ALTERNATIVE'}</span>
          </div>
          <div class="rc-stats">
            <div class="rc-stat"><span class="rc-stat-label">DISTANCE</span><span class="rc-stat-value">${r.distance}nm</span></div>
            <div class="rc-stat"><span class="rc-stat-label">DURATION</span><span class="rc-stat-value">${r.duration}d</span></div>
            <div class="rc-stat"><span class="rc-stat-label">COST</span><span class="rc-stat-value">$${Number(r.cost).toLocaleString()}</span></div>
            <div class="rc-stat"><span class="rc-stat-label">RISK</span><span class="rc-stat-value" style="color:${rPct>=66?'#ef4444':rPct>=33?'#f59e0b':'#10b981'}">${rPct}%</span></div>
            <div class="rc-stat"><span class="rc-stat-label">EFF.</span><span class="rc-stat-value">${(r.efficiencyScore||0).toFixed(0)}%</span></div>
          </div>
          <div class="rc-pros-cons">
            <div class="rc-pros"><strong>✓ Pros</strong><p>${r.pros||'Efficient route'}</p></div>
            <div class="rc-cons"><strong>✗ Cons</strong><p>${r.cons||'Standard risks apply'}</p></div>
          </div>
          ${r.breakdownByLeg?.length ? `
            <div class="rc-segments">
              <div class="rc-segments-title">ROUTE SEGMENTS</div>
              ${r.breakdownByLeg.map(l=>`<div class="rc-seg">${l.segment} — ${l.eta}</div>`).join('')}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  }
}

// ─── PORTS VIEW ───
function populatePortsView(analysis) {
  const {port} = analysis;

  const oTitle = document.getElementById('originPortTitle');
  const dTitle = document.getElementById('destPortTitle');
  if (oTitle) oTitle.textContent = `⚓ ${port.origin?.name||'Origin Port'}`;
  if (dTitle) dTitle.textContent = `⚓ ${port.destination?.name||'Destination Port'}`;

  const portFullHTML = (p) => {
    const info = PORT_COORDS[p.name] || {};
    return `
      <div class="port-detail-item"><label>Status</label><span>${p.status||'Operational'}</span></div>
      <div class="port-detail-item"><label>Country</label><span>${info.flag||''} ${info.country||'International'}</span></div>
      <div class="port-detail-item"><label>Congestion</label><span class="${getCongClass(p.congestion)}">${p.congestion||'N/A'}</span></div>
      <div class="port-detail-item"><label>Wait Time</label><span>${((p.waitTime||0)/24).toFixed(1)} days</span></div>
      <div class="port-detail-item"><label>Capacity</label><span>${p.capacity||'High'}</span></div>
      <div class="port-detail-item"><label>Port Charge</label><span>$${(p.price||0).toLocaleString()}</span></div>
      <div class="port-detail-item"><label>Customs</label><span>${p.customs||'Standard clearance'}</span></div>
      <div class="port-detail-item"><label>Tax Rate</label><span>${p.tax||'N/A'}</span></div>
      <div class="port-detail-item"><label>Timezone</label><span>${info.timezone||'N/A'}</span></div>
      <div class="port-detail-item"><label>Phone</label><span>${info.phone||'N/A'}</span></div>
      <div class="port-detail-item"><label>Email</label><span>${info.email||'N/A'}</span></div>
      <div class="port-detail-item"><label>Coordinates</label><span>${info.lat?.toFixed(3)||'N/A'}°, ${info.lng?.toFixed(3)||'N/A'}°</span></div>
    `;
  };

  const oFull = document.getElementById('originPortFull');
  const dFull = document.getElementById('destPortFull');
  if (oFull) oFull.innerHTML = portFullHTML(port.origin||{}) + portActionsHTML(port.origin?.name);
  if (dFull) dFull.innerHTML = portFullHTML(port.destination||{}) + portActionsHTML(port.destination?.name);
}

function portActionsHTML(portName) {
  return `
    <div class="port-actions-row">
      <button class="port-action-btn" onclick="openPortContactModal('${portName||''}')">
        <span class="material-icons-round">call</span> Contact Port
      </button>
      <button class="port-action-btn" onclick="copyPortInfo('${portName||''}')">
        <span class="material-icons-round">content_copy</span> Copy Info
      </button>
    </div>
  `;
}

// ─── REPORT VIEW ───
function populateReportView(analysis) {
  const {riskAssessment, alternativeRoutes, userInput, port} = analysis;
  const cost = riskAssessment.costAnalysis || {};
  const best = alternativeRoutes.bestRoute;

  document.getElementById('reportContainer').innerHTML = `
    <div class="report-section">
      <div class="report-section-title"><span class="material-icons-round">summarize</span> Executive Summary</div>
      <div class="report-row"><span class="rl">Route</span><span class="rv">${userInput.origin} → ${userInput.destination}</span></div>
      <div class="report-row"><span class="rl">Product</span><span class="rv">${userInput.product} (${userInput.shipmentType})</span></div>
      <div class="report-row"><span class="rl">Risk Level</span><span class="rv" style="color:${riskAssessment.riskLevel==='HIGH'?'#ef4444':riskAssessment.riskLevel==='MEDIUM'?'#f59e0b':'#10b981'}">${riskAssessment.riskLevel}</span></div>
      <div class="report-row"><span class="rl">Risk Score</span><span class="rv big">${riskAssessment.riskScore}%</span></div>
      <div class="report-row"><span class="rl">AI Confidence</span><span class="rv">${Math.round((riskAssessment.confidence||0.85)*100)}%</span></div>
      <div class="report-row"><span class="rl">Analysis Date</span><span class="rv">${new Date().toLocaleString()}</span></div>
    </div>

    <div class="report-section">
      <div class="report-section-title"><span class="material-icons-round">payments</span> Cost Breakdown</div>
      <div class="report-row"><span class="rl">Base Shipping</span><span class="rv">$${(cost.baseShipping||0).toLocaleString()}</span></div>
      <div class="report-row"><span class="rl">Port Charges</span><span class="rv">$${(cost.portCharges||0).toLocaleString()}</span></div>
      <div class="report-row"><span class="rl">Fuel Surcharge</span><span class="rv">$${(cost.fuelSurcharge||0).toLocaleString()}</span></div>
      <div class="report-row"><span class="rl">Insurance</span><span class="rv">$${(cost.insurance||0).toLocaleString()}</span></div>
      <div class="report-row"><span class="rl">Customs & Duty</span><span class="rv">$${(cost.customs||0).toLocaleString()}</span></div>
      <div class="report-row"><span class="rl">Total Estimated</span><span class="rv big">$${(cost.totalEstimatedCost||0).toLocaleString()}</span></div>
    </div>

    <div class="report-section">
      <div class="report-section-title"><span class="material-icons-round">alt_route</span> Recommended Route</div>
      <div class="report-row"><span class="rl">Route</span><span class="rv">${best.name}</span></div>
      <div class="report-row"><span class="rl">Distance</span><span class="rv">${best.distance} nautical miles</span></div>
      <div class="report-row"><span class="rl">Duration</span><span class="rv">${best.duration} days</span></div>
      <div class="report-row"><span class="rl">Route Cost</span><span class="rv">$${Number(best.cost).toLocaleString()}</span></div>
      <div class="report-row"><span class="rl">Efficiency</span><span class="rv">${(best.efficiencyScore||0).toFixed(0)}%</span></div>
    </div>

    <div class="report-section">
      <div class="report-section-title"><span class="material-icons-round">anchor</span> Port Information</div>
      <div class="report-row"><span class="rl">Origin</span><span class="rv">${port.origin?.name} — ${port.origin?.status||'Operational'}</span></div>
      <div class="report-row"><span class="rl">Origin Congestion</span><span class="rv">${port.origin?.congestion||'N/A'}</span></div>
      <div class="report-row"><span class="rl">Origin Wait</span><span class="rv">${((port.origin?.waitTime||0)/24).toFixed(1)} days</span></div>
      <div class="report-row"><span class="rl">Destination</span><span class="rv">${port.destination?.name} — ${port.destination?.status||'Operational'}</span></div>
      <div class="report-row"><span class="rl">Dest Congestion</span><span class="rv">${port.destination?.congestion||'N/A'}</span></div>
      <div class="report-row"><span class="rl">Dest Wait</span><span class="rv">${((port.destination?.waitTime||0)/24).toFixed(1)} days</span></div>
    </div>

    <div class="report-section">
      <div class="report-section-title"><span class="material-icons-round">risk_analysis</span> Risk Breakdown</div>
      <div class="report-row"><span class="rl">News / Geopolitical (35%)</span><span class="rv">${(riskAssessment.components?.newsRisk||0).toFixed(1)}%</span></div>
      <div class="report-row"><span class="rl">Weather (30%)</span><span class="rv">${(riskAssessment.components?.weatherRisk||0).toFixed(1)}%</span></div>
      <div class="report-row"><span class="rl">Port Congestion (25%)</span><span class="rv">${(riskAssessment.components?.congestionRisk||0).toFixed(1)}%</span></div>
      <div class="report-row"><span class="rl">Tax & Customs (10%)</span><span class="rv">${(riskAssessment.components?.taxRisk||0).toFixed(1)}%</span></div>
      <div class="report-row"><span class="rl">Composite Score</span><span class="rv big">${riskAssessment.riskScore}%</span></div>
    </div>

    <div class="report-section">
      <div class="report-section-title"><span class="material-icons-round">lightbulb</span> AI Key Factors</div>
      ${riskAssessment.keyFactors.map(f => `
        <div class="report-row"><span class="rl">•</span><span class="rv" style="text-align:left;flex:1;margin-left:10px;">${f}</span></div>
      `).join('')}
    </div>
  `;
}

// ─── MAP FUNCTIONS ───
function initMap1() {
  if (appState.map) { clearLayers(appState.map, appState.routeLayers); appState.routeLayers=[]; return; }
  const el = document.getElementById('map');
  if (!el) return;
  appState.map = L.map('map', { center:[25,40], zoom:2, zoomControl:true, attributionControl:false });
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom:19 }).addTo(appState.map);
}

function initMap2() {
  if (appState.map2) { clearLayers(appState.map2, appState.routeLayers2); appState.routeLayers2=[]; return; }
  const el = document.getElementById('map2');
  if (!el) return;
  appState.map2 = L.map('map2', { center:[25,40], zoom:2, zoomControl:true, attributionControl:false });
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom:19 }).addTo(appState.map2);
}

function clearLayers(map, layers) {
  layers.forEach(l => { if (map.hasLayer(l)) map.removeLayer(l); });
  layers.length = 0;
}

async function drawSeaRoutes(map, layersRef, userInput, alternativeRoutes) {
  if (!map || !userInput) return;
  clearLayers(map, layersRef);

  const {origin, destination} = userInput;
  const oCoords = PORT_COORDS[origin];
  const dCoords = PORT_COORDS[destination];
  if (!oCoords || !dCoords) return;

  const allRoutes = [alternativeRoutes.bestRoute, ...alternativeRoutes.alternatives];
  const colors = ['#6366f1','#f59e0b','#ec4899'];
  
  let waypts = [];
  try {
    const res = await fetch(`${BASE_URL}/searoute?srcLat=${oCoords.lat}&srcLng=${oCoords.lng}&destLat=${dCoords.lat}&destLng=${dCoords.lng}`);
    if(res.ok) {
      const geojson = await res.json();
      if(geojson && geojson.geometry && geojson.geometry.coordinates) {
        waypts = geojson.geometry.coordinates.map(c => [c[1], c[0]]);
      }
    }
  } catch(e) { console.error('SeaRoute API failed', e); }
  
  // fallback to getWaypoints 
  if (!waypts || !waypts.length) {
    waypts = getWaypoints(origin, destination);
  }

  allRoutes.forEach((route, i) => {
    const pts = i===0 ? waypts : addJitter(waypts, i);
    const line = L.polyline(pts, {
      color: colors[i]||'#64748b',
      weight: i===0?3.5:2,
      opacity: i===0?0.95:0.5,
      dashArray: i>0?'8,8':null,
      smoothFactor:2
    }).addTo(map);
    line.bindPopup(`<strong style="color:#a5b4fc;">${route.name}</strong><br/><span style="color:#94a3b8;font-size:0.85em;">${route.distance}nm · ${route.duration}d · $${Number(route.cost).toLocaleString()}</span>`);
    layersRef.push(line);
  });

  // Markers
  addPortMarker(map, layersRef, oCoords, origin, 'origin');
  addPortMarker(map, layersRef, dCoords, destination, 'dest');

  // Fit
  try {
    const g = L.featureGroup(layersRef);
    map.fitBounds(g.getBounds().pad(0.15));
  } catch { map.setView([25,40],2); }
}

function addJitter(waypts, seed) {
  return waypts.map(([lat,lng]) => [lat + (Math.random()-0.5)*seed*3, lng]);
}

function addPortMarker(map, layersRef, coords, name, type) {
  const info = PORT_COORDS[name] || {};
  const color = type==='origin'?'#10b981':'#ef4444';
  const icon = L.divIcon({
    html:`<div style="width:16px;height:16px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 0 10px ${color},0 0 20px ${color}40;"></div>`,
    iconSize:[16,16], iconAnchor:[8,8], className:''
  });
  const marker = L.marker([coords.lat,coords.lng],{icon}).addTo(map);
  marker.bindPopup(`
    <div style="font-family:Inter,sans-serif;min-width:160px;padding:4px;">
      <div style="font-weight:700;color:#e2e8f0;margin-bottom:6px;">${info.flag||''} ${name}</div>
      <div style="font-size:0.8em;color:#94a3b8;display:grid;gap:3px;">
        <div>🌍 ${info.country||'International'}</div>
        <div>🕐 ${info.timezone||'UTC'}</div>
        <div>📞 ${info.phone||'N/A'}</div>
        <div>📧 ${info.email||'N/A'}</div>
        <div style="margin-top:5px;color:${color};font-weight:700;">
          ${type==='origin'?'🟢 ORIGIN PORT':'🔴 DESTINATION PORT'}
        </div>
      </div>
    </div>
  `);
  layersRef.push(marker);
}

function highlightRoute2(idx) {
  appState.routeLayers2.forEach((l,i) => {
    if (l.setStyle) l.setStyle({weight:i===idx?5:i===0?3.5:2, opacity:i===idx?1:i===0?0.95:0.5});
  });
  showToast(`Route ${idx+1} highlighted`, 'info');
}

// ─── QUICK ROUTE ───
function setQuickRoute(o, d, p, t) {
  document.getElementById('origin').value = o;
  document.getElementById('destination').value = d;
  document.getElementById('product').value = p;
  document.getElementById('shipmentType').value = t;
  showToast(`Route set: ${o} → ${d}`, 'success');
}

// ─── SCENARIO SELECT ───
function selectScenario(i) {
  const routes = appState.analysis?.alternativeRoutes;
  if (!routes) return;
  const allRoutes = [routes.bestRoute, ...routes.alternatives];
  const r = allRoutes[i];
  showToast(`Selected: ${r.name} ($${Number(r.cost).toLocaleString()}, ${r.duration} days)`, 'success');
  openModal(`✅ Scenario Selected: ${r.name}`, `
    <div class="fin-rows" style="margin-bottom:14px;">
      <div class="fin-row"><span>Route</span><span>${r.name}</span></div>
      <div class="fin-row"><span>Distance</span><span>${r.distance} nm</span></div>
      <div class="fin-row"><span>Duration</span><span>${r.duration} days</span></div>
      <div class="fin-row"><span>Cost</span><span>$${Number(r.cost).toLocaleString()}</span></div>
      <div class="fin-row"><span>Risk Score</span><span>${Math.round((r.riskScore||0)*100)}%</span></div>
      <div class="fin-row"><span>Efficiency</span><span>${(r.efficiencyScore||0).toFixed(0)}%</span></div>
    </div>
    <p style="color:var(--text3);font-size:0.83em;">Pros: ${r.pros||'N/A'}</p>
    <p style="color:var(--text3);font-size:0.83em;margin-top:4px;">Cons: ${r.cons||'N/A'}</p>
  `);
}

// ─── NAV BUTTONS ───
function setupNavButtons() {
  document.getElementById('historyBtn')?.addEventListener('click', openHistoryModal);
  document.getElementById('settingsBtn')?.addEventListener('click', openSettingsModal);
  document.getElementById('triggerMitigationBtn')?.addEventListener('click', () => {
    if (!appState.analysis) return showToast('Run analysis first','warning');
    openMitigationModal(appState.analysis);
  });
  document.getElementById('archiveBtn')?.addEventListener('click', openHistoryModal);
  document.getElementById('alertAckBtn')?.addEventListener('click', () => {
    document.getElementById('alertBanner').style.display='none';
    showToast('Alert acknowledged','success');
  });
  document.getElementById('alertCloseBtn')?.addEventListener('click', () => {
    document.getElementById('alertBanner').style.display='none';
  });
}

// ─── RESULTS BUTTONS ───
function setupResultsButtons() {
  // Map panel buttons
  document.getElementById('routesFitBtn')?.addEventListener('click', () => {
    fitMap(appState.map, appState.routeLayers);
    showToast('Map fitted');
  });
  document.getElementById('routesRefreshBtn')?.addEventListener('click', () => {
    if (!appState.analysis) return showToast('No analysis', 'warning');
    drawSeaRoutes(appState.map, appState.routeLayers, appState.analysis.userInput, appState.analysis.alternativeRoutes);
    showToast('Map refreshed', 'success');
  });
  document.getElementById('compareRoutesBtn')?.addEventListener('click', () => {
    if (!appState.analysis) return showToast('Run analysis first','warning');
    openCompareRoutesModal(appState.analysis.alternativeRoutes);
  });
  document.getElementById('routesDownloadBtn')?.addEventListener('click', openSaveMapModal);

  // Routes view duplicate buttons
  document.getElementById('compareRoutesBtn2')?.addEventListener('click', () => {
    if (!appState.analysis) return showToast('Run analysis first','warning');
    openCompareRoutesModal(appState.analysis.alternativeRoutes);
  });
  document.getElementById('routesDownloadBtn2')?.addEventListener('click', openSaveMapModal);
  document.getElementById('routesFitBtn')?.addEventListener('click', ()=>{
    fitMap(appState.map2, appState.routeLayers2);
    fitMap(appState.map, appState.routeLayers);
  });

  // Risk vector "details" buttons
  document.getElementById('congestionDetailsBtn')?.addEventListener('click', () => {
    if (!appState.analysis) return showToast('Run analysis first','warning');
    openCongestionModal(appState.analysis);
  });
  document.getElementById('weatherDetailsBtn')?.addEventListener('click', () => {
    if (!appState.analysis) return showToast('Run analysis first','warning');
    openWeatherModal(appState.analysis);
  });
  document.getElementById('newsDetailsBtn')?.addEventListener('click', () => {
    if (!appState.analysis) return showToast('Run analysis first','warning');
    openNewsModal(appState.analysis);
  });
  document.getElementById('portsCompareBtn')?.addEventListener('click', () => {
    if (!appState.analysis) return showToast('Run analysis first','warning');
    openComparePortsModal(appState.analysis);
  });

  // Port intel
  document.getElementById('portsRefreshBtn')?.addEventListener('click', () => {
    if (!appState.analysis) return;
    updatePortQuick(appState.analysis.port);
    showToast('Port data refreshed','success');
  });
  document.getElementById('originPortContactBtn')?.addEventListener('click', () => {
    if (appState.analysis) openPortContactModal(appState.analysis.port.origin.name);
  });
  document.getElementById('destPortContactBtn')?.addEventListener('click', () => {
    if (appState.analysis) openPortContactModal(appState.analysis.port.destination.name);
  });

  // Risks refresh
  document.getElementById('risksRefreshBtn')?.addEventListener('click', () => {
    if (!appState.analysis) return showToast('No analysis','warning');
    displayRisksView(appState.analysis);
    showToast('Risk data refreshed','success');
  });

  // Risk vector buttons
  document.getElementById('viewMitigationBtn')?.addEventListener('click', () => {
    if (!appState.analysis) return showToast('Run analysis first','warning');
    openMitigationModal(appState.analysis);
  });
  document.getElementById('auditSourceBtn')?.addEventListener('click', () => {
    if (!appState.analysis) return showToast('Run analysis first','warning');
    openAuditModal(appState.analysis);
  });

  // Ports view
  document.getElementById('portsCompareBtn2')?.addEventListener('click', () => {
    if (!appState.analysis) return showToast('Run analysis first','warning');
    openComparePortsModal(appState.analysis);
  });
  document.getElementById('portsContactBtn2')?.addEventListener('click', () => {
    if (!appState.analysis) return showToast('Run analysis first','warning');
    openAllContactsModal(appState.analysis);
  });

  // Report view
  document.getElementById('downloadPdfBtn')?.addEventListener('click', () => { window.print(); showToast('Opening print dialog...','info'); });
  document.getElementById('downloadReportBtn')?.addEventListener('click', () => {
    if (!appState.analysis) return showToast('No analysis','warning');
    exportCSV(appState.analysis);
  });
  document.getElementById('printReportBtn')?.addEventListener('click', () => { window.print(); showToast('Printing...','info'); });
  document.getElementById('emailReportBtn')?.addEventListener('click', () => {
    if (!appState.analysis) return showToast('No analysis','warning');
    emailReport(appState.analysis);
  });
  document.getElementById('copyReportBtn')?.addEventListener('click', () => {
    if (!appState.analysis) return showToast('No report','warning');
    const t = buildReportText(appState.analysis);
    navigator.clipboard.writeText(t).then(()=>showToast('Copied!','success')).catch(()=>showToast('Copy failed','error'));
  });

  // Export risks
  document.getElementById('exportRisksBtn')?.addEventListener('click', () => {
    if (!appState.analysis) return showToast('No analysis','warning');
    exportRisksTxt(appState.analysis);
  });
}

// ─── FOOTER BUTTONS ───
function setupFooterButtons() {
  document.getElementById('supportBtn')?.addEventListener('click', () => {
    openModal('🆘 Help & Support', `
      <div class="contact-list">
        <div class="contact-item"><div class="contact-icon-box"><span class="material-icons-round">info</span></div><div><div class="contact-label">Version</div><div class="contact-value">Nexus Supply Chain Risk Analyzer v2.0 Pro</div></div></div>
        <div class="contact-item"><div class="contact-icon-box"><span class="material-icons-round">smart_toy</span></div><div><div class="contact-label">AI System</div><div class="contact-value">6 specialized agents (News, Weather, Port, Risk, Route, Report)</div></div></div>
        <div class="contact-item"><div class="contact-icon-box"><span class="material-icons-round">code</span></div><div><div class="contact-label">Stack</div><div class="contact-value">HTML5 · CSS3 · Vanilla JS · Leaflet.js · Node.js · Express</div></div></div>
        <div class="contact-item"><div class="contact-icon-box"><span class="material-icons-round">bug_report</span></div><div><div class="contact-label">Common Issue</div><div class="contact-value">Ensure backend server is running on port 5000</div></div></div>
      </div>
    `);
  });
}

// ─── MODALS ───
function openModal(title, html) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').innerHTML = html;
  document.getElementById('modalOverlay').className = 'modal-overlay open';
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  document.getElementById('modalOverlay').className = 'modal-overlay';
  document.body.style.overflow = '';
}
document.getElementById('modalOverlay')?.addEventListener('click', function(e) {
  if (e.target===this) closeModal();
});
document.addEventListener('keydown', e => { if(e.key==='Escape') closeModal(); });

function openHistoryModal() {
  if (!appState.history.length) {
    return openModal('📋 History', `<div style="text-align:center;padding:40px;color:var(--text3);"><span class="material-icons-round" style="font-size:40px;display:block;margin-bottom:10px;">history</span>No analyses yet.</div>`);
  }
  const items = appState.history.slice().reverse().slice(0,15).map((h,i) => `
    <div class="history-entry" onclick="loadHistory(${appState.history.length-1-i}); closeModal();">
      <div class="h-route">${h.origin} → ${h.destination}</div>
      <div class="h-meta">
        <span>📦 ${h.product}</span>
        <span>${h.shipmentType}</span>
        <span style="color:${h.riskLevel==='HIGH'?'#ef4444':h.riskLevel==='MEDIUM'?'#f59e0b':'#10b981'}">⬤ ${h.riskLevel} (${h.riskScore}%)</span>
        <span>$${(h.totalCost||0).toLocaleString()}</span>
        <span>🕐 ${new Date(h.timestamp).toLocaleDateString()}</span>
      </div>
    </div>
  `).join('');
  openModal('📋 Analysis History', `
    <p style="color:var(--text3);font-size:0.82em;margin-bottom:12px;">Click an entry to reload it.</p>
    ${items}
    <div class="modal-btns" style="margin-top:12px;">
      <button onclick="clearHistory()" class="modal-btn"><span class="material-icons-round">delete_sweep</span> Clear History</button>
    </div>
  `);
}

function loadHistory(i) {
  const h = appState.history[i];
  if (!h) return;
  document.getElementById('origin').value = h.origin;
  document.getElementById('destination').value = h.destination;
  document.getElementById('product').value = h.product;
  document.getElementById('shipmentType').value = h.shipmentType;
  showToast(`Loaded: ${h.origin} → ${h.destination}`,'info');
}

function clearHistory() {
  appState.history = [];
  localStorage.removeItem('analysisHistory');
  closeModal();
  updateHistoryBadge();
  showToast('History cleared','success');
}

function saveToHistory(analysis) {
  const e = {
    origin:analysis.userInput.origin,
    destination:analysis.userInput.destination,
    product:analysis.userInput.product,
    shipmentType:analysis.userInput.shipmentType,
    riskLevel:analysis.riskAssessment.riskLevel,
    riskScore:analysis.riskAssessment.riskScore,
    totalCost:analysis.riskAssessment.costAnalysis?.totalEstimatedCost||0,
    timestamp:new Date().toISOString()
  };
  appState.history.push(e);
  if (appState.history.length>20) appState.history.shift();
  localStorage.setItem('analysisHistory', JSON.stringify(appState.history));
}

function openSettingsModal() {
  const s = appState.settings;
  openModal('⚙️ Settings', `
    <div class="settings-section">
      <div class="settings-section-title">Analysis</div>
      <div class="setting-row">
        <div><div class="setting-label">Toast Notifications</div><div class="setting-desc">Show popup alerts for actions</div></div>
        <div class="toggle ${s.notifications?'on':''}" onclick="toggleSetting('notifications',this)"></div>
      </div>
      <div class="setting-row">
        <div><div class="setting-label">Risk Threshold</div><div class="setting-desc">Alert when risk exceeds this</div></div>
        <div style="display:flex;align-items:center;gap:8px;">
          <input type="range" min="20" max="90" value="${s.riskThreshold}" 
            oninput="updateSlider('riskThreshold',this.value,'rThreshVal')"
            style="width:80px;accent-color:var(--primary);">
          <span id="rThreshVal" style="color:#a5b4fc;font-size:0.82em;min-width:30px;">${s.riskThreshold}%</span>
        </div>
      </div>
    </div>
    <div class="settings-section">
      <div class="settings-section-title">System</div>
      <div class="setting-row">
        <div><div class="setting-label">API Endpoint</div></div>
        <code style="color:#a5b4fc;font-size:0.8em;background:var(--surface3);padding:4px 8px;border-radius:4px;">${BASE_URL}</code>
      </div>
      <div class="setting-row">
        <div><div class="setting-label">Total Analyses Run</div></div>
        <span style="color:var(--primary);font-weight:700;">${appState.analysisCount}</span>
      </div>
    </div>
    <div class="modal-btns">
      <button onclick="resetSettings()" class="modal-btn"><span class="material-icons-round">restore</span> Reset Defaults</button>
    </div>
  `);
}

function toggleSetting(key, el) {
  el.classList.toggle('on');
  appState.settings[key] = el.classList.contains('on');
  localStorage.setItem('userSettings', JSON.stringify(appState.settings));
}
function updateSlider(key, val, id) {
  appState.settings[key] = parseInt(val);
  const el = document.getElementById(id);
  if (el) el.textContent = val+'%';
  localStorage.setItem('userSettings', JSON.stringify(appState.settings));
}
function resetSettings() {
  appState.settings = {defaultCurrency:'USD',autoRefresh:false,notifications:true,riskThreshold:60};
  localStorage.setItem('userSettings', JSON.stringify(appState.settings));
  closeModal();
  showToast('Settings reset','success');
}

function openCompareRoutesModal(alternativeRoutes) {
  const all = [alternativeRoutes.bestRoute, ...alternativeRoutes.alternatives];
  const headers = ['Metric', ...all.map((r,i) => i===0?`⭐ ${r.name}`:r.name)];
  const rows = [
    ['Distance (nm)', ...all.map(r=>r.distance)],
    ['Duration (days)', ...all.map(r=>r.duration)],
    ['Cost', ...all.map(r=>'$'+Number(r.cost).toLocaleString())],
    ['Risk Score', ...all.map(r=>Math.round((r.riskScore||0)*100)+'%')],
    ['Efficiency', ...all.map(r=>(r.efficiencyScore||0).toFixed(0)+'%')],
    ['Pros', ...all.map(r=>r.pros||'N/A')],
    ['Cons', ...all.map(r=>r.cons||'N/A')]
  ];
  openModal('🔀 Route Comparison', `
    <div style="overflow-x:auto;">
      <table class="mtable">
        <thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead>
        <tbody>${rows.map(row=>`<tr>${row.map((c,j)=>`<td style="${j===0?'color:var(--text3);font-weight:600;white-space:nowrap;':''}">${c}</td>`).join('')}</tr>`).join('')}</tbody>
      </table>
    </div>
  `);
}

function openComparePortsModal(analysis) {
  const {port} = analysis;
  const rows = [
    ['Name', port.origin.name, port.destination.name],
    ['Country', PORT_COORDS[port.origin.name]?.country||'N/A', PORT_COORDS[port.destination.name]?.country||'N/A'],
    ['Status', port.origin.status, port.destination.status],
    ['Congestion', port.origin.congestion, port.destination.congestion],
    ['Wait Time', `${((port.origin.waitTime||0)/24).toFixed(1)} days`, `${((port.destination.waitTime||0)/24).toFixed(1)} days`],
    ['Port Charge', `$${port.origin.price||0}`, `$${port.destination.price||0}`],
    ['Tax Rate', port.origin.tax||'N/A', port.destination.tax||'N/A'],
    ['Customs', port.origin.customs||'Standard', port.destination.customs||'Standard'],
    ['Timezone', PORT_COORDS[port.origin.name]?.timezone||'N/A', PORT_COORDS[port.destination.name]?.timezone||'N/A']
  ];
  openModal('⚓ Port Side-by-Side', `
    <table class="mtable">
      <thead><tr><th>Attribute</th><th>🟢 Origin</th><th>🔴 Destination</th></tr></thead>
      <tbody>${rows.map(r=>`<tr>${r.map((c,i)=>`<td style="${i===0?'color:var(--text3);font-weight:600;':''}">${c}</td>`).join('')}</tr>`).join('')}</tbody>
    </table>
  `);
}

function openPortContactModal(portName) {
  const info = PORT_COORDS[portName];
  if (!info) return showToast('No contact info','warning');
  openModal(`📞 ${portName} Contact`, `
    <div class="contact-list">
      <div class="contact-item"><div class="contact-icon-box"><span class="material-icons-round">public</span></div><div><div class="contact-label">Port</div><div class="contact-value">${info.flag} ${portName}</div></div></div>
      <div class="contact-item"><div class="contact-icon-box"><span class="material-icons-round">flag</span></div><div><div class="contact-label">Country</div><div class="contact-value">${info.country}</div></div></div>
      <div class="contact-item"><div class="contact-icon-box"><span class="material-icons-round">schedule</span></div><div><div class="contact-label">Timezone</div><div class="contact-value">${info.timezone}</div></div></div>
      <div class="contact-item"><div class="contact-icon-box"><span class="material-icons-round">call</span></div><div><div class="contact-label">Phone</div><div class="contact-value">${info.phone}</div></div></div>
      <div class="contact-item"><div class="contact-icon-box"><span class="material-icons-round">email</span></div><div><div class="contact-label">Email</div><div class="contact-value">${info.email}</div></div></div>
      <div class="contact-item"><div class="contact-icon-box"><span class="material-icons-round">location_on</span></div><div><div class="contact-label">Coordinates</div><div class="contact-value">${info.lat.toFixed(4)}°N, ${info.lng.toFixed(4)}°E</div></div></div>
    </div>
    <div class="modal-btns">
      <button onclick="navigator.clipboard.writeText('${info.phone}').then(()=>showToast('Phone copied','success'))" class="modal-btn"><span class="material-icons-round">content_copy</span> Copy Phone</button>
      <button onclick="navigator.clipboard.writeText('${info.email}').then(()=>showToast('Email copied','success'))" class="modal-btn"><span class="material-icons-round">content_copy</span> Copy Email</button>
    </div>
  `);
}

function openAllContactsModal(analysis) {
  const ports = [analysis.port.origin.name, analysis.port.destination.name];
  const rows = ports.map(p => { const i=PORT_COORDS[p]||{}; return `<tr><td>${i.flag||''} ${p}</td><td>${i.country||'N/A'}</td><td>${i.phone||'N/A'}</td><td>${i.email||'N/A'}</td><td>${i.timezone||'N/A'}</td></tr>`; }).join('');
  openModal('📞 All Port Contacts', `<div style="overflow-x:auto;"><table class="mtable"><thead><tr><th>Port</th><th>Country</th><th>Phone</th><th>Email</th><th>TZ</th></tr></thead><tbody>${rows}</tbody></table></div>`);
}

function openMitigationModal(analysis) {
  const {riskAssessment} = analysis;
  openModal('⚡ Mitigation Plan', `
    <div style="margin-bottom:16px;padding:12px;background:var(--surface3);border-radius:var(--radius-sm);border-left:3px solid var(--danger);">
      <div style="font-size:0.72em;color:var(--text3);margin-bottom:4px;">CURRENT RISK STATUS</div>
      <div style="font-weight:700;color:white;font-size:1.05em;">${riskAssessment.riskLevel} RISK — ${riskAssessment.riskScore}% Score</div>
    </div>
    <div style="padding:0 0 14px;border-bottom:1px solid var(--border);margin-bottom:14px;">
      <div style="font-size:0.72em;font-weight:700;letter-spacing:0.08em;color:var(--text3);margin-bottom:10px;">MITIGATION ACTIONS</div>
      ${riskAssessment.keyFactors.slice(0,5).map((f,i) => `
        <div style="display:flex;align-items:flex-start;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);">
          <div style="width:22px;height:22px;border-radius:50%;background:var(--primary-soft);border:1px solid var(--primary);color:#a5b4fc;font-size:0.72em;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${i+1}</div>
          <div style="font-size:0.85em;color:var(--text2);line-height:1.5;">${f}</div>
        </div>
      `).join('')}
    </div>
    <div style="font-size:0.82em;color:var(--text2);">
      <strong style="color:white;">AI Recommendation:</strong><br>
      <span>${riskAssessment.recommendation || 'Monitor conditions and proceed with caution.'}</span>
    </div>
  `);
}

function openAuditModal(analysis) {
  const {riskAssessment, news, weather, port} = analysis;
  const comp = riskAssessment.components||{};
  openModal('🔍 Audit Source Data', `
    <div class="fin-rows">
      <div class="fin-row"><span>News Agent — Articles Processed</span><span>${news.totalArticles||news.articles?.length||0}</span></div>
      <div class="fin-row"><span>Weather Agent — Alerts Found</span><span>${weather.alerts?.length||0}</span></div>
      <div class="fin-row"><span>Port Agent — Ports Queried</span><span>2</span></div>
      <div class="fin-row"><span>News Risk Weight</span><span>35%</span></div>
      <div class="fin-row"><span>Weather Risk Weight</span><span>30%</span></div>
      <div class="fin-row"><span>Congestion Risk Weight</span><span>25%</span></div>
      <div class="fin-row"><span>Tax Risk Weight</span><span>10%</span></div>
    </div>
    <div style="margin-top:14px;padding:10px;background:rgba(99,102,241,0.08);border-radius:var(--radius-sm);border:1px solid rgba(99,102,241,0.2);font-size:0.82em;color:var(--text2);">
      <strong style="color:#a5b4fc;">Risk Formula:</strong><br>
      Final Score = (News × 0.35) + (Weather × 0.30) + (Congestion × 0.25) + (Tax × 0.10)<br><br>
      = (${comp.newsRisk?.toFixed(1)||0} × 0.35) + (${comp.weatherRisk?.toFixed(1)||0} × 0.30) + (${comp.congestionRisk?.toFixed(1)||0} × 0.25) + (${comp.taxRisk?.toFixed(1)||0} × 0.10)<br>
      = <strong style="color:white;">${riskAssessment.riskScore}%</strong>
    </div>
  `);
}

function openCongestionModal(analysis) {
  const {port, riskAssessment} = analysis;
  openModal('⚓ Port Congestion Details', `
    <div class="fin-rows" style="margin-bottom:14px;">
      <div class="fin-row"><span>Congestion Risk Score</span><span style="color:var(--warning);font-weight:700;">${(riskAssessment.components?.congestionRisk||0).toFixed(0)}%</span></div>
      <div class="fin-row"><span>Origin — ${port.origin.name}</span><span style="color:${getCongColor(port.origin.congestion)}">${port.origin.congestion||'N/A'}</span></div>
      <div class="fin-row"><span>Origin Wait Time</span><span>${((port.origin.waitTime||0)/24).toFixed(1)} days</span></div>
      <div class="fin-row"><span>Origin Charge</span><span>$${(port.origin.price||0).toLocaleString()}</span></div>
      <div class="fin-row"><span>Dest — ${port.destination.name}</span><span style="color:${getCongColor(port.destination.congestion)}">${port.destination.congestion||'N/A'}</span></div>
      <div class="fin-row"><span>Dest Wait Time</span><span>${((port.destination.waitTime||0)/24).toFixed(1)} days</span></div>
      <div class="fin-row"><span>Dest Charge</span><span>$${(port.destination.price||0).toLocaleString()}</span></div>
      <div class="fin-row"><span>Total Wait</span><span style="font-weight:700;color:white;">${(((port.origin.waitTime||0)+(port.destination.waitTime||0))/24).toFixed(1)} days</span></div>
    </div>
    <p style="color:var(--text3);font-size:0.82em;">High port wait times directly increase overall cost and risk score.</p>
  `);
}

function openWeatherModal(analysis) {
  const {weather, riskAssessment} = analysis;
  const alerts = weather.alerts||[];
  openModal('⛅ Weather Risk Details', `
    <div class="fin-rows" style="margin-bottom:14px;">
      <div class="fin-row"><span>Weather Risk Score</span><span style="color:var(--warning);font-weight:700;">${(riskAssessment.components?.weatherRisk||0).toFixed(0)}%</span></div>
      <div class="fin-row"><span>Route Forecast</span><span>${weather.forecast||'Normal'}</span></div>
      <div class="fin-row"><span>Active Alerts</span><span>${alerts.length}</span></div>
    </div>
    ${alerts.map(a => `
      <div class="weather-alert-item" style="margin-bottom:8px;">
        <span class="weather-sev">Sev ${a.severity}/3</span>
        <div class="weather-text"><strong>${a.location}</strong><br>${a.alert}</div>
      </div>
    `).join('') || '<p style="color:var(--text3);font-size:0.85em;">No active weather alerts.</p>'}
  `);
}

function openNewsModal(analysis) {
  const {news, riskAssessment} = analysis;
  const articles = news.articles||[];
  openModal('📰 Geopolitical Intelligence', `
    <div class="fin-rows" style="margin-bottom:14px;">
      <div class="fin-row"><span>News Risk Score</span><span style="color:var(--accent);font-weight:700;">${(riskAssessment.components?.newsRisk||0).toFixed(0)}%</span></div>
      <div class="fin-row"><span>Articles Analyzed</span><span>${news.totalArticles||articles.length}</span></div>
    </div>
    ${articles.map(a => `
      <div class="news-item" style="padding:10px 0;border-bottom:1px solid var(--border);">
        <div class="news-headline" style="font-size:0.88em;font-weight:600;color:white;margin-bottom:3px;">${a.headline}</div>
        <div class="news-meta" style="font-size:0.75em;color:var(--text3);">${a.source} • ${new Date(a.timestamp).toLocaleDateString()} • Risk: ${Math.round((a.riskScore||0)*100)}%</div>
      </div>
    `).join('') || '<p style="color:var(--text3);">No news signals.</p>'}
  `);
}

function openSaveMapModal() {
  openModal('💾 Save Map', `
    <div style="text-align:center;padding:20px;">
      <span class="material-icons-round" style="font-size:50px;color:var(--primary);display:block;margin-bottom:12px;">map</span>
      <h4 style="color:white;margin-bottom:8px;">Export Route Map</h4>
      <div class="modal-btns" style="justify-content:center;">
        <button onclick="window.print();closeModal();" class="modal-btn"><span class="material-icons-round">print</span> Print/PDF</button>
        <button onclick="showToast('Use PrtSc or browser screenshot for map capture','info');closeModal();" class="modal-btn"><span class="material-icons-round">screenshot_monitor</span> Screenshot</button>
      </div>
    </div>
  `);
}

function copyPortInfo(portName) {
  const info = PORT_COORDS[portName];
  if (!info) return;
  const text = `Port: ${portName}\nCountry: ${info.country}\nTimezone: ${info.timezone}\nPhone: ${info.phone}\nEmail: ${info.email}\nCoordinates: ${info.lat}°N, ${info.lng}°E`;
  navigator.clipboard.writeText(text).then(()=>showToast('Port info copied!','success')).catch(()=>showToast('Copy failed','error'));
}

// ─── ALERT BANNER ───
function showAlertBanner(title, msg) {
  const banner = document.getElementById('alertBanner');
  const t = document.getElementById('alertTitle');
  const m = document.getElementById('alertMsg');
  if (!banner) return;
  if (t) t.textContent = title;
  if (m) m.textContent = msg;
  banner.style.display = 'flex';
}

// ─── FIT MAP ───
function fitMap(map, layers) {
  if (!map || !layers.length) return;
  try { map.fitBounds(L.featureGroup(layers).getBounds().pad(0.15)); }
  catch { map.setView([25,40],2); }
}

// ─── EXPORT ───
function exportCSV(analysis) {
  const {riskAssessment, alternativeRoutes, userInput, port} = analysis;
  const cost = riskAssessment.costAnalysis||{};
  const best = alternativeRoutes.bestRoute;
  const rows = [
    ['Supply Chain Risk Analysis Report'],
    ['Generated', new Date().toLocaleString()],
    [],
    ['Route', `${userInput.origin} → ${userInput.destination}`],
    ['Product', `${userInput.product} (${userInput.shipmentType})`],
    ['Risk Level', riskAssessment.riskLevel],
    ['Risk Score', riskAssessment.riskScore+'%'],
    ['Confidence', Math.round((riskAssessment.confidence||0.85)*100)+'%'],
    [],
    ['Cost Breakdown'],
    ['Base Shipping', '$'+cost.baseShipping],
    ['Port Charges', '$'+cost.portCharges],
    ['Insurance', '$'+cost.insurance],
    ['Customs', '$'+cost.customs],
    ['TOTAL', '$'+cost.totalEstimatedCost],
    [],
    ['Best Route', best.name],
    ['Distance', best.distance+' nm'],
    ['Duration', best.duration+' days'],
    ['Cost', '$'+best.cost],
    [],
    ['Origin Port', port.origin.name, port.origin.congestion],
    ['Dest Port', port.destination.name, port.destination.congestion]
  ];
  const csv = rows.map(r=>r.map(c=>`"${c||''}"`).join(',')).join('\n');
  dlFile(csv, `supply-chain-${Date.now()}.csv`, 'text/csv');
  showToast('CSV exported!','success');
}

function exportRisksTxt(analysis) {
  const text = buildReportText(analysis);
  dlFile(text, `risk-report-${Date.now()}.txt`, 'text/plain');
  showToast('Risk report exported!','success');
}

function buildReportText(analysis) {
  const {riskAssessment, alternativeRoutes, userInput, port} = analysis;
  return `
SUPPLY CHAIN RISK ANALYSIS — FULL REPORT
Generated: ${new Date().toLocaleString()}

ROUTE: ${userInput.origin} → ${userInput.destination}
Product: ${userInput.product} (${userInput.shipmentType})

RISK ASSESSMENT:
— Level: ${riskAssessment.riskLevel}
— Score: ${riskAssessment.riskScore}%
— Confidence: ${Math.round((riskAssessment.confidence||0.85)*100)}%

RISK BREAKDOWN:
— News / Geopolitical (35%): ${riskAssessment.components?.newsRisk?.toFixed(1)||0}%
— Weather (30%): ${riskAssessment.components?.weatherRisk?.toFixed(1)||0}%
— Congestion (25%): ${riskAssessment.components?.congestionRisk?.toFixed(1)||0}%
— Tax & Customs (10%): ${riskAssessment.components?.taxRisk?.toFixed(1)||0}%

RECOMMENDED ROUTE: ${alternativeRoutes.bestRoute.name}
— Distance: ${alternativeRoutes.bestRoute.distance} nm
— Duration: ${alternativeRoutes.bestRoute.duration} days
— Cost: $${alternativeRoutes.bestRoute.cost}

TOTAL ESTIMATED COST: $${riskAssessment.costAnalysis?.totalEstimatedCost?.toLocaleString()||'N/A'}

PORTS:
— Origin: ${port.origin.name} (${port.origin.status})
— Destination: ${port.destination.name} (${port.destination.status})

KEY RECOMMENDATIONS:
${riskAssessment.keyFactors.map((f,i)=>`${i+1}. ${f}`).join('\n')}

-- Generated by Nexus Supply Chain Risk Analyzer v2.0 Pro --
  `.trim();
}

function emailReport(analysis) {
  const subject = `Supply Chain Analysis: ${analysis.userInput.origin} → ${analysis.userInput.destination}`;
  const body = buildReportText(analysis);
  window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  showToast('Opening email client...','success');
}

function dlFile(content, filename, mime) {
  const blob = new Blob([content],{type:mime});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href=url; a.download=filename; a.click();
  URL.revokeObjectURL(url);
}

// ─── HELPERS ───
function getCongColor(level) {
  if (!level) return 'var(--text2)';
  const l = level.toLowerCase();
  if (l.includes('high')||l.includes('critical')) return 'var(--danger)';
  if (l.includes('medium')) return 'var(--warning)';
  return 'var(--success)';
}
function getCongClass(level) {
  if (!level) return '';
  const l = level.toLowerCase();
  if (l.includes('high')||l.includes('critical')) return 'high-c';
  if (l.includes('medium')) return 'med-c';
  return 'low-c';
}

// ─── TOAST ───
function showToast(msg, type='info') {
  if (!appState.settings.notifications && type!=='error') return;
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const icons = {success:'check_circle',error:'error_outline',info:'info',warning:'warning_amber'};
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span class="material-icons-round">${icons[type]||'info'}</span> ${msg}`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}
