//Author: Harsh Dugar
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ChatHeader from '@/components/ChatHeader';
import AvatarSection from '@/components/chat/AvatarSection';
import ChatSection from '@/components/chat/ChatSection';
import ChatHistorySidebar from '@/components/ChatHistorySidebar';
import { GoalSuggestionModal } from '@/components/goals/GoalSuggestionModal';
import { CrisisResourcesModal } from '@/components/CrisisResourcesModal';
import { useAnxietyAnalysis } from '@/hooks/useAnxietyAnalysis';
import { useChat } from '@/hooks/useChat';
import { useAvatarEmotions } from '@/hooks/useAvatarEmotions';
import { useChatInteractions } from '@/hooks/useChatInteractions';
import { useGoalSuggestions } from '@/hooks/useGoalSuggestions';
import { detectLanguage } from '@/utils/language';
import { shouldEscalate } from '@/utils/escalation';

interface ChatContainerProps {
  sessionId?: string | null;
}

const ChatContainer = ({ sessionId }: ChatContainerProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialMessage = location.state?.initialMessage;

  const {
    messages,
    inputText,
    setInputText,
    isTyping,
    isAnalyzing,
    currentLanguage,
    aiCompanion,
    scrollRef,
    handleSendMessage,
    editMessage
  } = useChat(sessionId);

  const { anxietyAnalyses, currentAnxietyAnalysis } = useAnxietyAnalysis();

  const {
    showSuggestionModal,
    suggestedGoals,
    triggerGoalSuggestion,
    closeSuggestionModal
  } = useGoalSuggestions();

  const {
    isAnimating,
    currentEmotion,
    latestAnalysis,
    allAnalyses
  } = useAvatarEmotions(
    aiCompanion,
    messages,
    isTyping,
    anxietyAnalyses,
    currentAnxietyAnalysis
  );

  const {
    isListening,
    speechSupported,
    speechSynthesisSupported,
    languageContext,
    isSpeaking,
    handleToggleListening,
    handleKeyPress,
    handleAutoStartListening,
    handleSpeakText,
    stopSpeaking
  } = useChatInteractions(currentLanguage, setInputText, handleSendMessage);

  const [useReadyPlayerMe, setUseReadyPlayerMe] = React.useState(true);
  const [avatarIsSpeaking, setAvatarIsSpeaking] = React.useState(false);
  const [lastSpokenMessageId, setLastSpokenMessageId] = React.useState<string | null>(null);
  const [showCrisisModal, setShowCrisisModal] = React.useState(false);
  const [showMobileChatHistory, setShowMobileChatHistory] = React.useState(false);
  const [autoSpeak, setAutoSpeak] = React.useState(() => {
    const saved = localStorage.getItem('autoSpeak');
    return saved !== null ? saved === 'true' : true;
  });

  // Prime language from the very first user input (or initialMessage)
  React.useEffect(() => {
    const src = initialMessage?.trim() || messages[0]?.text || '';
    if (src) {
      const lang = detectLanguage(src);
      if (languageContext && typeof languageContext === 'object' && 'currentLanguage' in languageContext) {
        // Language context is read-only, we'll use it as-is
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Force-reset voice state on mount for mobile stability
  React.useEffect(() => {
    setAvatarIsSpeaking(false);
    setLastSpokenMessageId(null);
    stopSpeaking();
  }, [stopSpeaking]);

  // Initial message auto-speak (faster)
  React.useEffect(() => {
    if (!autoSpeak) return;
    const last = messages[messages.length - 1];
    if (!last) return;
    // Skip if message is from user (only auto-speak AI messages)
    if (last.sender === 'user') return;
    if (isTyping || avatarIsSpeaking || last.id === lastSpokenMessageId) return;
    const lang = detectLanguage(last.text || '');
    const spanishChars = /[¡¿ñáéíóúü]|hola|gracias|cómo|está|soy|tengo|estoy|muy|aquí|por favor|buenos días|buenas tardes|buenas noches/i;
    const hasSpanish = spanishChars.test(last.text);
    const finalLang = lang === 'es' || (lang !== 'en' && hasSpanish) ? 'es' : 'en';

    (async () => {
      setLastSpokenMessageId(last.id);
      setAvatarIsSpeaking(true);
      try {
        await handleSpeakText(last.text, finalLang);
      } catch (e) {
        console.warn('Auto speak failed:', e);
      } finally {
        setAvatarIsSpeaking(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, isTyping, handleSpeakText, avatarIsSpeaking, lastSpokenMessageId, autoSpeak]);

  // Crisis escalation gate: reduce false positives
  const recentHighAnxietyCount = React.useMemo(() => {
    const last5 = (allAnalyses ?? []).slice(0, 5);
    return last5.filter(a => (a.anxietyLevel ?? (a as any).anxiety_level ?? 0) >= 8).length;
  }, [allAnalyses]);

  const handleMaybeShowCrisis = React.useCallback((text: string) => {
    const escalate = shouldEscalate(text, latestAnalysis || undefined, recentHighAnxietyCount);
    if (escalate) setShowCrisisModal(true);
  }, [latestAnalysis, recentHighAnxietyCount]);

  // Chat history handlers
  const handleSessionSelect = (newSessionId: string) => {
    setShowMobileChatHistory(false); // Close mobile modal
    // Use window.location.href for full page reload (same as ChatHistory page)
    window.location.href = `/chat?session=${newSessionId}`;
  };

  const handleNewChat = () => {
    setShowMobileChatHistory(false); // Close mobile modal
    window.location.href = '/chat';
  };

  // Suggest goals only when helpful (unchanged, just ensure language stays in sync)
  React.useEffect(() => {
    const lastUser = (messages ?? []).slice().reverse().find(m => m.sender === 'user');
    if (!lastUser || !currentAnxietyAnalysis || showSuggestionModal || isTyping) return;

    // keep language aligned to user's last message content
    const detectedLang = detectLanguage(lastUser.text || '');

    setTimeout(() => {
      triggerGoalSuggestion(lastUser.text, currentAnxietyAnalysis);
      // Also consider crisis gate here
      handleMaybeShowCrisis(lastUser.text || '');
    }, 1200);
  }, [messages, currentAnxietyAnalysis, triggerGoalSuggestion, showSuggestionModal, isTyping, languageContext, handleMaybeShowCrisis]);

  return (
    // Use proper viewport height with mobile-safe margins
    <div className="min-h-screen bg-gray-50 flex flex-col relative" style={{ zIndex: 1 }}>
      {/* Header - Fixed height */}
      <div className="flex-shrink-0">
        <ChatHeader
          speechSynthesisSupported={speechSynthesisSupported}
          speechSupported={speechSupported}
          aiCompanion={aiCompanion}
          currentLanguage={languageContext.currentLanguage}
          onToggleMobileChatHistory={() => setShowMobileChatHistory(true)}
        />
      </div>

      {/* Main content - Responsive layout */}
      <div className="flex-1 w-full">
        {/* Desktop Layout */}
        <div className="hidden lg:flex h-full max-w-7xl mx-auto p-4 gap-4">
          {/* Left Column: Avatar + Chat History */}
          <div className="flex flex-col gap-4 w-80 flex-shrink-0 h-[calc(100vh-140px)]">
            {/* Avatar Section - Fixed height */}
            <div className="flex-shrink-0">
              <AvatarSection
                aiCompanion={aiCompanion}
                isAnimating={avatarIsSpeaking || isAnimating}
                isTyping={isTyping}
                currentEmotion={currentEmotion}
                useReadyPlayerMe={useReadyPlayerMe}
                setUseReadyPlayerMe={setUseReadyPlayerMe}
                onStoppedSpeaking={() => { setAvatarIsSpeaking(false); stopSpeaking(); }}
              />
            </div>

            {/* Chat History - Takes remaining height */}
            <div className="flex-1 min-h-0">
              <ChatHistorySidebar
                currentSessionId={sessionId}
                onSessionSelect={handleSessionSelect}
                onNewChat={handleNewChat}
                className="h-full"
              />
            </div>
          </div>

          {/* Right Column: Chat Section */}
          <div className="flex-1 min-w-0 h-[calc(100vh-140px)]">
            <ChatSection
              messages={messages}
              inputText={inputText}
              setInputText={setInputText}
              isTyping={isTyping}
              isAnalyzing={isAnalyzing}
              isListening={isListening}
              speechSupported={speechSupported}
              aiCompanion={aiCompanion}
              currentLanguage={languageContext.currentLanguage}
              scrollRef={scrollRef}
              latestAnalysis={latestAnalysis}
              allAnalyses={allAnalyses}
              onToggleListening={handleToggleListening}
              onSendMessage={() => {
                // Each send: detect language from input to keep voice aligned
                const detectedLang = detectLanguage(inputText);
                handleSendMessage();
              }}
              onKeyPress={handleKeyPress}
              onEditMessage={editMessage}
              onStopSpeaking={stopSpeaking}
              isSpeaking={isSpeaking}
              onShowCrisisResources={() => setShowCrisisModal(true)}
              autoSpeak={autoSpeak}
              onToggleAutoSpeak={() => {
                const newValue = !autoSpeak;
                setAutoSpeak(newValue);
                localStorage.setItem('autoSpeak', String(newValue));
              }}
            />
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden flex flex-col h-[calc(100vh-80px)]">
          {/* Mobile Avatar - Compact version */}
          <div className="flex-shrink-0 p-4 pb-2">
            <AvatarSection
              aiCompanion={aiCompanion}
              isAnimating={avatarIsSpeaking || isAnimating}
              isTyping={isTyping}
              currentEmotion={currentEmotion}
              useReadyPlayerMe={useReadyPlayerMe}
              setUseReadyPlayerMe={setUseReadyPlayerMe}
              onStoppedSpeaking={() => { setAvatarIsSpeaking(false); stopSpeaking(); }}
            />
          </div>

          {/* Mobile Chat Section - Takes remaining height */}
          <div className="flex-1 min-h-0 px-4 pb-4">
            <ChatSection
              messages={messages}
              inputText={inputText}
              setInputText={setInputText}
              isTyping={isTyping}
              isAnalyzing={isAnalyzing}
              isListening={isListening}
              speechSupported={speechSupported}
              aiCompanion={aiCompanion}
              currentLanguage={languageContext.currentLanguage}
              scrollRef={scrollRef}
              latestAnalysis={latestAnalysis}
              allAnalyses={allAnalyses}
              onToggleListening={handleToggleListening}
              onSendMessage={() => {
                // Each send: detect language from input to keep voice aligned
                const detectedLang = detectLanguage(inputText);
                handleSendMessage();
              }}
              onKeyPress={handleKeyPress}
              onEditMessage={editMessage}
              onStopSpeaking={stopSpeaking}
              isSpeaking={isSpeaking}
              onShowCrisisResources={() => setShowCrisisModal(true)}
              autoSpeak={autoSpeak}
              onToggleAutoSpeak={() => {
                const newValue = !autoSpeak;
                setAutoSpeak(newValue);
                localStorage.setItem('autoSpeak', String(newValue));
              }}
            />
          </div>
        </div>
      </div>

      {showSuggestionModal && (
        <GoalSuggestionModal
          isOpen={showSuggestionModal}
          onClose={closeSuggestionModal}
          suggestedGoals={suggestedGoals}
          aiCompanion={aiCompanion}
        />
      )}

      {showCrisisModal && (
        <CrisisResourcesModal
          isOpen={showCrisisModal}
          onClose={() => setShowCrisisModal(false)}
        />
      )}

      {/* Mobile Chat History Modal */}
      {showMobileChatHistory && (
        <div className="fixed inset-0 bg-black/50 z-50 lg:hidden">
          <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white h-full flex flex-col">
            <div className="flex-shrink-0 p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Chat History</h2>
                <button
                  onClick={() => setShowMobileChatHistory(false)}
                  className="p-2 rounded-md hover:bg-gray-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <ChatHistorySidebar
                currentSessionId={sessionId}
                onSessionSelect={handleSessionSelect}
                onNewChat={handleNewChat}
                className="h-full border-0 rounded-none shadow-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatContainer;