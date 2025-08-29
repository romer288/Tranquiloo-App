
import { ClaudeAnxietyAnalysis } from '@/utils/claudeAnxietyAnalysis';
import { FallbackAnxietyAnalysis } from '@/utils/anxiety/types';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'vanessa' | 'monica';
  timestamp: Date;
  anxietyAnalysis?: ClaudeAnxietyAnalysis | FallbackAnxietyAnalysis;
}

export type AICompanion = 'vanessa' | 'monica';
export type Language = 'en' | 'es';
