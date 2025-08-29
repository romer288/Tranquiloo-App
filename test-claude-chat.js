// Test Claude Chat Integration
const testClaudeChat = async () => {
  try {
    const response = await fetch('/api/chat-messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sessionId: 'test-session',
        content: 'Hello, I am feeling anxious',
        sender: 'user'
      })
    });
    
    const data = await response.json();
    console.log('Chat response:', data);
  } catch (error) {
    console.error('Chat test failed:', error);
  }
};

// Run test if in Node.js environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testClaudeChat };
} else {
  // Run test in browser
  testClaudeChat();
}