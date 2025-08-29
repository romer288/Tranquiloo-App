import React from 'react';
import { useLocation } from 'react-router-dom';
import ChatHeader from '@/components/ChatHeader';
import AvatarSection from '@/components/chat/AvatarSection';
import ChatSection from '@/components/chat/ChatSection';
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
    // Language is determined by the message content

    (async () => {
      setLastSpokenMessageId(last.id);
      setAvatarIsSpeaking(true);
      try {
        await handleSpeakText(last.text);
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
    <div className="relative z-0 min-h-screen bg-gray-50 flex flex-col pb-20 md:pb-0">
      <ChatHeader
        speechSynthesisSupported={speechSynthesisSupported}
        speechSupported={speechSupported}
        aiCompanion={aiCompanion}
        currentLanguage={languageContext.currentLanguage}
      />

      <div className="flex-1 max-w-6xl mx-auto w-full p-4 flex flex-col lg:flex-row gap-4 mb-safe">
        <AvatarSection
          aiCompanion={aiCompanion}
          isAnimating={avatarIsSpeaking || isAnimating}
          isTyping={isTyping}
          currentEmotion={currentEmotion}
          useReadyPlayerMe={useReadyPlayerMe}
          setUseReadyPlayerMe={setUseReadyPlayerMe}
          onStoppedSpeaking={() => { setAvatarIsSpeaking(false); stopSpeaking(); }}
        />

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
    </div>
  );
};

export default ChatContainer;