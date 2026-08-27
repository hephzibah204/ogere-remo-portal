import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import AdireDivider from '../components/AdireDivider';
import Section from '../components/Section';
import SEO from '../components/SEO';
import { dbGetAll, dbInsert } from '../services/db';

const QUESTIONS = [
  {
    question: "When was the Ilagere homestead established by the warrior prince Olipakala?",
    options: ["1401 A.D.", "1550 A.D.", "1880 A.D.", "1930 A.D."],
    answer: 0,
    insight: "Prince Olipakala, an Ile-Ife royal warrior, migrated and settled at Agbele, establishing the homestead in 1401 A.D. This marked the ancient foundation of Ogere Remo."
  },
  {
    question: "Who is the legendary deified guardian mother of Ogere Remo and royal companion of Olipakala?",
    options: ["Queen Moremi", "Yemogun", "Madam Tinubu", "Deity Yemoja"],
    answer: 1,
    insight: "Yemogun is the deified guardian mother of Ogereland who migrated with Olipakala. Her sacred shrine and memory are highly revered in Ogere Remo."
  },
  {
    question: "Faced with Yoruba Wars, who consolidated the satellite settlements and became the FIRST Ologere of Ogere?",
    options: ["Oba Alfred Babington-Ashaye", "Oba James Obafemi Saliu", "Oba Adelana Osifayo (Legunsen I)", "Oba Oladele Moshood Ogunbade"],
    answer: 2,
    insight: "Oba Adelana Osifayo (Legunsen I) merged the scattered war camps and compounds into a unified town in the c. 1880s, becoming the first official Ologere."
  },
  {
    question: "What is the correct, respectful Yoruba greeting for elders in the morning?",
    options: ["Ẹ káàsán", "Ẹ káàbọ̀", "Ẹ káàrọ̀", "Báwo ni"],
    answer: 2,
    insight: "\"Ẹ káàrọ̀\" is the respectful morning greeting, utilizing the plural honorific \"Ẹ\" to show deep reverence, a core pillar of Yoruba moral heritage."
  },
  {
    question: "Which global spiritual institution was founded in Ogere Remo on July 27, 1930 by Prophet Josiah Ositelu?",
    options: ["Redeemed Christian Church of God", "The Church of the Lord (Aladura) Worldwide", "Christ Apostolic Church", "Celestial Church of Christ"],
    answer: 1,
    insight: "Prophet Josiah Olunowo Ositelu founded the Church of the Lord (Aladura) Worldwide at the Lisa compound in Ogere. It has since spread across the globe."
  },
  {
    question: "Which distinguished Ologere met Her Majesty Queen Elizabeth II during her royal visit to Nigeria in 1956?",
    options: ["Oba Alfred Obafuwa Babington-Ashaye (Legunsen III)", "Oba Adelana Osifayo", "Oba Oladele Moshood Ogunbade", "Oba James Obafemi Saliu"],
    answer: 0,
    insight: "Oba Alfred Babington-Ashaye (Legunsen III) met Queen Elizabeth II in 1956, marking a legendary diplomatic highlight in Ogere's history."
  },
  {
    question: "What natural physical landmark provided defensive fortification for the early ancestors of Ogere?",
    options: ["A volcanic crater lake", "The Hills of Ogere (Agbele Heights)", "A massive river delta", "A deep rainforest valley"],
    answer: 1,
    insight: "The towering Hills of Ogere (Agbele Heights) served as an invincible, high-altitude war camp and shelter for founding ancestors during tribal conflicts."
  },
  {
    question: "Who was the longest-reigning modern Ologere of Ogere Remo, ruling peacefully for 38 years?",
    options: ["Oba James Obafemi Saliu", "Oba Adelana Osifayo", "Oba Oladele Moshood Ogunbade (Agbejoye II)", "Oba Alfred Babington-Ashaye"],
    answer: 2,
    insight: "Oba Oladele Moshood Ogunbade (Agbejoye II) ascended the throne in December 1983 and guided Ogere through 38 years of modernization and growth until 2022."
  },
  {
    question: "What primary annual carnival unites all Ogere indigenes to celebrate their common ancestral heritage?",
    options: ["Eyo Festival", "Lipakala Day Festival", "Ojude Oba Festival", "Lisabi Day Festival"],
    answer: 1,
    insight: "Lipakala Day (Olipakala Festival) is the primary annual cultural carnival celebrating founding prince Olipakala, bringing indigenes together from all over the world."
  },
  {
    question: "When greeting the Ologere, what royal praise salute is uttered to show respect to the king's supreme authority?",
    options: ["Ẹ kárọ̀!", "Kábíyèsí!", "Ẹ kúṣẹ́!", "Ó dàábọ̀!"],
    answer: 1,
    insight: "\"Kábíyèsí!\" is the supreme royal salute for Yoruba monarchs, meaning \"the king whose authority cannot be questioned.\""
  }
];

