// Weather Agent - Monitors weather alerts for port regions
class WeatherAgent {
  static async fetchWeatherAlerts(userInput) {
    console.log('⛅ Checking weather alerts for ports');
    
    // Default fallback mock data
    const portWeatherMap = {
      'Shanghai': { alert: 'Typhoon Warning', severity: 3, temp: 28, condition: 'Stormy' },
      'Long Beach': { alert: 'None', severity: 0, temp: 22, condition: 'Clear' },
      'Rotterdam': { alert: 'Wind Advisory', severity: 1, temp: 15, condition: 'Windy' },
      'Singapore': { alert: 'Monsoon Season', severity: 2, temp: 30, condition: 'Rainy' },
      'Port Said': { alert: 'None', severity: 0, temp: 26, condition: 'Sunny' }
    };

    let originWeather = portWeatherMap[userInput.origin] || { alert: 'No data', severity: 0, temp: 20, condition: 'Clear' };
    let destWeather = portWeatherMap[userInput.destination] || { alert: 'No data', severity: 0, temp: 20, condition: 'Clear' };

    const apiKey = process.env.OPENWEATHER_KEY;
    if (apiKey && apiKey !== 'your_openweather_key_here') {
      try {
        console.log('⛅ Using real OpenWeather API...');
        const fetchCityWeather = async (city) => {
          const res = await require('axios').get(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`);
          const w = res.data;
          
          let alertMsg = 'None';
          let severity = 0;
          const condition = w.weather[0].main;
          if (condition === 'Rain' || condition === 'Snow') { alertMsg = `${condition} Expected`; severity = 1; }
          if (condition === 'Thunderstorm' || condition === 'Tornado') { alertMsg = `Severe ${condition}`; severity = 3; }
          if (w.wind.speed > 15) { alertMsg = 'High Winds'; severity = 2; }

          return { alert: alertMsg, severity: severity, temp: Math.round(w.main.temp), condition: condition };
        };

        const [oWeather, dWeather] = await Promise.all([
          fetchCityWeather(userInput.origin).catch(() => originWeather),
          fetchCityWeather(userInput.destination).catch(() => destWeather)
        ]);
        
        originWeather = oWeather;
        destWeather = dWeather;
      } catch (error) {
        console.error('❌ OpenWeather API Failed, using fallback:', error.message);
      }
    }

    const alerts = [];
    if (originWeather.severity > 0) {
      alerts.push({
        location: userInput.origin,
        alert: originWeather.alert,
        severity: originWeather.severity,
        temperature: originWeather.temp,
        condition: originWeather.condition,
        impact: 'Potential loading/unloading delays'
      });
    }
    if (destWeather.severity > 0) {
      alerts.push({
        location: userInput.destination,
        alert: destWeather.alert,
        severity: destWeather.severity,
        temperature: destWeather.temp,
        condition: destWeather.condition,
        impact: 'Potential arrival delays'
      });
    }

    const weatherRiskScore = Math.max(originWeather.severity, destWeather.severity) / 3;

    return {
      alerts: alerts,
      originWeather: originWeather,
      destinationWeather: destWeather,
      weatherRiskScore: weatherRiskScore,
      timestamp: new Date().toISOString(),
      forecast: '5-day forecast tracking updated conditions'
    };
  }

  static calculateWeatherRisk(alerts) {
    if (alerts.length === 0) return 0;
    const avgSeverity = alerts.reduce((sum, a) => sum + a.severity, 0) / alerts.length;
    return Math.min(avgSeverity / 3, 1);
  }
}

module.exports = { WeatherAgent };
