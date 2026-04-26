// Reporting Agent - Generates comprehensive analysis reports
class ReportingAgent {
  static async generateReport(data) {
    console.log('📊 Generating comprehensive report');

    const { input, news, weather, port, riskAssessment, alternatives } = data;

    const report = {
      title: `Supply Chain Risk Analysis Report`,
      subtitle: `${input.origin} → ${input.destination} | ${input.product || 'General Cargo'}`,
      generatedAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),

      // Executive Summary
      executiveSummary: {
        riskLevel: riskAssessment.riskLevel,
        riskScore: riskAssessment.riskScore,
        riskColor: riskAssessment.riskColor,
        primaryRecommendation: riskAssessment.recommendation,
        estimatedCost: `$${riskAssessment.costAnalysis.totalEstimatedCost.toLocaleString()}`,
        estimatedDuration: `${alternatives.bestRoute.duration} days`,
        confidence: `${(riskAssessment.confidence * 100).toFixed(0)}%`
      },

      // Route Analysis
      routeAnalysis: {
        primaryRoute: {
          ...alternatives.bestRoute,
          score: alternatives.bestRoute.efficiencyScore,
          recommendation: 'RECOMMENDED'
        },
        alternativeRoutes: alternatives.alternatives.map(r => ({
          name: r.name,
          duration: r.duration,
          cost: r.cost,
          riskScore: r.riskScore,
          efficiencyScore: r.efficiencyScore,
          pros: r.pros,
          cons: r.cons
        }))
      },

      // Risk Breakdown
      riskBreakdown: {
        newsRisk: {
          score: riskAssessment.components.newsRisk,
          articles: news.totalArticles,
          keyArticles: news.articles.slice(0, 3),
          impact: 'Market and operational disruptions'
        },
        weatherRisk: {
          score: riskAssessment.components.weatherRisk,
          alerts: weather.alerts,
          forecast: weather.forecast,
          impact: 'Natural disasters and delays'
        },
        congestionRisk: {
          score: riskAssessment.components.congestionRisk,
          originCongestion: port.origin.congestion,
          destCongestion: port.destination.congestion,
          waitTime: `${port.totalWaitTime} hours`,
          impact: 'Port delays and scheduling issues'
        }
      },

      // Port Analysis
      portAnalysis: {
        origin: {
          name: port.origin.name,
          congestion: port.origin.congestion,
          waitTime: `${(port.origin.waitTime / 24).toFixed(1)} days`,
          capacity: port.origin.capacity,
          customsTime: port.origin.customs,
          tax: port.origin.tax,
          charges: `$${port.origin.price} per TEU`
        },
        destination: {
          name: port.destination.name,
          congestion: port.destination.congestion,
          waitTime: `${(port.destination.waitTime / 24).toFixed(1)} days`,
          capacity: port.destination.capacity,
          customsTime: port.destination.customs,
          tax: port.destination.tax,
          charges: `$${port.destination.price} per TEU`
        }
      },

      // Cost Analysis
      costAnalysis: {
        breakdown: {
          baseShipping: `$${riskAssessment.costAnalysis.baseShippingCost}`,
          portCharges: `$${riskAssessment.costAnalysis.portCharges}`,
          fuelSurcharge: `$${riskAssessment.costAnalysis.fuelSurcharge}`,
          insurance: `$${riskAssessment.costAnalysis.insurancePremium.toFixed(2)}`,
          customs: `$${riskAssessment.costAnalysis.customsDuty}`,
          riskMultiplier: `${(riskAssessment.costAnalysis.riskMultiplier * 100).toFixed(0)}%`
        },
        total: `$${riskAssessment.costAnalysis.totalEstimatedCost.toLocaleString()}`,
        costPerDay: `$${riskAssessment.costAnalysis.pricePerDay.toLocaleString()}`
      },

      // Key Risk Factors
      keyRiskFactors: riskAssessment.keyFactors,

      // Recommendations
      recommendations: this.generateRecommendations(riskAssessment, alternatives),

      // Action Items
      actionItems: this.generateActionItems(riskAssessment),

      // Confidence & Notes
      confidenceLevel: riskAssessment.confidence,
      lastUpdated: new Date().toISOString(),
      dataSource: 'Multi-Agent AI Analysis System',
      disclaimer: 'This analysis is based on publicly available data and AI assessment. Please verify with official sources before making critical decisions.'
    };

    return report;
  }

  static generateRecommendations(riskAssessment, alternatives) {
    const recommendations = [];

    if (riskAssessment.riskLevel === 'HIGH') {
      recommendations.push('🔴 AVOID PRIMARY ROUTE - Consider using alternative routes with lower risk scores');
      recommendations.push('🔴 INCREASE INSURANCE COVERAGE - High-risk shipment requires enhanced protection');
      recommendations.push('🔴 NOTIFY RECEIVER - Prepare for potential delays in delivery schedule');
    } else if (riskAssessment.riskLevel === 'MEDIUM') {
      recommendations.push('🟡 MONITOR CLOSELY - Keep track of weather forecasts and port updates');
      recommendations.push('🟡 ALTERNATIVE READY - Have backup plan ready in case conditions deteriorate');
      recommendations.push('🟡 STANDARD INSURANCE - Standard insurance coverage should be sufficient');
    } else {
      recommendations.push('🟢 PROCEED AS PLANNED - Route is relatively safe for shipping');
      recommendations.push('🟢 NORMAL PROCEDURES - Standard handling and insurance apply');
    }

    recommendations.push(`✈️ RECOMMENDED ROUTE: ${alternatives.bestRoute.name}`);
    recommendations.push(`💰 COST OPTIMIZATION: Review alternative routes - savings up to 15% possible`);

    return recommendations;
  }

  static generateActionItems(riskAssessment) {
    return [
      `1. Review route with logistics team - Current risk score: ${riskAssessment.riskScore}%`,
      `2. Contact port authorities for real-time confirmations`,
      `3. Verify insurance coverage limits before shipping`,
      `4. Set up alerts for weather changes and port updates`,
      `5. Prepare contingency plan for ${riskAssessment.riskLevel} risk scenario`,
      `6. Confirm invoice with current cost estimate: $${riskAssessment.costAnalysis.totalEstimatedCost}`,
      `7. Notify receiver of expected delivery timeframe`
    ];
  }
}

module.exports = { ReportingAgent };
