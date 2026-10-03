import { useState, useEffect } from 'react';
import { sendOpenRouterMessage } from '../services/openrouter';

const PHRASES = [
  { yo: 'áº¸ kÃ¡Ã bá»Ì€ sÃ­ Ogere Remo', en: 'Welcome to Ogere Remo' },
  { yo: 'BÃ¡wo lÃ³ á¹£e rÃ­ loni?', en: 'How is it going today?' },
  { yo: 'O á¹£Ã©un pÃºpá»Ì€', en: 'Thank you very much' },
  { yo: 'KÃ­ lÃ³ Å„ á¹£áº¹láº¹Ì€?', en: 'What is happening?' },
  { yo: 'áº¸ kÃº iá¹£áº¹Ì', en: 'Well done on your work' },
  { yo: 'Alafia ni tiwa', en: 'Peace is ours' },
  { yo: 'A Ã³ pÃ dÃ© láº¹Ìáº¹Ì€kan sÃ­ i', en: 'We shall meet again' },
  { yo: 'IlÃ© wa ni yÃ¬Ã­', en: 'This is our home' },
  { yo: 'á»Œlá»Ìrun Ã gbÃ¨', en: 'God the farmer (Yoruba praise)' },
  { yo: 'Ã’gÃ©rÃ©Å„dÃ©Å„dÃ© lÃ³ko', en: 'Evergreen farmlands' },
];

export default function DailyPhrase() {
  const [phrase, setPhrase] = useState(null);
  const [loading, setLoading] = useState(true);
  const day = new Date().toDateString();

  useEffect(() => {
    const cached = sessionStorage.getItem('ogere-phrase');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.day === day) {
        setPhrase(parsed);
        setLoading(false);
        return;
      }
    }
    (async () => {
      const msg = await sendOpenRouterMessage(
        'You are a Yoruba language tutor. Generate a random authentic Yoruba greeting or proverb with its English translation. Format your response exactly like this: "Yoruba: [yoruba text] | English: [english translation]". Do not use markdown. Keep it family-friendly and positive.',
        `Generate a Yoruba phrase for ${day}.`
      );
      if (msg) {
        const p = { day, yo: msg, en: '', raw: true };
        setPhrase(p);
        sessionStorage.setItem('ogere-phrase', JSON.stringify(p));
      } else {
        const fallback = PHRASES[Math.floor(Math.random() * PHRASES.length)];
        setPhrase({ day, ...fallback });
      }
      setLoading(false);
    })();
  }, [day]);

  if (loading || !phrase) return null;

  return (
    <div style={{ padding: '.6rem 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '1rem' }}>ðŸ—£ï¸</span>
        <span className="playfair" style={{ fontSize: '.85rem', fontStyle: 'italic', color: '#F0D080' }}>
          {phrase.raw ? phrase.yo : `"${phrase.yo}"`}
        </span>
        {!phrase.raw && (
          <span style={{ fontSize: '.72rem', color: 'rgba(245,237,216,.4)' }}>â€” {phrase.en}</span>
        )}
      </div>
    </div>
  );
}