import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Header } from '../../components/Header';
import { OfflineNotice } from '../../components/OfflineNotice';
import { Card } from '../../components/Card';
import { Colors, Spacing, Radius } from '../../theme';
import { getLocalKings, SeedKingItem } from '../../database/sqlite';

const TABS = ['Obas Lineage', 'Royal Houses', 'Oriki Ogere', 'Heritage Quiz'];

const QUIZ_QUESTIONS = [
  {
    question: 'When was the Ilagere homestead established by warrior prince Olipakala?',
    options: ['1401 A.D.', '1550 A.D.', '1880 A.D.', '1930 A.D.'],
    answer: 0,
    insight: 'Prince Olipakala, an Ile-Ife royal warrior, migrated and settled at Agbele in 1401 A.D., marking the ancient foundation of Ogere Remo.',
  },
  {
    question: 'Who is the legendary deified guardian mother of Ogere Remo and companion of Olipakala?',
    options: ['Queen Moremi', 'Yemogun', 'Madam Tinubu', 'Deity Yemoja'],
    answer: 1,
    insight: 'Yemogun is the revered deified guardian mother of Ogereland who migrated with Olipakala.',
  },
  {
    question: 'Who consolidated the satellite war camps and became the FIRST Ologere of Ogere?',
    options: ['Oba Alfred Babington-Ashaye', 'Oba James Obafemi Saliu', 'Oba Adelana Osifayo (Legunsen I)', 'Oba Oladele Moshood Ogunbade'],
    answer: 2,
    insight: 'Oba Adelana Osifayo (Legunsen I) merged the scattered war camps into a unified town in the c. 1880s, becoming the first official Ologere.',
  },
  {
    question: 'What is the correct, respectful Yoruba greeting for elders in the morning?',
    options: ['Ẹ káàsán', 'Ẹ káàbọ̀', 'Ẹ káàrọ̀', 'Báwo ni'],
    answer: 2,
    insight: '"Ẹ káàrọ̀" is the respectful morning greeting utilizing the plural honorific "Ẹ" to show reverence.',
  },
  {
    question: 'When greeting Kabiyesi the Ologere, what royal praise salute is uttered?',
    options: ['Ẹ kárọ̀!', 'Kábíyèsí!', 'Ẹ kúṣẹ́!', 'Ó dàábọ̀!'],
    answer: 1,
    insight: '"Kábíyèsí!" is the supreme royal salute for Yoruba monarchs, meaning "the king whose authority cannot be questioned."',
  },
];

const RULING_HOUSES = [
  {
    icon: '👑',
    name: 'Kankanbina / Ejigboye Ruling House',
    desc: 'Currently reigning royal house producing HRM Oba James Obafemi Saliu (Kankanbiina II), enthroned in April 2023.',
  },
  {
    icon: '⚔️',
    name: 'Legunsen Ruling House',
    desc: 'The founding royal house. Produced Oba Adelana Osifayo (Legunsen I) and Oba Alfred Obafuwa Babington-Ashaye (Legunsen III, 1945–1982).',
  },
  {
    icon: '🌿',
    name: 'Agbejoye / Fadagbuwa Ruling House',
    desc: 'Produced the legendary monarch Oba Oladele Moshood Ogunbade (Agbejoye II), who reigned for over 38 years (1983–2022).',
  },
  {
    icon: '🏺',
    name: 'Oregunsen Ruling House',
    desc: 'The fourth respected royal dynasty entitled to contest and present candidates for the ancient stool of the Ologere.',
  },
];

const ORIKI_LINES = [
  'Ogere mogbo, Ogere ota, ni le onireke.',
  'Omo Lipakala agbeni madein, re folugboro oloyo poyo, o fi Ori oloyo dakere.',
  'Omo Yemogun atatameti, elebiripo ijimiji, ti sale ko jina, ti toke jinna.',
  'Omo itun epe, agbade sori yan gbendeke.',
  'Omo olowo Joye Meji po, o tun reti eketa.',
  'Omo arojojoye, adele tejiteji. Ojoye titi, o tun je sikuloye.',
  'Borokini dara dele ko to joba, aguntaso lo, olowo ladugbo baba Tinuade.',
  'Ara Ijebu ode, Ijebu Ode-ajagbalura, eyin lomo a fidi pote mole, alagemo merindinlogun.',
  'Omo Lagere, lagboole Iremo, nile Ife Odaaye ni bi ojumo ti n mo wa.',
  'Kabiyeesi alase, igbakeji orisa, didun ni iranti olododo!'
];

