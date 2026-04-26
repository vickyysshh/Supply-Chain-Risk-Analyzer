// Risk Assessment Agent - Aggregates all signals into comprehensive risk score
class RiskAssessmentAgent {
  static async assessRisk(data) {
    console.log('🔍 Assessing overall supply chain risk');

    const { news, weather, port } = data;

    // Calculate individual risk scores
    const newsRisk = news.riskScore || 0.3;
    const weatherRisk = weather.weatherRiskScore || 0;
    const congestionRisk = port.congestionRisk || 0;
    
    // Weighted risk calculation
    const weights = {
      news: 0.35,
      weather: 0.30,
      congestion: 0.25,
      tax: 0.10
    };

    const totalRisk = (newsRisk * weights.news) + 
                      (weatherRisk * weights.weather) + 
                      (congestionRisk * weights.congestion);

    // Determine risk level
    let riskLevel, riskColor, recommendation;
    if (totalRisk >= 0.65) {
      riskLevel = 'HIGH';
      riskColor = '#ef4444';
      recommendation = '⚠️ HIGH RISK: Consider alternative routes or delay shipment';
    } else if (totalRisk >= 0.35) {
      riskLevel = 'MEDIUM';
      riskColor = '#eab308';
      recommendation = '⚠️ MEDIUM RISK: Monitor conditions closely, prepare contingency plans';
    } else {
      riskLevel = 'LOW';
      riskColor = '#22c55e';
      recommendation = '✅ LOW RISK: Route is relatively safe to proceed';
    }

    // Calculate total cost estimate
    const shippingCost = 5000; // Base shipping cost
    const portCharges = port.portCostPerContainer || 0;
    const fuelSurcharge = 800;
    const insuranceBase = 300;
    const customsDuty = 1200; // Estimate
    
    const costMultiplier = 1 + (totalRisk * 0.3); // Cost increases with risk
    const totalCost = (shippingCost + portCharges + fuelSurcharge + insuranceBase + customsDuty) * costMultiplier;

    return {
      riskLevel,
      riskColor,
      riskScore: parseFloat((totalRisk * 100).toFixed(2)),
      confidence: 0.85,
      
      // Breakdown
      components: {
        newsRisk: parseFloat((newsRisk * 100).toFixed(2)),
        weatherRisk: parseFloat((weatherRisk * 100).toFixed(2)),
        congestionRisk: parseFloat((congestionRisk * 100).toFixed(2))
      },

      // Financial impact
      costAnalysis: {
        baseShippingCost: shippingCost,
        portCharges: portCharges,
        fuelSurcharge: fuelSurcharge,
        insurancePremium: insuranceBase + (totalRisk * 500),
        customsDuty: customsDuty,
        riskMultiplier: parseFloat(costMultiplier.toFixed(2)),
        totalEstimatedCost: parseFloat(totalCost.toFixed(2)),
        pricePerDay: parseFloat((totalCost / 28).toFixed(2)) // Based on ~28 day transit
      },

      // ESG Carbon Tracking
      esg: {
        carbonEmissionsMT: parseFloat((2500 + Math.random() * 1000).toFixed(2)), // Simulated metrics
        ecoRouteSavingsMT: parseFloat((300 + Math.random() * 200).toFixed(2)),
        complianceStatus: 'Compliant (Tier 2)',
        carbonTax: parseFloat((totalRisk * 500).toFixed(2))
      },

      // Key factors
      keyFactors: this.identifyKeyFactors(data),
      
      recommendation,
      timestamp: new Date().toISOString(),
      validForDays: 7
    };
  }

  static identifyKeyFactors(data) {
    const factors = [];

    // News factors
    if (data.news.riskScore > 0.6) {
      factors.push(`${data.news.totalArticles} disruption-related news items detected`);
    }

    // Weather factors
    if (data.weather.alerts && data.weather.alerts.length > 0) {
      data.weather.alerts.forEach(alert => {
        factors.push(`🌪️ ${alert.alert} at ${alert.location}`);
      });
    }

    // Congestion factors
    if (data.port.totalWaitTime > 48) {
      factors.push(`⏱️ High wait times: ${data.port.totalWaitTime} hours total (${Math.round(data.port.totalWaitTime / 24)} days)`);
    }

    if (data.port.congestionRisk > 0.6) {
      factors.push(`🚢 Port congestion detected at origin and/or destination`);
    }

    return factors.length > 0 ? factors : ['No major risk factors detected'];
  }
}

module.exports = { RiskAssessmentAgent };
