import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Colors, Spacing, Radius } from '../../theme';

interface ForumTopic {
  id: string;
  title: string;
  author: string;
  category: string;
  timeAgo: string;
  upvotes: number;
  commentsCount: number;
  content: string;
  hasUpvoted?: boolean;
}

const SEED_TOPICS: ForumTopic[] = [
  {
    id: 'FRM-1',
    title: 'Solar Streetlighting Expansion: Priority for Ijana and Wasimi Quarters',
    author: 'Engr. Babatunde Sowemimo',
    category: 'Infrastructure',
    timeAgo: '2 hours ago',
    upvotes: 42,
    commentsCount: 14,
    content: 'The recent solar installations near the palace have greatly reduced evening petty crime. Can we propose extending this to the Ijana and Wasimi access corridors in the upcoming OCDA budget review?',
  },
  {
    id: 'FRM-2',
    title: 'Youth Vocational Hub & Adire Fabric Apprenticeship Center',
    author: 'Chief Mrs. Olufunke Adeleke',
    category: 'Youth & Skills',
    timeAgo: '5 hours ago',
    upvotes: 68,
    commentsCount: 23,
    content: 'Ogere Remo has a rich history of textile weaving and Adire indigo dyeing. Establishing a certified vocational center will train our secondary school leavers and attract export buyers from Lagos.',
  },
  {
    id: 'FRM-3',
    title: 'Digitizing Family Land Boundaries to Prevent Chieftaincy & Boundary Disputes',
    author: 'Prince Olawale Babatunde',
    category: 'Land & Governance',
    timeAgo: '1 day ago',
    upvotes: 55,
    commentsCount: 19,
    content: 'Every family compound should submit their ancestral survey coordinates to the new Palace Digital Cadastre so that future generations inherit clear title deeds without court litigation.',
  },
  {
    id: 'FRM-4',
    title: 'Neighbourhood Watch Patrol Coordination with NPF Divisional HQ',
    author: 'Commander Kayode',
    category: 'Security',
    timeAgo: '2 days ago',
    upvotes: 89,
    commentsCount: 31,
    content: 'We need all landlords and agbole heads to register their private vigilante guards with the palace security terminal so emergency distress signals route through a unified command network.',
  },
];

const CATEGORIES = ['All Topics', 'Infrastructure', 'Youth & Skills', 'Land & Governance', 'Security'];