export const HeritageScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Obas Lineage');
  const [kings, setKings] = useState<SeedKingItem[]>([]);

  // Heritage Quiz State
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showInsight, setShowInsight] = useState(false);
  const [isQuizFinished, setIsQuizFinished] = useState(false);

  useEffect(() => {
    loadKings();
  }, []);

  const loadKings = async () => {
    const list = await getLocalKings();
    setKings(list);
  };

  const handleSelectOption = (idx: number) => {
    if (showInsight) return;
    setSelectedAnswer(idx);
    setShowInsight(true);
    if (idx === QUIZ_QUESTIONS[currentQuizIndex].answer) {
      setQuizScore(s => s + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuizIndex + 1 < QUIZ_QUESTIONS.length) {
      setCurrentQuizIndex(i => i + 1);
      setSelectedAnswer(null);
      setShowInsight(false);
    } else {
      setIsQuizFinished(true);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuizIndex(0);
    setQuizScore(0);
    setSelectedAnswer(null);
    setShowInsight(false);
    setIsQuizFinished(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="ROYAL HERITAGE" subtitle="Monarchy, Lineage & Oriki" />
      <OfflineNotice />

      {/* Tab Switcher */}
      <View style={styles.tabBar}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
          >
            <Text
              style={[styles.tabText, activeTab === tab && styles.tabTextActive]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === 'Obas Lineage' && (
          <View style={styles.tabSection}>
            <Text style={styles.sectionHeading}>
              Historical Succession of the Ologere of Ogere
            </Text>
            <Text style={styles.sectionSubtitle}>
              Archival records preserved by the Palace of the Ologere and the Ogun State Chieftaincy Council.
            </Text>

            {kings.map((king, idx) => (
              <Card
                key={idx}
                style={[
                  styles.kingCard,
                  king.isCurrent && styles.reigningKingCard,
                ]}
              >
                <View style={styles.kingHeader}>
                  <View
                    style={[
                      styles.kingIconCircle,
                      king.isCurrent && { backgroundColor: Colors.gold },
                    ]}
                  >
                    <Text style={{ fontSize: 20 }}>👑</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    {king.isCurrent && (
                      <View style={styles.reigningPill}>
                        <Text style={styles.reigningPillText}>REIGNING MONARCH</Text>
                      </View>
                    )}
                    <Text style={styles.kingName}>{king.name}</Text>
                    <Text style={styles.kingTitle}>{king.title}</Text>
                    <Text style={styles.kingEra}>Reign: {king.era}</Text>
                  </View>
                </View>

                <View style={styles.houseBadge}>
                  <Text style={styles.houseText}>House: {king.house}</Text>
                </View>

                <Text style={styles.kingNote}>{king.note}</Text>

                {king.oriki && (
                  <View style={styles.kingOriki}>
                    <Text style={styles.kingOrikiTitle}>Personal Oriki:</Text>
                    <Text style={styles.kingOrikiText}>"{king.oriki}"</Text>
                  </View>
                )}
              </Card>
            ))}
          </View>
        )}

        {activeTab === 'Royal Houses' && (
          <View style={styles.tabSection}>
            <Text style={styles.sectionHeading}>The Four Ruling Dynasties</Text>
            <Text style={styles.sectionSubtitle}>
              Traditional royal rotation recognized under the Chiefs Law of Ogun State.
            </Text>

            {RULING_HOUSES.map((house, idx) => (
              <Card key={idx} style={styles.houseCard}>
                <View style={styles.houseHeader}>
                  <Text style={{ fontSize: 28 }}>{house.icon}</Text>
                  <Text style={styles.houseTitle}>{house.name}</Text>
                </View>
                <Text style={styles.houseDesc}>{house.desc}</Text>
              </Card>
            ))}
          </View>
        )}

        {activeTab === 'Oriki Ogere' && (
          <View style={styles.tabSection}>
            <Card style={styles.orikiContainerCard}>
              <View style={styles.orikiHeader}>
                <Text style={styles.orikiTitle}>Oriki Ilu Ogere Remo</Text>
                <Text style={styles.orikiSub}>Traditional Praise Poetry of the Homeland</Text>
              </View>

              <View style={styles.linesWrapper}>
                {ORIKI_LINES.map((line, idx) => (
                  <View key={idx} style={styles.lineRow}>
                    <Text style={styles.lineIndex}>{idx + 1}.</Text>
                    <Text style={styles.lineContent}>{line}</Text>
                  </View>
                ))}
              </View>
            </Card>
          </View>
        )}

        {activeTab === 'Heritage Quiz' && (
          <View style={styles.tabSection}>
            {!isQuizFinished ? (
              <Card style={styles.quizCard}>
                {/* Progress bar and counter */}
                <View style={styles.quizProgressRow}>
                  <Text style={styles.quizProgressText}>
                    QUESTION {currentQuizIndex + 1} OF {QUIZ_QUESTIONS.length}
                  </Text>
                  <Text style={styles.quizScoreCounter}>
                    Score: {quizScore} / {QUIZ_QUESTIONS.length}
                  </Text>
                </View>

                <View style={styles.quizProgressBar}>
                  <View
                    style={[
                      styles.quizProgressFill,
                      {
                        width: `${((currentQuizIndex + 1) / QUIZ_QUESTIONS.length) * 100}%`,
                      },
                    ]}
                  />
                </View>

                {/* Question */}
                <Text style={styles.quizQuestion}>
                  {QUIZ_QUESTIONS[currentQuizIndex].question}
                </Text>

                {/* Options */}
                <View style={styles.optionsList}>
                  {QUIZ_QUESTIONS[currentQuizIndex].options.map((opt, idx) => {
                    const isSelected = selectedAnswer === idx;
                    const isCorrect = idx === QUIZ_QUESTIONS[currentQuizIndex].answer;
                    let btnStyle: any = styles.optionBtn;
                    let textStyle: any = styles.optionBtnText;

                    if (showInsight) {
                      if (isCorrect) {
                        btnStyle = [styles.optionBtn, styles.optionBtnCorrect];
                        textStyle = [styles.optionBtnText, styles.optionTextCorrect];
                      } else if (isSelected) {
                        btnStyle = [styles.optionBtn, styles.optionBtnWrong];
                        textStyle = [styles.optionBtnText, styles.optionTextWrong];
                      }
                    } else if (isSelected) {
                      btnStyle = [styles.optionBtn, styles.optionBtnSelected];
                    }

                    return (
                      <TouchableOpacity
                        key={idx}
                        style={btnStyle}
                        disabled={showInsight}
                        onPress={() => handleSelectOption(idx)}
                      >
                        <Text style={styles.optionIndexPill}>
                          {String.fromCharCode(65 + idx)}
                        </Text>
                        <Text style={textStyle}>{opt}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Insight explanation */}
                {showInsight && (
                  <View style={styles.insightBox}>
                    <Text style={styles.insightTitle}>📜 Ancestral Fact & Insight:</Text>
                    <Text style={styles.insightText}>
                      {QUIZ_QUESTIONS[currentQuizIndex].insight}
                    </Text>

                    <TouchableOpacity
                      style={styles.nextQuestionBtn}
                      onPress={handleNextQuestion}
                    >
                      <Text style={styles.nextQuestionBtnText}>
                        {currentQuizIndex + 1 === QUIZ_QUESTIONS.length
                          ? 'View Royal Results ➔'
                          : 'Next Question ➔'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </Card>
            ) : (
              /* Results Certificate */
              <Card style={styles.certificateCard}>
                <Text style={{ fontSize: 44, textAlign: 'center', marginBottom: 8 }}>👑</Text>
                <Text style={styles.certHeading}>OGERE HERITAGE MERIT</Text>
                <Text style={styles.certTitle}>
                  {quizScore >= 4
                    ? 'Omo Alade Royal Scholar'
                    : quizScore >= 2
                    ? 'Promising Indigene Scholar'
                    : 'Aspiring Cultural Learner'}
                </Text>
                <Text style={styles.certScore}>
                  Final Score: {quizScore} out of {QUIZ_QUESTIONS.length}
                </Text>
                <Text style={styles.certDesc}>
                  {quizScore >= 4
                    ? 'Outstanding mastery of Ologere royal succession, Yoruba customs, and founding history of Ilagere.'
                    : 'Good effort! Continue studying the lineage of our revered Obas and ancient praise poetry.'}
                </Text>

                <TouchableOpacity
                  style={styles.restartBtn}
                  onPress={handleRestartQuiz}
                >
                  <Text style={styles.restartBtnText}>↺ Retake Heritage Quiz</Text>
                </TouchableOpacity>
              </Card>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
    paddingHorizontal: Spacing.md,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  tabSection: {
    gap: 14,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
    lineHeight: 18,
  },
  kingCard: {
    gap: 8,
  },
  reigningKingCard: {
    borderColor: Colors.gold,
    borderWidth: 1.5,
    backgroundColor: '#fffdf5',
  },
  kingHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  kingIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reigningPill: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.gold,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    marginBottom: 4,
  },
  reigningPillText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  kingName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  kingTitle: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  kingEra: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  houseBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  houseText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  kingNote: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  kingOriki: {
    backgroundColor: '#fef3c7',
    padding: 10,
    borderRadius: Radius.sm,
    borderLeftWidth: 3,
    borderLeftColor: Colors.gold,
  },
  kingOrikiTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 4,
  },
  kingOrikiText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#78350f',
    lineHeight: 17,
  },
  houseCard: {
    gap: 8,
  },
  houseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  houseTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    flex: 1,
  },
  houseDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  orikiContainerCard: {
    padding: Spacing.lg,
    backgroundColor: '#064e3b',
  },
  orikiHeader: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    paddingBottom: Spacing.md,
  },
  orikiTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.goldLight,
  },
  orikiSub: {
    fontSize: 12,
    color: '#a7f3d0',
    marginTop: 4,
  },
  linesWrapper: {
    gap: 12,
  },
  lineRow: {
    flexDirection: 'row',
    gap: 10,
  },
  lineIndex: {
    fontSize: 13,
    color: Colors.gold,
    fontWeight: '700',
    width: 22,
  },
  lineContent: {
    flex: 1,
    fontSize: 14,
    color: '#ffffff',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  quizCard: {
    padding: Spacing.md,
    backgroundColor: '#ffffff',
  },
  quizProgressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  quizProgressText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 1,
  },
  quizScoreCounter: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
  },
  quizProgressBar: {
    height: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 14,
  },
  quizProgressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  quizQuestion: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: 22,
    marginBottom: 16,
  },
  optionsList: {
    gap: 10,
    marginBottom: 14,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: Radius.md,
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  optionBtnSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#f0fdf4',
  },
  optionBtnCorrect: {
    borderColor: '#059669',
    backgroundColor: '#ecfdf5',
  },
  optionBtnWrong: {
    borderColor: '#dc2626',
    backgroundColor: '#fef2f2',
  },
  optionIndexPill: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#e2e8f0',
    textAlign: 'center',
    lineHeight: 26,
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
  },
  optionBtnText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
  },
  optionTextCorrect: {
    color: '#047857',
    fontWeight: '800',
  },
  optionTextWrong: {
    color: '#b91c1c',
    fontWeight: '700',
  },
  insightBox: {
    backgroundColor: '#fffdf5',
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#fef3c7',
    marginTop: 6,
  },
  insightTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#b45309',
    marginBottom: 4,
  },
  insightText: {
    fontSize: 12,
    color: '#78350f',
    lineHeight: 17,
    marginBottom: 12,
  },
  nextQuestionBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  nextQuestionBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  certificateCard: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  certHeading: {
    fontSize: 11,
    fontWeight: '900',
    color: Colors.gold,
    letterSpacing: 2,
    marginBottom: 4,
  },
  certTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 8,
  },
  certScore: {
    fontSize: 14,
    fontWeight: '800',
    color: '#059669',
    marginBottom: 8,
  },
  certDesc: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  restartBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: Radius.md,
  },
  restartBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
});
