import React, { useState, useEffect, useRef } from 'react';
import { Send, Leaf, TrendingUp, BarChart3, Download, MessageSquare } from 'lucide-react';

// CBT Pattern Detection Engine
const cognitivePatterns = {
  catastrophizing: {
    patterns: [
      /everything.*(?:ruin|destroy|over)/i,
      /complete.*(?:disaster|failure|mess)/i,
      /never.*(?:recover|fix|work)/i,
      /worst.*(?:thing|possible|ever)/i,
      /totally.*(?:screwed|doomed)/i
    ],
    severity: 'high',
    color: 'red',
    icon: '🍂'
  },
  overgeneralizing: {
    patterns: [
      /always.*(?:fail|mess|screw)/i,
      /everyone.*(?:hate|think|judge)/i,
      /never.*(?:succeed|work|improve)/i,
      /nobody.*(?:care|like|understand)/i,
      /every.*time/i
    ],
    severity: 'high',
    color: 'red',
    icon: '🍁'
  },
  allOrNothing: {
    patterns: [
      /(?:total|complete).*(?:failure|disaster)/i,
      /perfect.*or.*(?:worthless|nothing)/i,
      /ruined.*everything/i,
      /either.*or.*(?:nothing|failure)/i,
      /all.*(?:wrong|bad|terrible)/i
    ],
    severity: 'medium',
    color: 'orange',
    icon: '🍂'
  },
  negativeLabel: {
    patterns: [
      /I'?m.*(?:stupid|dumb|idiot|loser|failure|worthless)/i,
      /such a.*(?:mess|disaster|joke)/i,
      /total.*(?:failure|loser)/i
    ],
    severity: 'high',
    color: 'red',
    icon: '🥀'
  },
  shouldStatements: {
    patterns: [
      /should.*(?:have|be|do)/i,
      /must.*(?:be|do|have)/i,
      /have to.*be/i,
      /supposed to/i,
      /ought to/i
    ],
    severity: 'medium',
    color: 'orange',
    icon: '🍃'
  }
};

const reframeTemplates = {
  catastrophizing: [
    (text) => "This situation is challenging, but not permanent. What's one small step I can take?",
    (text) => "Things feel overwhelming right now. What resources or support do I have?"
  ],
  overgeneralizing: [
    (text) => "This happened this time. What evidence do I have that it always happens?",
    (text) => "Some people may think that. What about those who've supported me?"
  ],
  allOrNothing: [
    (text) => "This didn't go as planned. What parts went okay? What can I learn?",
    (text) => "Progress isn't perfect. What specific aspects need work?"
  ],
  negativeLabel: [
    (text) => "I made a mistake here. That doesn't define who I am as a person.",
    (text) => "I'm learning and growing. One struggle doesn't make me a failure."
  ],
  shouldStatements: [
    (text) => text.replace(/should have/gi, "it would have been helpful to").replace(/must be/gi, "I'd prefer to be"),
    (text) => "What's a more flexible way to think about this expectation?"
  ]
};

function analyzeText(text) {
  const detected = [];
  
  for (const [distortion, config] of Object.entries(cognitivePatterns)) {
    for (const pattern of config.patterns) {
      if (pattern.test(text)) {
        detected.push({
          type: distortion,
          ...config,
          reframes: reframeTemplates[distortion].map(fn => 
            typeof fn === 'function' ? fn(text) : fn
          )
        });
        break;
      }
    }
  }
  
  return detected;
}