export const ForumScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [topics, setTopics] = useState<ForumTopic[]>(SEED_TOPICS);
  const [selectedCategory, setSelectedCategory] = useState('All Topics');
  const [selectedTopic, setSelectedTopic] = useState<ForumTopic | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);

  // New post form
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('Infrastructure');
  const [newAuthor, setNewAuthor] = useState('');

  // Comment inside topic modal
  const [commentText, setCommentText] = useState('');
  const [commentsList, setCommentsList] = useState<string[]>([
    'Chief Oladipo: Fully supported! We will table this at the next Council of Chiefs.',
    'Sister Funmi: Very thoughtful proposal. How do youth apply for the vocational phase?',
    'Youth Leader Segun: Excellent initiative! The youth wing is ready to mobilize volunteers.',
  ]);

  const filteredTopics = topics.filter(
    t => selectedCategory === 'All Topics' || t.category === selectedCategory
  );

  const handleToggleUpvote = (topicId: string) => {
    setTopics(
      topics.map(t => {
        if (t.id === topicId) {
          const hasUpvoted = t.hasUpvoted;
          return {
            ...t,
            upvotes: hasUpvoted ? t.upvotes - 1 : t.upvotes + 1,
            hasUpvoted: !hasUpvoted,
          };
        }
        return t;
      })
    );
  };

  const handleCreateTopic = () => {
    if (!newTitle || !newContent) {
      Alert.alert('Required', 'Please fill in both the discussion title and your proposal.');
      return;
    }

    const newTopic: ForumTopic = {
      id: `FRM-${Date.now().toString().slice(-4)}`,
      title: newTitle,
      author: newAuthor || 'Verified Community Member',
      category: newCategory,
      timeAgo: 'Just now',
      upvotes: 1,
      commentsCount: 0,
      content: newContent,
      hasUpvoted: true,
    };

    setTopics([newTopic, ...topics]);
    setShowNewModal(false);
    setNewTitle('');
    setNewContent('');
    setNewAuthor('');

    Alert.alert('Topic Created', 'Your proposal has been published on the Ogere Civic Town Hall forum.');
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    setCommentsList([...commentsList, `Citizen: ${commentText.trim()}`]);
    setCommentText('');
    if (selectedTopic) {
      setTopics(
        topics.map(t =>
          t.id === selectedTopic.id ? { ...t, commentsCount: t.commentsCount + 1 } : t
        )
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="TOWN HALL FORUM"
        subtitle="Civic Dialogue & Community Proposals"
        showBack
        onBack={() => navigation.goBack()}
      />

      {/* Category Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            onPress={() => setSelectedCategory(cat)}
            style={[
              styles.categoryPill,
              selectedCategory === cat && styles.categoryPillActive,
            ]}
          >
            <Text
              style={[
                styles.categoryPillText,
                selectedCategory === cat && styles.categoryPillTextActive,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Banner */}
        <View style={styles.bannerBox}>
          <Text style={{ fontSize: 24 }}>🏛️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Democratic Town Hall Deliberations</Text>
            <Text style={styles.bannerSub}>
              Propose projects, debate communal initiatives, and vote on community priorities.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.newTopicBtn}
            onPress={() => setShowNewModal(true)}
          >
            <Text style={styles.newTopicBtnText}>+ New Topic</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionHeading}>
          Active Deliberations ({filteredTopics.length})
        </Text>

        {filteredTopics.map(topic => (
          <Card
            key={topic.id}
            style={styles.topicCard}
            onPress={() => setSelectedTopic(topic)}
          >
            <View style={styles.topicHeader}>
              <View style={styles.tagPill}>
                <Text style={styles.tagText}>{topic.category}</Text>
              </View>
              <Text style={styles.topicTime}>{topic.timeAgo}</Text>
            </View>

            <Text style={styles.topicTitle}>{topic.title}</Text>
            <Text style={styles.topicAuthor}>By {topic.author}</Text>
            <Text style={styles.topicSnippet} numberOfLines={2}>
              {topic.content}
            </Text>

            <View style={styles.topicFooter}>
              <TouchableOpacity
                style={[
                  styles.upvoteBtn,
                  topic.hasUpvoted && styles.upvoteBtnActive,
                ]}
                onPress={() => handleToggleUpvote(topic.id)}
              >
                <Text style={{ fontSize: 13 }}>👍</Text>
                <Text
                  style={[
                    styles.upvoteCount,
                    topic.hasUpvoted && styles.upvoteCountActive,
                  ]}
                >
                  {topic.upvotes}
                </Text>
              </TouchableOpacity>

              <View style={styles.commentCountBox}>
                <Text style={{ fontSize: 13 }}>💬</Text>
                <Text style={styles.commentCountText}>
                  {topic.commentsCount} replies
                </Text>
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>

      {/* View Topic & Comments Modal */}
      <Modal
        visible={!!selectedTopic}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedTopic(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {selectedTopic && (
              <>
                <View style={styles.modalHeader}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={styles.modalCat}>{selectedTopic.category.toUpperCase()}</Text>
                    <Text style={styles.modalTopicTitle}>{selectedTopic.title}</Text>
                    <Text style={styles.modalAuthor}>
                      Proposed by {selectedTopic.author} · {selectedTopic.timeAgo}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedTopic(null)}>
                    <Text style={{ fontSize: 20, color: '#64748b' }}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={{ maxHeight: 320 }}>
                  <Text style={styles.modalContentText}>{selectedTopic.content}</Text>

                  <View style={styles.commentsSection}>
                    <Text style={styles.commentsTitle}>
                      Replies & Citizen Feedback ({commentsList.length})
                    </Text>
                    {commentsList.map((comm, idx) => (
                      <View key={idx} style={styles.commentBubble}>
                        <Text style={styles.commentText}>{comm}</Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>

                {/* Reply Input Bar */}
                <View style={styles.replyBar}>
                  <TextInput
                    style={styles.replyInput}
                    placeholder="Contribute to discussion..."
                    placeholderTextColor="#94a3b8"
                    value={commentText}
                    onChangeText={setCommentText}
                  />
                  <TouchableOpacity
                    style={styles.replyBtn}
                    onPress={handleAddComment}
                  >
                    <Text style={styles.replyBtnText}>Send</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* New Topic Modal */}
      <Modal
        visible={showNewModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNewModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeading}>New Community Proposal</Text>
              <TouchableOpacity onPress={() => setShowNewModal(false)}>
                <Text style={{ fontSize: 20, color: '#64748b' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 380 }}>
              <Text style={styles.inputLabel}>Proposal Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Waste Recycling & Environmental Sanitation Days"
                placeholderTextColor="#94a3b8"
                value={newTitle}
                onChangeText={setNewTitle}
              />

              <Text style={styles.inputLabel}>Your Name / Quarter *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Segun Adeleke (Oke-Ogere Youth Wing)"
                placeholderTextColor="#94a3b8"
                value={newAuthor}
                onChangeText={setNewAuthor}
              />

              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.catPickerRow}>
                {CATEGORIES.filter(c => c !== 'All Topics').map(c => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setNewCategory(c)}
                    style={[
                      styles.catPickerPill,
                      newCategory === c && styles.catPickerPillActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.catPickerText,
                        newCategory === c && styles.catPickerTextActive,
                      ]}
                    >
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Proposal Details / Rationale *</Text>
              <TextInput
                style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
                placeholder="Explain the background, benefits to Ogere Remo, and proposed steps..."
                placeholderTextColor="#94a3b8"
                multiline
                value={newContent}
                onChangeText={setNewContent}
              />
            </ScrollView>

            <View style={{ marginTop: 14, gap: 8 }}>
              <Button
                title="Publish Proposal"
                variant="primary"
                onPress={handleCreateTopic}
              />
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setShowNewModal(false)}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  categoryScroll: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  categoryPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  categoryPillTextActive: {
    color: '#ffffff',
  },
  content: {
    padding: Spacing.md,
    paddingBottom: 40,
  },
  bannerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
  },
  bannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  bannerSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 15,
  },
  newTopicBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: Radius.sm,
  },
  newTopicBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  topicCard: {
    padding: 14,
    marginBottom: 10,
    backgroundColor: '#ffffff',
  },
  topicHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  tagPill: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
  },
  topicTime: {
    fontSize: 11,
    color: '#94a3b8',
  },
  topicTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: 18,
    marginBottom: 2,
  },
  topicAuthor: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 6,
  },
  topicSnippet: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
    marginBottom: 10,
  },
  topicFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 8,
  },
  upvoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  upvoteBtnActive: {
    backgroundColor: '#ecfdf5',
    borderColor: '#059669',
  },
  upvoteCount: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  upvoteCountActive: {
    color: '#059669',
  },
  commentCountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  commentCountText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: Radius.lg,
    padding: 16,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 8,
  },
  modalHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  modalCat: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
  },
  modalTopicTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 2,
  },
  modalAuthor: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  modalContentText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#334155',
    marginBottom: 14,
  },
  commentsSection: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
  },
  commentsTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
  },
  commentBubble: {
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: Radius.sm,
    marginBottom: 6,
    borderLeftWidth: 2,
    borderLeftColor: Colors.gold,
  },
  commentText: {
    fontSize: 11,
    color: '#334155',
    lineHeight: 15,
  },
  replyBar: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
  },
  replyInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: Radius.sm,
    paddingHorizontal: 10,
    fontSize: 12,
    color: '#0f172a',
  },
  replyBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    height: 40,
    borderRadius: Radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  replyBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    marginTop: 8,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: Radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0f172a',
  },
  catPickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 4,
  },
  catPickerPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  catPickerPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  catPickerText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  catPickerTextActive: {
    color: '#ffffff',
  },
});
