// News Agent - Fetches supply chain disruption news
const axios = require('axios');

class NewsAgent {
  static async fetchNews(userInput) {
    console.log('📰 Fetching news for:', userInput.route || `${userInput.origin} to ${userInput.destination}`);
    
    // Default mock data as fallback
    const mockNews = [
      {
        headline: `Port strike reported near ${userInput.destination}`,
        source: 'Reuters Feed',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        severity: 'medium',
        impact: 'Potential 2-3 day delays',
        riskKeywords: ['strike', 'port']
      },
      {
        headline: `Weather alert: Typhoon season beginning in Pacific route`,
        source: 'Weather News',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        severity: 'medium',
        impact: 'Possible route diversions',
        riskKeywords: ['typhoon', 'weather']
      },
      {
        headline: `${userInput.product} import tariffs increased by 15%`,
        source: 'Trade News',
        timestamp: new Date().toISOString(),
        severity: 'low',
        impact: 'Cost increase',
        riskKeywords: ['tariff', 'cost']
      }
    ];

    let articles = mockNews;
    let fallbackUsed = true;
    
    // If real API key is provided
    const apiKey = process.env.NEWSAPI_KEY;
    if (apiKey && apiKey !== 'your_newsapi_key_here') {
      try {
        console.log('📰 Using real NewsAPI with key...');
        // Targeting Trade/Business in Top Countries (India, USA, Asia, Europe) + Origin/Dest
        const query = encodeURIComponent(`("trade" OR "business" OR "supply chain" OR "logistics") AND (India OR USA OR Asia OR Europe OR "${userInput.origin}" OR "${userInput.destination}")`);
        
        const response = await axios.get(`https://newsapi.org/v2/everything?q=${query}&language=en&sortBy=publishedAt&pageSize=5&apiKey=${apiKey}`);
        
        if (response.data && response.data.articles && response.data.articles.length > 0) {
          articles = response.data.articles.map(article => {
            const headline = article.title;
            const text = (article.title + " " + (article.description || "")).toLowerCase();
            
            // Basic severity/keyword mapping
            let severity = 'low';
            let impact = 'Minor impact';
            const riskKeywords = [];
            
            if (text.match(/strike|shut down|ban|war|attack|storm|typhoon|hurricane|crash/)) {
              severity = 'high';
              impact = 'Severe supply chain disruption expected';
              riskKeywords.push('disruption');
            } else if (text.match(/delay|tariff|shortage|protest|congestion|tax|regulation/)) {
              severity = 'medium';
              impact = 'Potential cost or time increase';
              riskKeywords.push('delay');
            }

            return {
              headline: headline.substring(0, 80) + (headline.length > 80 ? '...' : ''),
              source: article.source.name || 'Global News',
              timestamp: new Date(article.publishedAt).toISOString(),
              severity: severity,
              impact: impact,
              riskKeywords: riskKeywords
            };
          });
          fallbackUsed = false;
        }
      } catch (error) {
        console.error('❌ NewsAPI Fetch Failed, using fallback:', error.message);
      }
    }

    const calculatedRisk = this.analyzeRisk(articles);

    return {
      articles: articles,
      totalArticles: articles.length,
      riskScore: calculatedRisk,
      keywords: fallbackUsed ? ['strike', 'typhoon', 'tariff'] : ['global trade', 'business', 'logistics', userInput.origin],
      timestamp: new Date().toISOString()
    };
  }

  static analyzeRisk(articles) {
    let riskScore = 0;
    const severityMap = { high: 0.9, medium: 0.6, low: 0.2 };
    
    articles.forEach(article => {
      riskScore += severityMap[article.severity] || 0;
    });

    return riskScore / Math.max(articles.length, 1);
  }
}

module.exports = { NewsAgent };
