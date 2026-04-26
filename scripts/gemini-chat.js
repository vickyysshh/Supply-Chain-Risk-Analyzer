// SupplyOps Copilot - Autonomous Dashboard Control API
(() => {
  const talkBtn = document.getElementById('talk-btn');
  const chatSection = document.getElementById('ai-chat');
  const chatWindow = document.getElementById('chat-window');
  const userInput = document.getElementById('user-input');
  const sendBtn = document.getElementById('send-btn');

  // DOM elements to control
  const originInput = document.getElementById('origin');
  const destInput = document.getElementById('destination');
  const analyzeBtn = document.getElementById('analyzeBtn');

  // Map of known locations to aid simple NLP parsing
  const topPorts = ['shanghai', 'rotterdam', 'singapore', 'long beach', 'los angeles', 'port said', 
                    'mumbai', 'chennai', 'kolkata', 'mundra', 'dubai', 'busan', 'hong kong', 'tokyo', 
                    'new york', 'hamburg', 'antwerp', 'london', 'houston', 'savannah'];

  const closeBtn = document.getElementById('chat-close-btn');

  const toggleChat = () => {
    if(chatSection.style.display === 'flex') {
      chatSection.style.display = 'none';
      talkBtn.style.opacity = '1';
    } else {
      chatSection.style.display = 'flex';
      talkBtn.style.opacity = '0.7';
      if(chatWindow.children.length === 0) {
        appendMessage('System', 'SupplyOps Copilot connected. Try typing: "Reroute my semiconductors from Shanghai to Hamburg"');
      }
    }
  };

  talkBtn.addEventListener('click', toggleChat);
  if (closeBtn) {
    closeBtn.addEventListener('click', toggleChat);
  }

  const appendMessage = (author, text, isAction = false) => {
    const msg = document.createElement('div');
    msg.innerHTML = `<strong>${author}:</strong> <span style="${isAction ? 'color:#10b981;font-family:monospace;' : ''}">${text}</span>`;
    msg.style.marginBottom = '0.5rem';
    msg.style.padding = '8px';
    msg.style.backgroundColor = isAction ? 'rgba(16, 185, 129, 0.1)' : 'transparent';
    msg.style.borderRadius = '4px';
    chatWindow.appendChild(msg);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  };

  const parseIntent = (text) => {
    let lowerObj = text.toLowerCase();
    let detectedOrigin = null;
    let detectedDest = null;

    // Regex extraction attempt #1: "from X to Y"
    const fromToRegex = /from ([a-z\s]+) to ([a-z\s]+)/i;
    const match = lowerObj.match(fromToRegex);
    
    if (match) {
       detectedOrigin = match[1].trim();
       detectedDest = match[2].trim();
    } else {
       // Fallback: look for known ports in the text
       let found = [];
       topPorts.forEach(p => {
         if (lowerObj.includes(p)) found.push(p);
       });
       if(found.length >= 2) {
         detectedOrigin = found[0];
         detectedDest = found[1];
       }
    }

    return { origin: detectedOrigin, dest: detectedDest };
  };

  const capitalize = (s) => {
      if(!s) return '';
      return s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  sendBtn.addEventListener('click', () => {
    const prompt = userInput.value.trim();
    if (!prompt) return;
    
    appendMessage('You', prompt);
    userInput.value = '';

    // Think simulation
    setTimeout(() => {
      const intent = parseIntent(prompt);
      
      if (intent.origin && intent.dest) {
        const oName = capitalize(intent.origin);
        const dName = capitalize(intent.dest);
        
        appendMessage('Copilot', `Parsed logistics command. Establishing parameters...`);
        
        // Execute Action
        setTimeout(() => {
            if(originInput) originInput.value = oName;
            if(destInput) destInput.value = dName;
            appendMessage('Copilot', `> Executing automated pipeline: ${oName} ➔ ${dName}`, true);
            
            setTimeout(() => {
              if(analyzeBtn) analyzeBtn.click();
            }, 800);
        }, 1000);

      } else {
        appendMessage('Copilot', `I didn't detect clear origin and destination ports. Please specify routing like: "Route from Mumbai to London"`);
      }
    }, 400);
  });

  // Allow 'Enter' key to send
  userInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendBtn.click();
  });
})();
