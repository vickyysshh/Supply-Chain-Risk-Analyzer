// Port Agent - Checks port congestion, pricing, and status
class PortAgent {
  static async checkPortStatus(userInput) {
    console.log('⚓ Checking port status and pricing');

    // Mock port data
    const portDatabase = {
      'Shanghai': { congestion: 'High', waitTime: 48, price: 2500, status: 'Operational', capacity: '65%', customs: 'Standard 2-3 days', tax: '17% VAT' },
      'Long Beach': { congestion: 'Medium', waitTime: 24, price: 3200, status: 'Operational', capacity: '55%', customs: 'Standard 1-2 days', tax: 'Duty depends on product' },
      'Rotterdam': { congestion: 'Low', waitTime: 12, price: 2800, status: 'Operational', capacity: '40%', customs: 'EU standard 1 day', tax: '19% VAT (EU)' },
      'Singapore': { congestion: 'High', waitTime: 36, price: 2100, status: 'Operational', capacity: '70%', customs: 'Standard 2 days', tax: '7% GST' },
      'Port Said': { congestion: 'Medium', waitTime: 30, price: 1500, status: 'Operational', capacity: '60%', customs: 'Standard 1 day', tax: 'Egyptian tax 10%' }
    };

    const getPortData = (portName) => {
      if (portDatabase[portName]) return portDatabase[portName];
      // Generate deterministic pseudo-random logic for ANY city typed
      const h = Array.from(portName).reduce((sum, char) => sum + char.charCodeAt(0), 0);
      const confLevels = ['Low', 'Medium', 'High'];
      const congestion = confLevels[h % 3];
      const waitTime = (h % 50) + 10; // 10 to 60 hours
      const price = ((h % 40) * 100) + 1000; // $1000 to $5000
      return {
        congestion: congestion,
        waitTime: waitTime,
        price: price,
        status: 'Operational',
        capacity: (h % 40 + 40) + '%',
        customs: 'Standard processing pending',
        tax: 'Local variable tax'
      };
    };

    const originPort = getPortData(userInput.origin);
    const destPort = getPortData(userInput.destination);

    const congestionRisk = this.calculateCongestionRisk(originPort.congestion, destPort.congestion);

    return {
      origin: {
        name: userInput.origin,
        ...originPort
      },
      destination: {
        name: userInput.destination,
        ...destPort
      },
      totalWaitTime: originPort.waitTime + destPort.waitTime,
      portCostPerContainer: originPort.price + destPort.price,
      congestionRisk: congestionRisk,
      customs: {
        origin: originPort.customs,
        destination: destPort.customs
      },
      summary: {
        busyScore: congestionRisk,
        totalDelay: originPort.waitTime + destPort.waitTime + ' hours expected',
        estimatedPortCharges: `$${originPort.price + destPort.price} per TEU`
      },
      timestamp: new Date().toISOString()
    };
  }

  static calculateCongestionRisk(originCongestion, destCongestion) {
    const congestionMap = { 'Low': 0.2, 'Medium': 0.5, 'High': 0.8, 'Unknown': 0.3 };
    const originScore = congestionMap[originCongestion] || 0.3;
    const destScore = congestionMap[destCongestion] || 0.3;
    return (originScore + destScore) / 2;
  }
}

module.exports = { PortAgent };
