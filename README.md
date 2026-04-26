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

---

## 📋 Prerequisites

- **Node.js** (v14+)
- **npm** or **yarn**
- Modern web browser (Chrome, Firefox, Safari, Edge)

---

## 🚀 Quick Start

### 1️⃣ Install Dependencies

```bash
cd d:\Hackathon
npm install
```

### 2️⃣ Start Backend Server

```bash
npm start
# Server runs on http://localhost:5000
```

Output should show:
```
✅ Server running on http://localhost:5000
```

### 3️⃣ Open Frontend in Browser

**Option A - Simple Server (Recommended)**
```bash
npm run serve
# Opens on http://localhost:3000
```

**Option B - Direct Open**
- Open `d:\Hackathon\dashboard.html` directly in your browser

---

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

### Agent Data Flow

Each agent passes structured JSON data:

**News Agent Output:**
```json
{
  "articles": [...],
  "riskScore": 0.65,
  "keywords": ["strike", "typhoon"]
}
```

**Weather Agent Output:**
```json
{
  "alerts": [...],
  "weatherRiskScore": 0.45,
  "forecast": "Improving..."
}
```

**Port Agent Output:**
```json
{
  "congestionRisk": 0.50,
  "totalWaitTime": 48,
  "portCostPerContainer": 5700
}
```

**Risk Assessment Output:**
```json
{
  "riskLevel": "MEDIUM",
  "riskScore": 45,
  "costAnalysis": {...},
  "recommendation": "..."
}
```

---

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
| **HIGH** | 65-100% | 🔴 Red | Consider alternative routes |

---

## 🔌 API Endpoints

### Core Endpoint

**POST** `/api/analyze`

Request:
```json
{
  "origin": "Shanghai",
  "destination": "Los Angeles",
  "product": "Electronics",
  "route": "trans-pacific"
}
```

Response:
```json
{
  "success": true,
  "analysis": {
    "newsData": {...},
    "weatherData": {...},
    "portData": {...},
    "riskAssessment": {...},
    "alternativeRoutes": {...},
    "report": {...}
  }
}
```

### Health Check

**GET** `/api/health`

Returns server status.

### Available Routes

**GET** `/api/routes`

Returns predefined route options.

---

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
→ Standard insurance sufficient
```

---

## 🛠️ Technologies Used

**Backend:**
- Node.js + Express.js
- Multi-Agent Architecture
- Async/Promise-based coordination

**Frontend:**
- HTML5, CSS3, JavaScript (Vanilla)
- Leaflet.js (OpenStreetMap integration)
- Responsive Grid Layout

**Data Sources (Mocked for Demo):**
- News APIs (NewsAPI, GDELT)
- Weather APIs (NOAA, OpenWeather)
- Port APIs (SeaRates, JSONCargo)
- Commodity APIs (EIA)

---

## 🚀 Deployment

### Local Development
```bash
npm start
npm run serve
```

### Production Deployment

**Heroku:**
```bash
heroku create supply-chain-analyzer
git push heroku main
```

**AWS/Azure:**
- Deploy backend to serverless (Lambda/Functions)
- Host frontend on S3/Blob Storage
- Use CDN for distribution

---

## 📝 Environment Variables

Create `.env` file:
```bash
PORT=5000
NODE_ENV=development
NEWSAPI_KEY=your_key
OPENWEATHER_KEY=your_key
EIA_KEY=your_key
```

---

## ⚙️ Advanced Configuration

### Port Mapping
Edit `backend/agents/PortAgent.js` to add custom ports:

```javascript
const portDatabase = {
  'Dubai': {
    congestion: 'Medium',
    waitTime: 20,
    price: 2200,
    // ...
  }
};
```

### Risk Thresholds
Edit `backend/agents/RiskAssessmentAgent.js`:

```javascript
const weights = {
  news: 0.35,
  weather: 0.30,
  congestion: 0.25,
  tax: 0.10
};
```

### Custom Routes
Edit `backend/agents/RouteOptimizerAgent.js` to add new routes.

---

## 📞 Support & Troubleshooting

### Issue: "Failed to analyze route"
- ✅ Ensure backend server is running: `npm start`
- ✅ Check if port 5000 is available
- ✅ Check browser console for errors (F12)

### Issue: Map not loading
- ✅ Check internet connection (uses CDN)
- ✅ Clear browser cache
- ✅ Try different browser

### Issue: Slow performance
- ✅ Close unnecessary browser tabs
- ✅ Restart Node.js server
- ✅ Check system resources

---

## 📄 License

MIT License - Free to use and modify

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