export default function QuizPage() {
  const [userName, setUserName] = useState('');
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [hoveredOpt, setHoveredOpt] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const certRef = useRef(null);

  useEffect(() => {
    (async () => {
      const data = await dbGetAll('quiz_leaderboard');
      if (data && Array.isArray(data)) {
        setLeaderboard(data.sort((a, b) => b.score - a.score).slice(0, 5));
      }
    })();
  }, []);

  const handleStartQuiz = (e) => {
    e.preventDefault();
    if (!userName.trim()) {
      setErrorMsg('Please enter your name to claim your digital certificate.');
      return;
    }
    setErrorMsg('');
    setQuizStarted(true);
  };

  const handleAnswerSelect = (optIdx) => {
    if (showExplanation) return;
    setSelectedOpt(optIdx);
    setShowExplanation(true);
    if (optIdx === QUESTIONS[currentIdx].answer) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = async () => {
    setSelectedOpt(null);
    setShowExplanation(false);
    if (currentIdx + 1 < QUESTIONS.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setQuizCompleted(true);
      await dbInsert('quiz_leaderboard', {
        name: userName || 'Ogere Scholar',
        score: (score + (selectedOpt === QUESTIONS[currentIdx]?.answer ? 1 : 0)) * 10,
        date: new Date().toLocaleDateString('en-NG'),
        passed: (score + (selectedOpt === QUESTIONS[currentIdx]?.answer ? 1 : 0)) >= 7,
      });
      const data = await dbGetAll('quiz_leaderboard');
      if (data) setLeaderboard(data.sort((a, b) => b.score - a.score).slice(0, 5));
    }
  };

  const handlePrintCertificate = () => {
    const el = certRef.current;
    if (!el) return;
    const win = window.open('', '_blank');
    win.document.write(`<html><head><title>Ogere Heritage Custodian Certificate - ${userName}</title>
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
      <style>body{margin:0;background:#F5EDD8;display:flex;justify-content:center;align-items:center;min-height:100vh;}
      @media print{body{background:#F5EDD8;}}</style>
      </head><body>${el.outerHTML}</body></html>`);
    win.document.close();
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  const resetQuiz = () => {
    setCurrentIdx(0);
    setSelectedOpt(null);
    setScore(0);
    setShowExplanation(false);
    setQuizCompleted(false);
    setQuizStarted(false);
    setUserName('');
  };

  const activeQ = QUESTIONS[currentIdx];
  const passed = score >= 7;

  return (
    <div>
      <SEO title="Cultural Heritage Quiz" description="Test your knowledge of the 600-year history, Yoruba phrases, and dynastic monarchy of Ogere Remo, Ogun State." />
      <Hero ey="Interactive Heritage Trivia" ti="Ogere Remo Cultural Quiz" sub="How well do you know the history, monarchy, ancestors, and traditions of Ogereland? Test your knowledge and earn your digital Custodian Certificate." />
      <AdireDivider />

      <Section bg="#1a0d06" py="4rem">
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          
          {/* STATE 1: Splash Welcome Screen */}
          {!quizStarted && !quizCompleted && (
            <div style={{
              background: 'rgba(201,150,58,.04)',
              border: '1px solid rgba(201,150,58,.2)',
              borderTop: '4px solid #C9963A',
              padding: '2.5rem 2rem',
              borderRadius: 6,
              textAlign: 'center',
              boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
              animation: 'fadeUp 0.5s ease both'
            }}>
              <span className="tag tag-gold" style={{ fontSize: '.58rem', marginBottom: '1rem' }}>📜 Challenge of the Ancestors</span>
              <h2 className="playfair" style={{ fontSize: '1.8rem', color: '#F5EDD8', margin: '0 0 1rem' }}>Test Your Heritage Knowledge</h2>
              <p style={{ fontSize: '0.88rem', color: 'rgba(245,237,216,.7)', lineHeight: 1.7, marginBottom: '2rem', maxWidth: '580px', margin: '0 auto 2rem' }}>
                Embark on a ten-question journey across the centuries—from the legendary founding in 1401 A.D. by Prince Olipakala, through our global Aladura history, to modern royalty and respectful Yoruba phrases. Score <strong>70% or higher</strong> to claim your personalized virtual <strong>Ogere Remo Heritage Custodian Certificate</strong>.
              </p>

              <form onSubmit={handleStartQuiz} style={{ display: 'grid', gap: '1.2rem', maxWidth: '420px', margin: '0 auto' }}>
                <div style={{ textAlign: 'left' }}>
                  <label htmlFor="user-name" className="cinzel" style={{ fontSize: '0.55rem', letterSpacing: '.12em', color: '#C9963A', display: 'block', marginBottom: '0.5rem' }}>
                    Enter Your Name for the Certificate:
                  </label>
                  <input
                    id="user-name"
                    type="text"
                    className="inp"
                    placeholder="e.g. Adewale Babington-Ashaye"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    style={{ textAlign: 'center', borderRadius: 3 }}
                  />
                  {errorMsg && (
                    <div style={{ color: '#E53E3E', fontSize: '0.75rem', marginTop: '0.5rem', fontFamily: 'sans-serif' }}>
                      ⚠️ {errorMsg}
                    </div>
                  )}
                </div>
                
                <button type="submit" className="btn-p" style={{ padding: '1rem 2rem', borderRadius: 4 }}>
                  Begin Heritage Quest 🛡️
                </button>
              </form>
            </div>
          )}

          {/* STATE 2: Quiz In-Progress */}
          {quizStarted && !quizCompleted && (
            <div style={{ animation: 'fadeUp 0.4s ease both' }}>
              {/* Progress Bar Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.6rem' }}>
                <span className="cinzel" style={{ fontSize: '0.55rem', letterSpacing: '.12em', color: 'rgba(245,237,216,.5)' }}>
                  Assessment Progress: Question {currentIdx + 1} of {QUESTIONS.length}
                </span>
                <span className="tag tag-terra" style={{ fontSize: '.5rem', margin: 0 }}>
                  Current Score: {score}
                </span>
              </div>
              
              {/* Progress bar line */}
              <div style={{ height: '5px', background: 'rgba(201,150,58,.1)', borderRadius: '3px', width: '100%', marginBottom: '2.5rem', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #7A2E0E, #C9963A)',
                  width: `${((currentIdx + 1) / QUESTIONS.length) * 100}%`,
                  transition: 'width 0.3s ease-in-out'
                }} />
              </div>

              {/* Question Box */}
              <div style={{
                background: 'rgba(44,26,14,.6)',
                border: '1px solid rgba(201,150,58,.25)',
                borderLeft: '4px solid #C9963A',
                padding: '1.8rem 2rem',
                borderRadius: 4,
                marginBottom: '2rem',
                boxShadow: '0 6px 20px rgba(0,0,0,0.2)'
              }}>
                <h3 className="playfair" style={{ fontSize: '1.25rem', color: '#F5EDD8', lineHeight: 1.5, margin: 0, fontWeight: 500 }}>
                  {activeQ.question}
                </h3>
              </div>

              {/* Multiple Choice Cards */}
              <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
                {activeQ.options.map((opt, oIdx) => {
                  const isCorrect = oIdx === activeQ.answer;
                  const isSelected = oIdx === selectedOpt;
                  
                  // Styling variables
                  let bg = 'rgba(201,150,58,.04)';
                  let border = '1px solid rgba(201,150,58,.18)';
                  let color = '#F5EDD8';
                  let cursor = 'pointer';
                  let transform = 'none';

                  if (showExplanation) {
                    cursor = 'default';
                    if (isCorrect) {
                      bg = 'rgba(56,161,105,.18)';
                      border = '2px solid #38a169';
                      color = '#a8d88e';
                    } else if (isSelected) {
                      bg = 'rgba(229,62,62,.18)';
                      border = '2px solid #e53e3e';
                      color = '#f5a4a4';
                    } else {
                      bg = 'rgba(13,7,4,.4)';
                      border = '1px solid rgba(201,150,58,.05)';
                      color = 'rgba(245,237,216,.35)';
                    }
                  } else {
                    // Hover effects
                    if (hoveredOpt === oIdx) {
                      bg = 'rgba(201,150,58,.12)';
                      border = '1px solid #C9963A';
                      transform = 'translateY(-2px)';
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleAnswerSelect(oIdx)}
                      onMouseEnter={() => !showExplanation && setHoveredOpt(oIdx)}
                      onMouseLeave={() => setHoveredOpt(null)}
                      disabled={showExplanation}
                      style={{
                        background: bg,
                        border: border,
                        color: color,
                        padding: '1.1rem 1.5rem',
                        borderRadius: 4,
                        textAlign: 'left',
                        cursor: cursor,
                        fontSize: '0.9rem',
                        fontFamily: 'inherit',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        transform: transform,
                        transition: 'all 0.25s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {/* Option prefix (A, B, C, D) */}
                        <span className="cinzel" style={{
                          width: 25,
                          height: 25,
                          borderRadius: '50%',
                          background: isSelected ? '#C9963A' : 'rgba(201,150,58,.15)',
                          color: isSelected ? '#1a0d06' : '#C9963A',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '.62rem',
                          fontWeight: 'bold',
                          flexShrink: 0
                        }}>
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span>{opt}</span>
                      </div>

                      {/* Diagnostic Status Indicator */}
                      {showExplanation && (
                        <span>
                          {isCorrect && '🟢 Correct'}
                          {!isCorrect && isSelected && '🔴 Incorrect'}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* STATE 2B: Cultural Insight Box (pops up after choice) */}
              {showExplanation && (
                <div style={{
                  background: 'rgba(201,150,58,.04)',
                  border: '1px solid rgba(201,150,58,.3)',
                  borderLeft: '4px solid #C9963A',
                  padding: '1.5rem 1.8rem',
                  borderRadius: 4,
                  marginBottom: '2.5rem',
                  boxShadow: '0 6px 15px rgba(0,0,0,0.3)',
                  animation: 'fadeUp 0.3s ease both'
                }}>
                  <div className="cinzel" style={{ fontSize: '.55rem', letterSpacing: '.12em', color: '#C9963A', textTransform: 'uppercase', marginBottom: '.4rem' }}>
                    💡 Cultural Insight
                  </div>
                  <p style={{ fontSize: '0.82rem', lineHeight: 1.7, color: 'rgba(245,237,216,.75)', margin: '0 0 1.2rem' }}>
                    {activeQ.insight}
                  </p>
                  
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={handleNext} className="btn-p" style={{ padding: '.65rem 1.5rem', fontSize: '.58rem', borderRadius: 3 }}>
                      {currentIdx + 1 < QUESTIONS.length ? 'Next Question ➔' : 'Complete Quest ➔'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STATE 3: Quiz Finished Results Screen */}
          {quizCompleted && (
            <div style={{ animation: 'fadeUp 0.6s ease both', textAlign: 'center' }}>
              
              {/* Summary Header */}
              <div style={{
                background: 'rgba(201,150,58,.04)',
                border: '1px solid rgba(201,150,58,.2)',
                padding: '2rem',
                borderRadius: 6,
                marginBottom: '2rem',
                boxShadow: '0 8px 25px rgba(0,0,0,0.3)'
              }}>
                <span className="tag tag-gold" style={{ fontSize: '.56rem', marginBottom: '0.8rem' }}>Quest Concluded</span>
                <h2 className="playfair" style={{ fontSize: '1.8rem', color: '#F5EDD8', margin: '0 0 .5rem' }}>
                  {passed ? '🎉 Congratulations, Heritage Custodian!' : '📚 Keep Learning, Future Custodian!'}
                </h2>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: passed ? '#C9963A' : '#B5451B', margin: '1rem 0' }}>
                  {score} / {QUESTIONS.length}
                </div>
                <p style={{ fontSize: '0.88rem', color: 'rgba(245,237,216,.7)', lineHeight: 1.6, maxWidth: '580px', margin: '0 auto' }}>
                  {passed 
                    ? `Excellent job, ${userName}! You scored ${score * 10}% and proved yourself a true guardian of Ogereland's heritage. Your personalized certificate has been generated below.`
                    : `You scored ${score * 10}%. Review the Dynastic Timeline of Kings and the Royal Oriki praise poems to deepen your understanding of Ogere's 600-year history, then try again to claim your credentials.`
                  }
                </p>
              </div>

              {/* STATE 3A: Show Custodian Certificate if scored >= 70% */}
              {passed && (
                <div style={{ display: 'grid', gap: '1.5rem', marginBottom: '3rem' }}>
                  <div
                    ref={certRef}
                    style={{
                      background: '#F9F6EE',
                      border: 'clamp(4px, 1.5vw, 10px) double #C9963A',
                      padding: 'clamp(1.2rem, 3.5vw, 2.5rem)',
                      color: '#2C1A0E',
                      borderRadius: '8px',
                      textAlign: 'center',
                      position: 'relative',
                      boxShadow: '0 12px 35px rgba(0,0,0,0.6)',
                      maxWidth: '100%',
                      boxSizing: 'border-box'
                    }}
                  >
                    {/* Ornate corner borders */}
                    <div style={{ position: 'absolute', top: 10, left: 10, fontSize: '1.2rem', color: '#C9963A' }}>⚜️</div>
                    <div style={{ position: 'absolute', top: 10, right: 10, fontSize: '1.2rem', color: '#C9963A' }}>⚜️</div>
                    <div style={{ position: 'absolute', bottom: 10, left: 10, fontSize: '1.2rem', color: '#C9963A' }}>⚜️</div>
                    <div style={{ position: 'absolute', bottom: 10, right: 10, fontSize: '1.2rem', color: '#C9963A' }}>⚜️</div>

                    {/* Seal */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.2rem' }}>
                      <svg width="85" height="85" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="50" cy="50" r="45" stroke="#C9963A" strokeWidth="2.5" fill="rgba(201,150,58,0.06)" />
                        <circle cx="50" cy="50" r="41" stroke="#C9963A" strokeWidth="0.8" strokeDasharray="3 3" />
                        {/* Crown Icon */}
                        <path d="M30 65 L35 42 L50 55 L65 42 L70 65 Z" fill="#C9963A" />
                        <circle cx="35" cy="40" r="2.5" fill="#7A2E0E" />
                        <circle cx="50" cy="53" r="2.5" fill="#7A2E0E" />
                        <circle cx="65" cy="40" r="2.5" fill="#7A2E0E" />
                        <rect x="33" y="65" width="34" height="5" fill="#7A2E0E" rx="1.5" />
                        {/* Curved path for text */}
                        <path id="sealPath" d="M 22 35 A 33 33 0 0 1 78 35" fill="none" />
                        <text fill="#C9963A" fontSize="5.5" fontWeight="bold" letterSpacing="0.8">
                          <textPath href="#sealPath" startOffset="50%" textAnchor="middle">
                            OLOGERE PALACE SEAL
                          </textPath>
                        </text>
                      </svg>
                    </div>

                    <h2 className="cinzel" style={{ fontSize: '1.35rem', letterSpacing: '.12em', color: '#7A2E0E', margin: '0 0 .4rem', fontWeight: 700 }}>
                      CERTIFICATE OF CUSTODIANSHIP
                    </h2>
                    <p className="cinzel" style={{ fontSize: '0.58rem', letterSpacing: '.18em', color: '#C9963A', margin: '0 0 1.5rem', fontWeight: 600 }}>
                      OGERE REMO CULTURAL HERITAGE
                    </p>
                    
                    <p style={{ fontSize: '0.8rem', fontStyle: 'italic', margin: '0 0 0.8rem', color: '#554433', fontFamily: 'serif' }}>
                      This is to solemnly certify that
                    </p>
                    
                    <h3 className="playfair" style={{ fontSize: '1.8rem', color: '#7A2E0E', margin: '0 0 1rem', textDecoration: 'underline', textUnderlineOffset: '6px', textDecorationColor: '#C9963A', fontWeight: 700 }}>
                      {userName}
                    </h3>
                    
                    <p style={{ fontSize: '0.8rem', lineHeight: 1.6, maxWidth: '540px', margin: '0 auto 1.8rem', color: '#332211', fontFamily: 'serif' }}>
                      has successfully demonstrated exceptional historical proficiency, scoring <strong>{score * 10}% ({score}/10)</strong> on the comprehensive Ogere Remo Heritage Assessment. By virtue of this deep knowledge of the 600-year dynastic lineages, deified protectors, global milestones, and traditional Yoruba dialogues, they are hereby designated a:
                    </p>
                    
                    <div style={{
                      background: 'rgba(201,150,58,0.08)',
                      border: '1px solid rgba(201,150,58,0.4)',
                      display: 'inline-block',
                      padding: '0.5rem 1.8rem',
                      borderRadius: '4px',
                      marginBottom: '2.5rem'
                    }}>
                      <span className="cinzel" style={{ fontSize: '0.88rem', fontWeight: 'bold', color: '#7A2E0E', letterSpacing: '0.08em' }}>
                        🛡️ HERITAGE CUSTODIAN
                      </span>
                    </div>

                    {/* Signatures */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 1rem', flexWrap: 'wrap', gap: '1.5rem' }}>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '0.62rem', fontFamily: 'monospace', color: '#C9963A', marginBottom: '0.2rem' }}>Virtually Verified</div>
                        <div style={{ borderTop: '1px solid rgba(122,46,14,0.3)', width: '130px', paddingTop: '0.3rem', fontSize: '0.58rem', color: '#554433', fontFamily: 'serif' }}>
                          Ogere Royal Archive Board
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: '0.92rem', color: '#7A2E0E', marginBottom: '0.1rem', fontWeight: 600 }}>
                          Oba James O. Saliu
                        </div>
                        <div style={{ borderTop: '1px solid rgba(122,46,14,0.3)', width: '160px', paddingTop: '0.3rem', fontSize: '0.58rem', color: '#554433', fontFamily: 'serif' }}>
                          <strong>Kankanbiina II</strong><br />Ologere of Ogere Remo
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                      onClick={handlePrintCertificate}
                      className="btn-p"
                      style={{ fontSize: '.68rem', borderRadius: 4 }}
                    >
                      🖨️ Print / Save Official Certificate
                    </button>
                    <button onClick={resetQuiz} className="btn-o" style={{ fontSize: '.68rem', borderRadius: 4 }}>
                      🔄 Replay Quiz
                    </button>
                  </div>
                </div>
              )}

              {/* STATE 3B: Quiz Failed Actions */}
              {!passed && (
                <div style={{ display: 'grid', gap: '1.5rem', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <Link to="/timeline" className="btn-p" style={{ fontSize: '.58rem', textDecoration: 'none', display: 'flex', alignItems: 'center', borderRadius: 4 }}>
                      👑 Study Dynastic Timeline
                    </Link>
                    <Link to="/oriki" className="btn-p" style={{ fontSize: '.58rem', textDecoration: 'none', display: 'flex', alignItems: 'center', background: '#7A2E0E', borderRadius: 4 }}>
                      🎵 Listen to Royal Oriki
                    </Link>
                  </div>
                  <div>
                    <button onClick={resetQuiz} className="btn-o" style={{ fontSize: '.58rem', borderRadius: 4, width: '200px' }}>
                      🔄 Try Again
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </Section>
      <AdireDivider />
    </div>
  );
}