export default function MindfulMirrorBot() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hi! I'm Mindful Mirror 🌿. Forward me your thoughts and I'll help reframe them using CBT techniques. Your mental wellbeing matters.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [stats, setStats] = useState({
    totalAnalyzed: 0,
    healthyReframes: 0,
    topDistortion: 'None yet',
    weeklyImprovement: 0
  });
  const [showDashboard, setShowDashboard] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    const analysis = analyzeText(input);
    
    setTimeout(() => {
      let botResponse;
      
      if (analysis.length === 0) {
        botResponse = {
          id: Date.now() + 1,
          type: 'bot',
          content: "✅ This looks like healthy self-talk! Keep it up. 🌱",
          distortions: [],
          healthy: true,
          timestamp: new Date()
        };
        setStats(prev => ({
          ...prev,
          totalAnalyzed: prev.totalAnalyzed + 1,
          healthyReframes: prev.healthyReframes + 1,
          weeklyImprovement: Math.min(100, prev.weeklyImprovement + 3)
        }));
      } else {
        const distortionList = analysis.map(d => 
          d.type.replace(/([A-Z])/g, ' $1').trim()
        ).join(', ');
        
        botResponse = {
          id: Date.now() + 1,
          type: 'bot',
          content: `I noticed some cognitive patterns here:\n\n${analysis.map(d => 
            `${d.icon} **${d.type.replace(/([A-Z])/g, ' $1').trim()}**\n\n**Reframe options:**\n${d.reframes.map((r, i) => `${i + 1}. ${r}`).join('\n')}`
          ).join('\n\n---\n\n')}\n\n**Try saying:** Pick a reframe that feels authentic to you.`,
          distortions: analysis,
          healthy: false,
          timestamp: new Date()
        };
        
        setStats(prev => ({
          ...prev,
          totalAnalyzed: prev.totalAnalyzed + 1,
          topDistortion: analysis[0].type.replace(/([A-Z])/g, ' $1').trim()
        }));
      }
      
      setMessages(prev => [...prev, botResponse]);
    }, 500);

    setInput('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const exampleMessages = [
    "I always mess up coding interviews, I'm just stupid",
    "Everyone hates my project, total failure",
    "I should have studied more, I'm such a failure"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="max-w-5xl mx-auto p-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Mindful Mirror Bot</h1>
                <p className="text-sm text-gray-600">CBT-Based Self-Talk Reframer</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDashboard(!showDashboard)}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard */}
        {showDashboard && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Your Progress
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl">
                <div className="text-2xl font-bold text-green-700">{stats.totalAnalyzed}</div>
                <div className="text-sm text-gray-600">Messages Analyzed</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl">
                <div className="text-2xl font-bold text-blue-700">
                  {stats.totalAnalyzed > 0 ? Math.round((stats.healthyReframes / stats.totalAnalyzed) * 100) : 0}%
                </div>
                <div className="text-sm text-gray-600">Healthy Self-Talk</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl">
                <div className="text-2xl font-bold text-purple-700">{stats.topDistortion}</div>
                <div className="text-sm text-gray-600">Top Pattern</div>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl">
                <div className="text-2xl font-bold text-amber-700">+{stats.weeklyImprovement}%</div>
                <div className="text-sm text-gray-600">Weekly Growth</div>
              </div>
            </div>
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Your Progress Tree 🌳</span>
                <span className="text-sm text-gray-600">{stats.healthyReframes} healthy reframes</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (stats.healthyReframes / 10) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Chat Container */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="h-[500px] overflow-y-auto p-6 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-4 ${
                    msg.type === 'user'
                      ? 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800'
                      : msg.healthy
                      ? 'bg-gradient-to-br from-green-100 to-emerald-100 text-gray-800'
                      : 'bg-gradient-to-br from-amber-50 to-orange-50 text-gray-800'
                  }`}
                >
                  {msg.type === 'bot' && !msg.healthy && msg.distortions && (
                    <div className="flex gap-2 mb-2">
                      {msg.distortions.map((d, i) => (
                        <span key={i} className="text-xl">{d.icon}</span>
                      ))}
                    </div>
                  )}
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {msg.content.split('**').map((part, i) => 
                      i % 2 === 0 ? part : <strong key={i}>{part}</strong>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Example Messages */}
          {messages.length === 1 && (
            <div className="px-6 pb-4">
              <p className="text-sm text-gray-600 mb-2">Try these examples:</p>
              <div className="flex flex-wrap gap-2">
                {exampleMessages.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(ex)}
                    className="text-xs px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition"
                  >
                    {ex.slice(0, 40)}...
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Share your thoughts... (Press Enter to send)"
                className="flex-1 resize-none border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                rows="2"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Platform Info */}
        <div className="mt-4 bg-white rounded-2xl shadow-lg p-6">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-600" />
            Multi-Platform Support
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="font-semibold text-blue-900 mb-1">📱 Telegram</div>
              <div className="text-blue-700">@MindfulMirrorBot</div>
              <div className="text-xs text-blue-600 mt-1">Forward messages anytime</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="font-semibold text-green-900 mb-1">💬 WhatsApp</div>
              <div className="text-green-700">Twilio Integration</div>
              <div className="text-xs text-green-600 mt-1">Private & secure</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="font-semibold text-purple-900 mb-1">🌐 Web Chat</div>
              <div className="text-purple-700">This Interface</div>
              <div className="text-xs text-purple-600 mt-1">Access anywhere</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}