const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend static files from project root
app.use(express.static(path.join(__dirname, '..'), { index: 'index.html' }));

// Import Agents
const { NewsAgent } = require('./agents/NewsAgent');
const { WeatherAgent } = require('./agents/WeatherAgent');
const { PortAgent } = require('./agents/PortAgent');
const { RiskAssessmentAgent } = require('./agents/RiskAssessmentAgent');
const { RouteOptimizerAgent } = require('./agents/RouteOptimizerAgent');
const { ReportingAgent } = require('./agents/ReportingAgent');

// Coordinator function
async function coordinateAnalysis(userInput) {
  console.log('🚀 Starting analysis for:', userInput);
  
  try {
    // Parallel execution of data collection agents
    const [newsData, weatherData, portData] = await Promise.all([
      NewsAgent.fetchNews(userInput),
      WeatherAgent.fetchWeatherAlerts(userInput),
      PortAgent.checkPortStatus(userInput)
    ]);

    // Risk assessment
    const riskAssessment = await RiskAssessmentAgent.assessRisk({
      news: newsData,
      weather: weatherData,
      port: portData
    });

    // Generate alternative routes
    const alternativeRoutes = await RouteOptimizerAgent.generateRoutes(userInput);

    // Generate comprehensive report
    const report = await ReportingAgent.generateReport({
      input: userInput,
      news: newsData,
      weather: weatherData,
      port: portData,
      riskAssessment: riskAssessment,
      alternatives: alternativeRoutes
    });

    return {
      success: true,
      timestamp: new Date().toISOString(),
      analysis: {
        newsData,
        weatherData,
        portData,
        riskAssessment,
        alternativeRoutes,
        report
      }
    };
  } catch (error) {
    console.error('❌ Analysis failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Routes
app.post('/api/analyze', async (req, res) => {
  const { route, product, origin, destination } = req.body;
  
  if (!origin || !destination) {
    return res.status(400).json({ error: 'Origin and destination required' });
  }

  const userInput = {
    route,
    product: product || 'Electronics',
    origin,
    destination
  };

  const result = await coordinateAnalysis(userInput);
  res.json(result);
});

app.get('/api/routes', (req, res) => {
  const routes = [
    { id: 1, name: 'Shanghai → Los Angeles (Pacific)', ports: ['Shanghai', 'Long Beach'], distance: '7200nm' },
    { id: 2, name: 'Rotterdam → Singapore (Suez)', ports: ['Rotterdam', 'Port Said', 'Singapore'], distance: '7600nm' },
    { id: 3, name: 'Shanghai → Rotterdam (Suez)', ports: ['Shanghai', 'Port Said', 'Rotterdam'], distance: '12000nm' }
  ];
  res.json(routes);
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'API is running', timestamp: new Date().toISOString() });
});

app.get('/api/searoute', (req, res) => {
  try {
    const { srcLat, srcLng, destLat, destLng } = req.query;
    if (!srcLat || !srcLng || !destLat || !destLng) {
      return res.status(400).json({ error: 'Missing coordinates' });
    }
    const searoute = require('searoute-js');
    const origin = [parseFloat(srcLng), parseFloat(srcLat)];
    const dest = [parseFloat(destLng), parseFloat(destLat)];
    const route = searoute(origin, dest);
    res.json(route);
  } catch (err) {
    console.error('Searoute Error:', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

module.exports = app;
