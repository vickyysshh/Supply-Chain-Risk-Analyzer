// Route Optimizer Agent - Generates and scores alternative routes
class RouteOptimizerAgent {
  static async generateRoutes(userInput) {
    console.log('🗺️ Generating alternative routes');

    const routeDatabase = {
      'Shanghai': {
        'Los Angeles': [
          {
            name: 'Primary - Trans-Pacific Direct',
            legs: ['Shanghai→ Long Beach'],
            distance: 7200,
            duration: 14,
            cost: 3800,
            riskScore: 0.55,
            pros: 'Shortest route',
            cons: 'Typhoon risk in season'
          },
          {
            name: 'Alternative 1 - Northern Pacific',
            legs: ['Shanghai → Seattle → Los Angeles'],
            distance: 8200,
            duration: 17,
            cost: 4200,
            riskScore: 0.40,
            pros: 'Avoids typhoon belt',
            cons: 'Longer, more expensive'
          },
          {
            name: 'Alternative 2 - Suez Route',
            legs: ['Shanghai → Suez → Long Beach'],
            distance: 12000,
            duration: 25,
            cost: 5500,
            riskScore: 0.45,
            pros: 'Longer but potentially safer',
            cons: 'Much longer, geopolitical risk at Suez'
          }
        ],
        'Rotterdam': [
          {
            name: 'Primary - Suez Canal',
            legs: ['Shanghai → Port Said → Rotterdam'],
            distance: 12000,
            duration: 28,
            cost: 4500,
            riskScore: 0.50,
            pros: 'Established route',
            cons: 'Suez congestion, piracy risk'
          },
          {
            name: 'Alternative 1 - Cape of Good Hope',
            legs: ['Shanghai → Cape Town → Rotterdam'],
            distance: 14500,
            duration: 35,
            cost: 5200,
            riskScore: 0.35,
            pros: 'Avoids geopolitical issues',
            cons: 'Much longer, higher fuel costs'
          },
          {
            name: 'Alternative 2 - Trans-Siberian Rail',
            legs: ['Shanghai → Trans-Siberian → Rotterdam'],
            distance: 9000,
            duration: 16,
            cost: 6800,
            riskScore: 0.40,
            pros: 'Fastest by time (considering rail)',
            cons: 'Expensive, limited capacity'
          }
        ]
      },
      'Rotterdam': {
        'Singapore': [
          {
            name: 'Primary - Direct via Suez',
            legs: ['Rotterdam → Port Said → Singapore'],
            distance: 7600,
            duration: 18,
            cost: 3500,
            riskScore: 0.48,
            pros: 'Shorter route',
            cons: 'Suez Canal risk'
          },
          {
            name: 'Alternative 1 - Cape Route',
            legs: ['Rotterdam → Cape Town → Singapore'],
            distance: 11000,
            duration: 28,
            cost: 4800,
            riskScore: 0.38,
            pros: 'Avoids Suez complications',
            cons: 'Longer, more expensive'
          }
        ]
      }
    };

    const routes = routeDatabase[userInput.origin]?.[userInput.destination] || 
                   this.generateGenericRoutes(userInput);

    // Score each route and compute Carbon emission footprint
    const scoredRoutes = routes.map((route, index) => {
      const co2 = Math.round(route.distance * 1.852 * 1.5);
      return {
        ...route,
        carbonMT: co2,
        id: index + 1,
        recommendation: index === 0 ? 'Primary (Recommended)' : `Alternative ${index}`,
        costPerDay: parseFloat((route.cost / route.duration).toFixed(2)),
        efficiencyScore: parseFloat(((1 - (route.riskScore * 0.6 + route.distance / 20000 * 0.4)) * 100).toFixed(2)),
        breakdownByLeg: route.legs.map(leg => ({
          segment: leg,
          status: 'Normal',
          eta: `~${Math.floor(route.duration / route.legs.length)} days`
        }))
      };
    });

    return {
      originDestination: `${userInput.origin} → ${userInput.destination}`,
      routes: scoredRoutes,
      bestRoute: scoredRoutes[0],
      alternatives: scoredRoutes.slice(1),
      timestamp: new Date().toISOString()
    };
  }

  static generateGenericRoutes(userInput) {
    return [
      {
        name: 'Main Route',
        legs: [`${userInput.origin} → ${userInput.destination}`],
        distance: 8000,
        duration: 20,
        cost: 4000,
        riskScore: 0.50,
        pros: 'Direct route',
        cons: 'Standard risk exposure'
      },
      {
        name: 'Alternate Route 1',
        legs: [`${userInput.origin} → Hub → ${userInput.destination}`],
        distance: 9500,
        duration: 23,
        cost: 4500,
        riskScore: 0.40,
        pros: 'Lower risk',
        cons: 'More expensive'
      },
      {
        name: 'Alternate Route 2',
        legs: [`${userInput.origin} → Express → ${userInput.destination}`],
        distance: 7500,
        duration: 17,
        cost: 5200,
        riskScore: 0.55,
        pros: 'Fastest option',
        cons: 'Higher cost'
      }
    ];
  }
}

module.exports = { RouteOptimizerAgent };
