# 🌍 Supply Chain Risk Analyzer

**AI-Powered Multi-Agent System for Import/Export Route Analysis, Risk Assessment & Cost Optimization**

A sophisticated supply chain disruption analyzer that uses intelligent agents to assess weather risks, port congestion, market disruptions, and provides alternative route recommendations with comprehensive cost analysis.

---

## ✨ Features

### Core Capabilities
- 📰 **News Agent** - Real-time supply chain disruption detection from headlines
- ⛅ **Weather Agent** - Port-specific weather alerts and storm monitoring
- ⚓ **Port Agent** - Live port congestion, pricing, and customs information
- 🔍 **Risk Assessment Agent** - AI-driven risk scoring (High/Medium/Low)
- 🗺️ **Route Optimizer** - 3 alternative routes with cost/risk comparison
- 📊 **Report Generator** - Detailed analysis with recommendations
- 🗺️ **Interactive Sea Map** - Visual route planning with Leaflet.js

### Analysis Includes
✅ Real-time weather monitoring  
✅ Port congestion status  
✅ Import/Export tariffs & taxes  
✅ Total shipping costs (shipping, fuel, insurance, customs)  
✅ Transit time estimation  
✅ Risk factor breakdown  
✅ Alternative route suggestions  
✅ Confidence scores  
✅ Action recommendations  




## 🎯 How to Use

### Step 1: Select Route
1. Choose **Origin Port** (e.g., Shanghai)
2. Choose **Destination Port** (e.g., Los Angeles)
3. Select **Product Type** (Electronics, Textiles, etc.)
4. Choose **Shipment Type** (Import/Export)

### Step 2: Run Analysis
- Click **"Run Analysis"** button
- Wait for all agents to complete (~3-5 seconds)

### Step 3: Review Results

**Overview Tab:**
- Risk level indicator with color coding
- Key risk factors
- Total estimated cost
- Transit duration

**Routes & Costs Tab:**
- Interactive sea map showing all routes
- Route comparison (distance, duration, cost, risk)
- Detailed route breakdown

**Risk Details Tab:**
- News-based risk analysis
- Weather alerts for ports
- Port congestion status

**Port Analysis Tab:**
- Origin port detailed information
- Destination port information
- Congestion levels, customs times, taxes

**Full Report Tab:**
- Executive summary
- Cost breakdown
- Detailed recommendations
- Download as reference

---

## 🔧 Project Structure

```
d:\Hackathon\
├── backend/
│   ├── server.js                 # Main Express server
│   └── agents/
│       ├── NewsAgent.js          # News data fetching
│       ├── WeatherAgent.js       # Weather alerts
│       ├── PortAgent.js          # Port status & pricing
│       ├── RiskAssessmentAgent.js # Risk computation
│       ├── RouteOptimizerAgent.js # Route alternatives
│       └── ReportingAgent.js     # Report generation
├── scripts/
│   └── analyzer.js               # Frontend logic & map integration
├── styles/
│   ├── main.css                  # Base styles
│   ├── dashboard.css             # Dashboard styles
│   └── ...
├── dashboard.html                # Main UI
├── package.json                  # Dependencies
├── .env                          # Environment variables
└── README.md                     # This file
```

---

## 🧠 Agent Architecture

### Multi-Agent Workflow

```
User Input
    ↓
Coordinator Agent
    ├→ News Agent (Headlines)
    ├→ Weather Agent (Alerts)
    └→ Port Agent (Congestion)
    ↓
Risk Assessment Agent
    ├→ Calculates risk score
    ├→ Estimates costs
    └→ Generates recommendations
    ↓
Route Optimizer Agent
    └→ 3 Alternative routes
    ↓
Reporting Agent
    └→ Final comprehensive report
    ↓
Frontend Display (Map + Dashboard)
```

## 💰 Cost Breakdown

Total estimated cost includes:

1. **Base Shipping Cost** - $5,000
2. **Port Charges** - $2,500-$3,200 (per port)
3. **Fuel Surcharge** - $800
4. **Insurance Premium** - $300-$800 (risk-adjusted)
5. **Customs Duty** - $1,200 (estimate)
6. **Risk Multiplier** - Increases with risk level

**Total per TEU (20ft container):** $9,000-$12,000+

---

## 🗺️ Map Features

The interactive sea map shows:
- ✅ All shipping routes
- ✅ Origin port (Green marker)
- ✅ Destination port (Red marker)
- ✅ Recommended route (solid line)
- ✅ Alternative routes (dashed lines)
- ✅ Real-time zoom & pan
- ✅ OpenStreetMap tiles
- ✅ Port information popups

---

## 📊 Risk Levels Explained

| Level | Score | Color | Action |
|-------|-------|-------|--------|
| **LOW** | 0-35% | 🟢 Green | Proceed normally |
| **MEDIUM** | 35-65% | 🟡 Yellow | Monitor & prepare contingency |

## 🚢 Supported Ports

**Asia:**
- Shanghai, China (31.41°N, 121.61°E)
- Singapore (1.35°N, 103.82°E)

**Americas:**
- Los Angeles, USA (33.74°N, -118.27°W)
- Long Beach, USA (33.75°N, -118.19°W)

**Europe:**
- Rotterdam, Netherlands (51.92°N, 4.28°E)

**Middle East:**
- Port Said, Egypt (31.25°N, 32.30°E)

---

## 📈 Sample Analysis Output

```
Route: Shanghai → Los Angeles (Electronics Import)

RISK LEVEL: MEDIUM (45%)
├─ News Risk: 35%
├─ Weather Risk: 40%
└─ Congestion Risk: 50%

COST ESTIMATE: $10,250
├─ Shipping: $5,000
├─ Ports: $2,700
├─ Insurance: $650
├─ Customs: $1,200
└─ Surcharges: $700

RECOMMENDED ROUTE:
✅ Primary - Trans-Pacific Direct
   Distance: 7,200 nm
   Duration: 14 days
   Cost: $3,800
   Efficiency: 82%

ALTERNATIVES:
🔄 Alternative 1 - Northern Pacific
   Distance: 8,200 nm
   Duration: 17 days
   Cost: $4,200
   Risk: 40% (lower risk)

🔄 Alternative 2 - Suez Route
   Distance: 12,000 nm
   Duration: 25 days
   Cost: $5,500
   Risk: 45% (geopolitical risk)

KEY FACTORS:
→ Typhoon warning at Shanghai
→ Port delays: 48 hours expected
→ 15% tariff on electronics
→ Weather improving in 5 days

RECOMMENDATIONS:
🟡 MEDIUM RISK: Monitor conditions closely
→ Set up weather alerts
→ Confirm with port authorities
→ Prepare contingency plan
→ Standard insurance sufficien
---



### Custom Routes
Edit `backend/agents/RouteOptimizerAgent.js` to add new routes

---

## 👥 Contributors

Hackathon Team 2026 - Supply Chain Disruption Risk Analyzer

---

## 🎯 Future Enhancements

- [ ] Real API integration (NewsAPI, NOAA, etc.)
- [ ] Database support (PostgreSQL/MongoDB)
- [ ] User authentication & history
- [ ] Mobile app (React Native)
- [ ] Real-time WebSocket updates
- [ ] Machine learning risk prediction
- [ ] Multi-language support
- [ ] ChatGPT integration for reasoning
- [ ] Historical data analysis
- [ ] Predictive alerts

---

**🚀 Start analyzing supply chains with AI-powered intelligence!**
