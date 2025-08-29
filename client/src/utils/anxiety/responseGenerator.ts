
export const generatePersonalizedResponse = (message: string, analysis: any): string => {
  const lowerMessage = message.toLowerCase().trim();
  
  console.log('🎯 Generating personalized response for:', message);
  console.log('📊 Analysis sentiment:', analysis.sentiment);
  console.log('📈 Anxiety level:', analysis.anxietyLevel);
  
  // Handle very short or incomplete messages (but not negative responses)
  if (lowerMessage.length <= 3 && lowerMessage !== 'no' && lowerMessage !== 'yes') {
    const responses = [
      "I'm here and listening. Would you like to share more about how you're feeling right now?",
      "I notice you might be hesitant to share. That's completely okay. Take your time - I'm here when you're ready.",
      "Sometimes it's hard to find the words. Would it help if I asked you some questions to get started?",
      "I'm with you. You don't have to say much right now - just know that I'm here to support you."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Handle simple "no" responses - user is probably responding to a question
  if (lowerMessage === 'no' || lowerMessage === 'nope' || lowerMessage === 'not really') {
    const noResponses = [
      "That's completely okay. I'm here whenever you feel ready to share. Is there anything else on your mind?",
      "No problem at all. Sometimes we just need someone to listen. I'm here for whatever you need.",
      "I understand. We can take things at your own pace. What would be most helpful for you right now?",
      "That's alright. You don't have to share anything you're not comfortable with. I'm here to support you however you need."
    ];
    return noResponses[Math.floor(Math.random() * noResponses.length)];
  }
  
  // Handle simple "yes" responses
  if (lowerMessage === 'yes' || lowerMessage === 'yeah' || lowerMessage === 'yep') {
    const yesResponses = [
      "Great! I'm glad you're open to sharing. What would you like to talk about?",
      "Wonderful. I'm here to listen. What's been on your mind lately?",
      "Perfect. Take your time and share whatever feels comfortable for you.",
      "Excellent. I'm all ears. What's going on?"
    ];
    return yesResponses[Math.floor(Math.random() * yesResponses.length)];
  }
  
  // Check for hallucinations FIRST - provide immediate grounding techniques
  const hallucinationKeywords = ['seeing things', 'hearing voices', 'talking animals', 'dog taking', 'dogs are talking', 'dogs talking', 'cats talking', 'animals talking', 'not real', "aren't real", 'voices in my head', 'hallucination', 'hallucinating', 'things moving'];
  
  const hasHallucination = hallucinationKeywords.some(keyword => lowerMessage.includes(keyword));
  
  if (hasHallucination) {
    return `I understand you're experiencing something very distressing right now. Let me help you feel more grounded:

**Try this 5-4-3-2-1 grounding technique right now:**
• Name 5 things you can see (look around the room)
• Name 4 things you can touch (feel their texture)
• Name 3 things you can hear (real sounds around you)
• Name 2 things you can smell
• Name 1 thing you can taste

**Also try:**
• Hold an ice cube or splash cold water on your face
• Count backwards from 100 by 7s
• Describe your real surroundings out loud
• Call someone you trust to talk

These experiences can be frightening, but grounding techniques can help. If this continues, please contact your doctor or mental health provider soon. You can also call 988 for immediate support.`;
  }
  
  // Crisis response - SECOND PRIORITY
  if (analysis.crisisRiskLevel === 'critical') {
    return "I'm deeply concerned about what you're sharing with me right now. Your life has immense value, and I want you to know that you don't have to face this alone. Please reach out to a crisis helpline (988 in the US) or emergency services immediately. There are people trained to help you through this exact situation.";
  }
  
  // POSITIVE responses - SECOND HIGHEST PRIORITY (before greetings)
  // Check for explicit positive indicators first
  const isExplicitlyPositive = 
    lowerMessage.includes('not anxious') || 
    lowerMessage.includes('i am okay') || 
    lowerMessage.includes("i'm okay") ||
    lowerMessage.includes('feeling better') ||
    lowerMessage.includes('feeling good') ||
    lowerMessage.includes('feeling great') ||
    lowerMessage.includes('love my life') ||
    lowerMessage.includes('not worried');
    
  const isPositiveSentiment = analysis.sentiment === 'positive';
  const isLowAnxiety = analysis.anxietyLevel <= 3;
  
  if (isExplicitlyPositive || (isPositiveSentiment && isLowAnxiety)) {
    console.log('🌟 Generating POSITIVE response for:', message);
    
    const positiveResponses = [
      "That's absolutely wonderful to hear! I'm so happy that you're feeling great and loving your life right now. It's beautiful when we can appreciate the good moments like this. What's been contributing to these positive feelings?",
      "I love hearing this! It sounds like you're in a really good place right now, and that's fantastic. When you say you're not anxious and feeling great, it shows such strength and positivity. What's been going well for you lately?",
      "This is such a joy to hear! You're feeling great and loving life - that's exactly the kind of energy we want to celebrate. It's wonderful that you're not experiencing anxiety right now. What's been helping you maintain this positive outlook?",
      "What amazing news! I can feel the positivity in your message, and it's truly uplifting. When you say you love your life and aren't anxious, it shows you're in such a healthy headspace. I'd love to hear more about what's making you feel so good!"
    ];
    
    const response = positiveResponses[Math.floor(Math.random() * positiveResponses.length)];
    console.log('📝 POSITIVE response selected:', response);
    return response;
  }
  
  // Greeting responses - ONLY for neutral/negative sentiment without positive indicators
  if ((lowerMessage.includes('hello') || lowerMessage.includes('hi')) && 
      !isExplicitlyPositive && !isPositiveSentiment && analysis.anxietyLevel > 2) {
    console.log('🙋 Generating GREETING response for neutral/negative message');
    return `Hello! I'm so glad you're here. It takes courage to reach out, and I want you to know that this is a safe space where you can share whatever is on your mind. How are you feeling today?`;
  }
  
  // Neutral responses - when someone is just checking in or being casual
  if (analysis.sentiment === 'neutral' && analysis.anxietyLevel <= 3) {
    const neutralResponses = [
      "Thank you for sharing that with me. I'm here to listen and support you however you need. Is there anything particular on your mind today?",
      "I appreciate you checking in. It's good to touch base with how you're feeling. What brought you here today?",
      "Thanks for letting me know how you're doing. I'm here if you want to talk about anything - big or small. What's on your heart today?",
      "I'm glad you reached out. Sometimes it's nice just to have someone to talk to. How can I best support you right now?"
    ];
    
    return neutralResponses[Math.floor(Math.random() * neutralResponses.length)];
  }
  
  // Feeling-based responses for actual anxiety
  if (lowerMessage.includes('anxious') || lowerMessage.includes('worried')) {
    return `I hear that you're feeling anxious right now, and I want you to know that those feelings are completely valid. Anxiety can feel overwhelming, but you've taken an important step by reaching out. What's been weighing on your mind most today?`;
  }
  
  if (lowerMessage.includes('sad') || lowerMessage.includes('depressed')) {
    return `Thank you for trusting me with how you're feeling. Sadness can feel so heavy, and it's brave of you to acknowledge it. You don't have to carry this alone - I'm here to support you through this. What's been contributing to these feelings?`;
  }
  
  // Work-related stress
  if (analysis.triggers?.includes('work')) {
    return `Work stress can feel so consuming, especially when it starts affecting other areas of your life. It sounds like your job is creating a lot of pressure for you right now. Have you been able to take any breaks for yourself lately?`;
  }
  
  // Social anxiety
  if (analysis.triggers?.includes('social')) {
    return `Social situations can feel incredibly challenging, and what you're experience is more common than you might think. Many people struggle with similar feelings around others. You're being brave by reaching out and talking about this.`;
  }
  
  // Health anxiety
  if (analysis.triggers?.includes('health')) {
    return `Health concerns can create such intense worry, especially when our minds start imagining worst-case scenarios. It's completely understandable that you're feeling anxious about this. Have you been able to speak with a healthcare provider about your concerns?`;
  }
  
  // High anxiety
  if (analysis.anxietyLevel >= 7) {
    return `I can feel the intensity of what you're going through right now, and I want you to know that your feelings are completely valid. When anxiety feels this overwhelming, it can seem like it will never end, but you've gotten through difficult moments before, and you can get through this one too.`;
  }
  
  // Default personalized responses based on message content
  const personalizedDefaults = [
    `Thank you for sharing "${message}" with me. I can sense that there's more behind those words, and I'm here to listen and support you through whatever you're experiencing.`,
    `I hear you saying "${message}" and I want you to know that whatever brought you here today, you don't have to face it alone. I'm here to help you work through this step by step.`,
    `"${message}" - I appreciate you sharing that with me. I'm here to listen and understand what you're going through. How are you feeling right now?`
  ];
  
  return personalizedDefaults[Math.floor(Math.random() * personalizedDefaults.length)];
};
