// mobile/src/screens/heritage/QuizScreen.tsx
// Culture, Royal Lineage & History Quiz for Ogere Remo Mobile App

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme';
import { Header } from '../../components/Header';

interface QuizQuestion {
  question: string;
  options: string[];
  answer: number;
  insight: string;
}

const QUESTIONS: QuizQuestion[] = [
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
    insight: "The Lipakala Day Festival celebrates Prince Olipakala's founding legacy with cultural parades, traditional homage to the palace, and homecoming galas."
  }
];

export const QuizScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const q = QUESTIONS[currentIdx];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOpt(idx);
    setIsAnswered(true);
    if (idx === q.answer) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 < QUESTIONS.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOpt(null);
      setIsAnswered(false);
    } else {
      setIsComplete(true);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOpt(null);
    setIsAnswered(false);
    setScore(0);
    setIsComplete(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="OGERE HERITAGE QUIZ"
        subtitle="Royal Lineage, History & Customary Knowledge"
        onProfilePress={() => navigation.navigate('Profile')}
      />

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
        {isComplete ? (
          <View style={styles.resultCard}>
            <Text style={{ fontSize: 48, textAlign: 'center', marginBottom: 12 }}>
              {score >= 7 ? '👑' : score >= 5 ? '📜' : '🏛️'}
            </Text>
            <Text style={styles.resultTitle}>Quiz Completed!</Text>
            <Text style={styles.scoreText}>
              You scored <Text style={{ color: '#C9963A', fontWeight: '900' }}>{score}</Text> / {QUESTIONS.length}
            </Text>
            <Text style={styles.rankTitle}>
              {score >= 8
                ? '🏅 Royal Scholar of Ogereland'
                : score >= 5
                ? '🎖️ True Cultural Custodian'
                : '📖 Remo Heritage Apprentice'}
            </Text>
            <Text style={styles.resultDesc}>
              {score >= 8
                ? 'Remarkable! You possess deep wisdom and profound mastery of Ogere Remo royal genealogy, foundations, and traditions.'
                : 'Good attempt! Explore the Monarchy and History archives in the Heritage tab to sharpen your mastery.'}
            </Text>

            <TouchableOpacity style={styles.actionBtn} onPress={handleRestart}>
              <Text style={styles.actionBtnText}>🔄 Take Quiz Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {/* Progress indicator */}
            <View style={styles.progressContainer}>
              <Text style={styles.qCounter}>
                Question {currentIdx + 1} of {QUESTIONS.length}
              </Text>
              <Text style={styles.liveScore}>Score: {score}</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${((currentIdx + 1) / QUESTIONS.length) * 100}%` },
                ]}
              />
            </View>

            {/* Question Card */}
            <View style={styles.questionCard}>
              <Text style={styles.questionText}>{q.question}</Text>

              <View style={{ gap: 8, marginTop: 14 }}>
                {q.options.map((opt, idx) => {
                  let btnBg = '#0f172a';
                  let borderColor = '#334155';
                  let textColor = '#cbd5e1';

                  if (isAnswered) {
                    if (idx === q.answer) {
                      btnBg = 'rgba(34, 197, 94, 0.2)';
                      borderColor = '#22c55e';
                      textColor = '#4ade80';
                    } else if (idx === selectedOpt) {
                      btnBg = 'rgba(239, 68, 68, 0.2)';
                      borderColor = '#ef4444';
                      textColor = '#f87171';
                    }
                  } else if (idx === selectedOpt) {
                    btnBg = 'rgba(201, 150, 58, 0.2)';
                    borderColor = '#C9963A';
                  }

                  return (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => handleSelectOption(idx)}
                      disabled={isAnswered}
                      style={[styles.optBtn, { backgroundColor: btnBg, borderColor }]}
                    >
                      <Text style={[styles.optText, { color: textColor }]}>
                        {['A', 'B', 'C', 'D'][idx]}. {opt}
                      </Text>
                      {isAnswered && idx === q.answer && <Text>✅</Text>}
                      {isAnswered && idx === selectedOpt && idx !== q.answer && <Text>❌</Text>}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Historical Insight after answering */}
              {isAnswered && (
                <View style={styles.insightBox}>
                  <Text style={styles.insightHeading}>💡 ROYAL HISTORICAL INSIGHT</Text>
                  <Text style={styles.insightText}>{q.insight}</Text>

                  <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
                    <Text style={styles.nextBtnText}>
                      {currentIdx + 1 === QUESTIONS.length ? '👑 See Final Results' : 'Next Question ➔'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  qCounter: {
    fontSize: 12,
    fontWeight: '800',
    color: '#C9963A',
  },
  liveScore: {
    fontSize: 12,
    fontWeight: '800',
    color: '#cbd5e1',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#1e293b',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#C9963A',
  },
  questionCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  questionText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
    lineHeight: 22,
  },
  optBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  optText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  insightBox: {
    marginTop: 16,
    backgroundColor: 'rgba(201, 150, 58, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(201, 150, 58, 0.3)',
    borderRadius: 8,
    padding: 12,
  },
  insightHeading: {
    fontSize: 10,
    fontWeight: '900',
    color: '#C9963A',
    marginBottom: 4,
  },
  insightText: {
    fontSize: 12,
    color: '#cbd5e1',
    lineHeight: 17,
  },
  nextBtn: {
    marginTop: 12,
    backgroundColor: '#C9963A',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  nextBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#000000',
  },
  resultCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 6,
  },
  scoreText: {
    fontSize: 16,
    color: '#cbd5e1',
    marginBottom: 8,
  },
  rankTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#C9963A',
    marginBottom: 10,
  },
  resultDesc: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  actionBtn: {
    backgroundColor: '#C9963A',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#000000',
  },
});
