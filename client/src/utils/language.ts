export type Lang = 'en' | 'es';

// Very lightweight heuristic; replace with a proper lib if desired.
export const detectLanguage = (text: string): Lang => {
  const s = text.toLowerCase();
  const esHits = ['hola', 'gracias', 'estoy', 'estás', 'necesito', 'ayuda', 'ansiedad', 'ánimo', 'mañana', 'porque', 'qué', 'cómo', 'sí'];
  const count = esHits.reduce((acc, w) => (s.includes(w) ? acc + 1 : acc), 0);
  return count >= 2 ? 'es' : 'en';
};