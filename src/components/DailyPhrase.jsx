import { useState, useEffect } from 'react';
import { sendOpenRouterMessage } from '../services/openrouter';

const PHRASES = [
  { yo: 'Ẹ káàbọ̀ sí Ogere Remo', en: 'Welcome to Ogere Remo' },
  { yo: 'Báwo ló ṣe rí loni?', en: 'How is it going today?' },
  { yo: 'O ṣéun púpọ̀', en: 'Thank you very much' },
  { yo: 'Kí ló ń ṣẹlẹ̀?', en: 'What is happening?' },
  { yo: 'Ẹ kú iṣẹ́', en: 'Well done on your work' },
  { yo: 'Alafia ni tiwa', en: 'Peace is ours' },
  { yo: 'A ó pàdé lẹ́ẹ̀kan sí i', en: 'We shall meet again' },
  { yo: 'Ilé wa ni yìí', en: 'This is our home' },
  { yo: 'Ọlọ́run àgbè', en: 'God the farmer (Yoruba praise)' },
  { yo: 'Ògéréńdéńdé lóko', en: 'Evergreen farmlands' },
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
        <span style={{ fontSize: '1rem' }}>🗣️</span>
        <span className="playfair" style={{ fontSize: '.85rem', fontStyle: 'italic', color: '#F0D080' }}>
          {phrase.raw ? phrase.yo : `"${phrase.yo}"`}
        </span>
        {!phrase.raw && (
          <span style={{ fontSize: '.72rem', color: 'rgba(245,237,216,.4)' }}>— {phrase.en}</span>
        )}
      </div>
    </div>
  );
}