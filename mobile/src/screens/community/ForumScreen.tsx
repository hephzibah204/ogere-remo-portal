import React, { useState, useEffect } from 'react';
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
  Image,
  Share,
  ActivityIndicator,
} from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Colors, Spacing, Radius } from '../../theme';
import { useAuth } from '../../services/authContext';
import { API_BASE_URL } from '../../database/syncManager';

// ── TYPES ──
export interface TimelinePost {
  id: string;
  author_name: string;
  author_role?: string;
  author_quarter?: string;
  author_avatar?: string;
  content_text: string;
  image_url?: string;
  audience?: string;
  likes_count: number;
  liked_by?: string[];
  comments_count: number;
  comments?: Array<{
    id: string;
    author_name: string;
    author_avatar?: string;
    comment_text: string;
    created_at: string;
  }>;
  created_at: string;
  hasLiked?: boolean;
}

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

// ── SEED DATA ──
const PRESET_PHOTOS = [
  { label: '👑 Lipakala Festival', url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1200&q=80' },
  { label: '💡 Solar Streetlights', url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80' },
  { label: '🧵 Adire Indigo Crafts', url: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=1200&q=80' },
  { label: '🛡️ Joint Security Patrol', url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80' },
];

const QUARTERS = ['Oke-Ogere', 'Wasimi Quarter', 'Ijana Quarter', 'Orile-Ogere', 'Expressway Axis', 'Diaspora'];
const AUDIENCES = ['Public Feed', 'Indigenes Only', 'Neighborhood Watch'];

const SEED_TIMELINE_POSTS: TimelinePost[] = [
  {
    id: 'POST-101',
    author_name: 'HRH Ologere Palace Secretariat',
    author_role: 'Royal Court Protocol',
    author_quarter: 'Oke-Ogere',
    author_avatar: '👑',
    content_text: 'E ku odun, e ku iye dun! 🌟 Preparations for the 50th Golden Jubilee Lipakala Festival are in full gear at Aafin Ologere. Youth cultural troupes and age-grade groups are invited for ceremonial auditions this Saturday. Let us celebrate our royal heritage with dignity and harmony! #OgereRemo #LipakalaJubilee',
    image_url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1200&q=80',
    audience: 'Public Feed',
    likes_count: 64,
    comments_count: 2,
    comments: [
      { id: 'c1', author_name: 'Chief Olatunji Orowa', author_avatar: '🏛️', comment_text: 'Kabiyeesi o! The elders of Kankanbina are fully ready with the ancestral masquerade troupe.', created_at: new Date(Date.now() - 3600000 * 3).toISOString() },
      { id: 'c2', author_name: 'Segun Adebayo (Youth President)', author_avatar: '🦅', comment_text: 'The youth wing has registered over 120 volunteers for crowd marshaling and logistics!', created_at: new Date(Date.now() - 3600000 * 2).toISOString() }
    ],
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'POST-102',
    author_name: 'Engr. Dapo Saliu',
    author_role: 'Civic Infrastructure Taskforce',
    author_quarter: 'Wasimi Quarter',
    author_avatar: '⚡',
    content_text: 'Proud to share that Phase 2 of our Community Solar Streetlights project along the Wasimi-Ijana market corridor is officially completed! Over 45 high-lumen solar lamps are now active, keeping our night traders safe and vibrant. Big thanks to OCDA and our diaspora donors! 💡✨ #LightUpOgere',
    image_url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80',
    audience: 'Public Feed',
    likes_count: 92,
    comments_count: 1,
    comments: [
      { id: 'c3', author_name: 'Iya Oloja Wasimi', author_avatar: '🧺', comment_text: 'Thank you Engr. Dapo! We can now sell our fresh farm produce till 9 PM with complete peace of mind.', created_at: new Date(Date.now() - 3600000 * 5).toISOString() }
    ],
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: 'POST-103',
    author_name: 'Mrs. Folashade Adeleke',
    author_role: 'Wasimi Adire Artisans Hub',
    author_quarter: 'Ijana Quarter',
    author_avatar: '🎨',
    content_text: 'Fresh batch of genuine Ogere Adire Eleko and indigo-dyed fabrics ready for the upcoming trade exhibition! Our young women apprentices spent 3 weeks perfecting these traditional patterns. Preserving our ancestral craft while creating sustainable livelihoods! 🧵💙 #MadeInOgere #AdireHeritage',
    image_url: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=1200&q=80',
    audience: 'Public Feed',
    likes_count: 51,
    comments_count: 1,
    comments: [
      { id: 'c4', author_name: 'Dr. Folashade Adeyemi-Clark (London)', author_avatar: '✈️', comment_text: 'Can we order batches shipped to the UK diaspora chapter for our cultural gala next month?', created_at: new Date(Date.now() - 3600000 * 10).toISOString() }
    ],
    created_at: new Date(Date.now() - 3600000 * 16).toISOString(),
  },
  {
    id: 'POST-104',
    author_name: 'Commander Kayode Adeleke',
    author_role: 'Joint Patrol Commander',
    author_quarter: 'Expressway Axis',
    author_avatar: '🛡️',
    content_text: 'Security Advisory: Routine night patrols across the Sagamu-Benin Expressway interchange and inner ring-road corridors have been intensified. Please keep emergency speed dials handy in your Ogere Mobile App. If you notice any suspicious gathering, use the SOS beacon or Whistleblower hotline immediately. We remain on 24/7 guard! 🚓🚨 #OgereSafety',
    image_url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
    audience: 'Public Feed',
    likes_count: 78,
    comments_count: 0,
    comments: [],
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

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

const TOPIC_CATEGORIES = ['All Topics', 'Infrastructure', 'Youth & Skills', 'Land & Governance', 'Security'];

export const ForumScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const currentUserName = user?.fullName || 'Oluwaseun Adedayo';
  const currentUserQuarter = user?.quarter || 'Oke-Ogere';

  // Navigation main tab: 'timeline' or 'townhall'
  const [mainTab, setMainTab] = useState<'timeline' | 'townhall'>('timeline');

  // ── TIMELINE STATE ──
  const [timelinePosts, setTimelinePosts] = useState<TimelinePost[]>(SEED_TIMELINE_POSTS);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [selectedQuarterFilter, setSelectedQuarterFilter] = useState('All');
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
  const [friendsMap, setFriendsMap] = useState<Record<string, boolean>>({});

  // Composer Modal State
  const [showComposerModal, setShowComposerModal] = useState(false);
  const [postText, setPostText] = useState('');
  const [postImage, setPostImage] = useState('');
  const [postQuarter, setPostQuarter] = useState(currentUserQuarter);
  const [postAudience, setPostAudience] = useState('Public Feed');
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);

  // Comments Modal State
  const [activeCommentPost, setActiveCommentPost] = useState<TimelinePost | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Direct Message Modal State
  const [activeDmUser, setActiveDmUser] = useState<string | null>(null);
  const [dmMessages, setDmMessages] = useState<Array<{ id: string; sender: string; text: string; time: string }>>([]);
  const [dmInputText, setDmInputText] = useState('');

  // ── TOWN HALL STATE ──
  const [topics, setTopics] = useState<ForumTopic[]>(SEED_TOPICS);
  const [selectedCategory, setSelectedCategory] = useState('All Topics');
  const [selectedTopic, setSelectedTopic] = useState<ForumTopic | null>(null);
  const [showNewTopicModal, setShowNewTopicModal] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicContent, setNewTopicContent] = useState('');
  const [newTopicCategory, setNewTopicCategory] = useState('Infrastructure');
  const [newTopicAuthor, setNewTopicAuthor] = useState('');
  const [topicCommentText, setTopicCommentText] = useState('');
  const [topicCommentsList, setTopicCommentsList] = useState<string[]>([
    'Chief Oladipo: Fully supported! We will table this at the next Council of Chiefs.',
    'Sister Funmi: Very thoughtful proposal. How do youth apply for the vocational phase?',
    'Youth Leader Segun: Excellent initiative! The youth wing is ready to mobilize volunteers.',
  ]);

  // Load timeline posts from API on mount
  useEffect(() => {
    fetchTimelineFromApi();
  }, []);

  const fetchTimelineFromApi = async () => {
    try {
      setLoadingTimeline(true);
      const res = await fetch(`${API_BASE_URL}/api/timeline?current_user=${encodeURIComponent(currentUserName)}`);
      const data = await res.json();
      if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
        setTimelinePosts(data.data);
        if (data.social) {
          const fMap: Record<string, boolean> = {};
          (data.social.following || []).forEach((u: string) => { fMap[u] = true; });
          setFollowingMap(fMap);

          const frMap: Record<string, boolean> = {};
          (data.social.friends || []).forEach((u: string) => { frMap[u] = true; });
          setFriendsMap(frMap);
        }
      }
    } catch (_) {
      // Offline fallback to seeds
    } finally {
      setLoadingTimeline(false);
    }
  };

  // ── TIMELINE ACTIONS ──

  // Publish Post ("What's on your mind?")
  const handleCreatePost = async () => {
    if (!postText.trim() && !postImage.trim()) {
      Alert.alert('Required', 'Please write what is on your mind or attach a picture to share.');
      return;
    }

    setIsSubmittingPost(true);
    const newPost: TimelinePost = {
      id: `POST-${Date.now()}`,
      author_name: currentUserName,
      author_role: user?.role === 'ocda_admin' ? 'OCDA Admin' : user?.role === 'security_officer' ? 'Security Officer' : 'Verified Indigene',
      author_quarter: postQuarter,
      author_avatar: user?.role === 'ocda_admin' ? '⚙️' : user?.role === 'security_officer' ? '🛡️' : '👑',
      content_text: postText.trim(),
      image_url: postImage.trim() || undefined,
      audience: postAudience,
      likes_count: 0,
      liked_by: [],
      comments_count: 0,
      comments: [],
      created_at: new Date().toISOString(),
      hasLiked: false,
    };

    setTimelinePosts([newPost, ...timelinePosts]);
    setShowComposerModal(false);
    setPostText('');
    setPostImage('');
    setIsSubmittingPost(false);
    Alert.alert('Published! 🎉', 'Your status update is now live on the Ogere Civic Timeline.');

    // Sync to backend
    try {
      await fetch(`${API_BASE_URL}/api/timeline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_post',
          author_name: newPost.author_name,
          author_role: newPost.author_role,
          author_quarter: newPost.author_quarter,
          author_avatar: newPost.author_avatar,
          content_text: newPost.content_text,
          image_url: newPost.image_url,
          audience: newPost.audience,
        }),
      });
    } catch (_) {}
  };

  // Like Toggle
  const handleToggleLike = (postId: string) => {
    setTimelinePosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          const isLiked = !!p.hasLiked;
          const newLikesCount = isLiked ? Math.max(0, p.likes_count - 1) : p.likes_count + 1;
          return { ...p, hasLiked: !isLiked, likes_count: newLikesCount };
        }
        return p;
      })
    );

    // Call API in background
    try {
      fetch(`${API_BASE_URL}/api/timeline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'like_post', postId, userName: currentUserName }),
      });
    } catch (_) {}
  };

  // Toggle Follow
  const handleToggleFollow = (authorName: string) => {
    if (authorName === currentUserName) {
      Alert.alert('Notice', 'You cannot follow yourself.');
      return;
    }
    const current = !!followingMap[authorName];
    setFollowingMap(prev => ({ ...prev, [authorName]: !current }));
    Alert.alert('Social Network', !current ? `✓ You are now following ${authorName}` : `Unfollowed ${authorName}`);

    try {
      fetch(`${API_BASE_URL}/api/timeline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'follow_user', current_user: currentUserName, target_user: authorName }),
      });
    } catch (_) {}
  };

  // Toggle Friend
  const handleToggleFriend = (authorName: string) => {
    if (authorName === currentUserName) {
      Alert.alert('Notice', 'You are already connected to yourself.');
      return;
    }
    const current = !!friendsMap[authorName];
    setFriendsMap(prev => ({ ...prev, [authorName]: !current }));
    Alert.alert('Friends', !current ? `🤝 You and ${authorName} are now friends!` : `Removed ${authorName} from friends`);

    try {
      fetch(`${API_BASE_URL}/api/timeline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_friend', current_user: currentUserName, target_user: authorName }),
      });
    } catch (_) {}
  };

  // Open Direct Messaging Modal
  const handleOpenDirectMessage = (targetUser: string) => {
    if (targetUser === currentUserName) {
      Alert.alert('Notice', 'This is your own profile post.');
      return;
    }
    setActiveDmUser(targetUser);
    setDmMessages([
      { id: '1', sender: targetUser, text: `Ẹ ku ọjọ oni! Hello ${currentUserName}, nice connecting on Ogere Civic network.`, time: 'Just now' }
    ]);
  };

  // Send Direct Message
  const handleSendDirectMessage = () => {
    if (!dmInputText.trim() || !activeDmUser) return;
    const newMsg = {
      id: `dm-${Date.now()}`,
      sender: currentUserName,
      text: dmInputText.trim(),
      time: 'Just now',
    };
    setDmMessages(prev => [...prev, newMsg]);
    const sentText = dmInputText.trim();
    setDmInputText('');

    try {
      fetch(`${API_BASE_URL}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName: currentUserName,
          recipientName: activeDmUser,
          text: sentText,
          channelId: 'direct',
        }),
      });
    } catch (_) {}
  };

  // Share Post
  const handleSharePost = async (post: TimelinePost) => {
    try {
      await Share.share({
        title: 'Ogere Remo Civic Timeline',
        message: `Check out "${post.author_name}" on the Ogere Remo Civic Timeline:\n\n${post.content_text}\n\nhttps://ogereremo.vercel.app/forum`,
      });
    } catch (_) {}
  };

  // Add Comment to Post
  const handleAddPostComment = async () => {
    if (!newCommentText.trim() || !activeCommentPost) return;
    setIsSubmittingComment(true);

    const newComment = {
      id: `cmt-${Date.now()}`,
      author_name: currentUserName,
      author_avatar: '👤',
      comment_text: newCommentText.trim(),
      created_at: new Date().toISOString(),
    };

    const updatedPosts = timelinePosts.map(p => {
      if (p.id === activeCommentPost.id) {
        const comments = [...(p.comments || []), newComment];
        return { ...p, comments, comments_count: comments.length };
      }
      return p;
    });

    setTimelinePosts(updatedPosts);
    setActiveCommentPost(prev => prev ? { ...prev, comments: [...(prev.comments || []), newComment], comments_count: (prev.comments_count || 0) + 1 } : null);
    const textToSend = newCommentText.trim();
    setNewCommentText('');
    setIsSubmittingComment(false);

    try {
      await fetch(`${API_BASE_URL}/api/timeline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_comment',
          postId: activeCommentPost.id,
          author_name: currentUserName,
          author_avatar: '👤',
          comment_text: textToSend,
        }),
      });
    } catch (_) {}
  };

  // Filtered timeline posts
  const filteredTimelinePosts = timelinePosts.filter(
    p => selectedQuarterFilter === 'All' || p.author_quarter === selectedQuarterFilter
  );

  // ── TOWN HALL ACTIONS ──
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
    if (!newTopicTitle || !newTopicContent) {
      Alert.alert('Required', 'Please fill in both the discussion title and your proposal.');
      return;
    }

    const newTopic: ForumTopic = {
      id: `FRM-${Date.now().toString().slice(-4)}`,
      title: newTopicTitle,
      author: newTopicAuthor || currentUserName,
      category: newTopicCategory,
      timeAgo: 'Just now',
      upvotes: 1,
      commentsCount: 0,
      content: newTopicContent,
      hasUpvoted: true,
    };

    setTopics([newTopic, ...topics]);
    setShowNewTopicModal(false);
    setNewTopicTitle('');
    setNewTopicContent('');
    setNewTopicAuthor('');

    Alert.alert('Topic Created', 'Your proposal has been published on the Ogere Civic Town Hall forum.');
  };

  const handleAddTopicComment = () => {
    if (!topicCommentText.trim()) return;
    setTopicCommentsList([...topicCommentsList, `${currentUserName}: ${topicCommentText.trim()}`]);
    setTopicCommentText('');
    if (selectedTopic) {
      setTopics(topics.map(t => t.id === selectedTopic.id ? { ...t, commentsCount: t.commentsCount + 1 } : t));
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    if (!dateStr) return 'Just now';
    try {
      const diffSec = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
      if (diffSec < 60) return 'Just now';
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
      return `${Math.floor(diffSec / 86400)}d ago`;
    } catch (_) {
      return 'Recent';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="CIVIC COMMUNITY"
        subtitle="Timeline Feed & Town Hall Deliberations"
        showBack
        onBack={() => navigation.goBack()}
      />

      {/* ── TOP SEGMENTED TAB SWITCHER ── */}
      <View style={styles.tabSwitcherContainer}>
        <TouchableOpacity
          style={[styles.tabButton, mainTab === 'timeline' && styles.tabButtonActiveTimeline]}
          onPress={() => setMainTab('timeline')}
        >
          <Text style={{ fontSize: 16 }}>📰</Text>
          <Text style={[styles.tabButtonText, mainTab === 'timeline' && styles.tabButtonTextActive]}>
            Civic Timeline
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, mainTab === 'townhall' && styles.tabButtonActiveTownhall]}
          onPress={() => setMainTab('townhall')}
        >
          <Text style={{ fontSize: 16 }}>🏛️</Text>
          <Text style={[styles.tabButtonText, mainTab === 'townhall' && styles.tabButtonTextActive]}>
            Town Hall Topics
          </Text>
        </TouchableOpacity>
      </View>

      {/* ========================================================================= */}
      {/* 1. CIVIC TIMELINE TAB (FACEBOOK-STYLE WHAT'S ON YOUR MIND & FEED)         */}
      {/* ========================================================================= */}
      {mainTab === 'timeline' ? (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* "What's on your mind?" Composer Prompt Card */}
          <Card style={styles.composerTriggerCard} onPress={() => setShowComposerModal(true)}>
            <View style={styles.composerPromptRow}>
              <View style={styles.authorAvatarCircle}>
                <Text style={{ fontSize: 18 }}>👑</Text>
              </View>
              <View style={styles.composerPromptBubble}>
                <Text style={styles.composerPromptText}>
                  What's on your mind, {currentUserName.split(' ')[0]}? Share photo or update...
                </Text>
              </View>
            </View>

            <View style={styles.composerQuickBar}>
              <View style={styles.composerQuickItem}>
                <Text style={{ fontSize: 16 }}>📸</Text>
                <Text style={styles.composerQuickLabel}>Photo</Text>
              </View>
              <View style={styles.composerQuickItem}>
                <Text style={{ fontSize: 16 }}>✍️</Text>
                <Text style={styles.composerQuickLabel}>Status</Text>
              </View>
              <View style={styles.composerQuickItem}>
                <Text style={{ fontSize: 16 }}>📍</Text>
                <Text style={styles.composerQuickLabel}>Quarter</Text>
              </View>
            </View>
          </Card>

          {/* Quarter Filter Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChipScroll}>
            <TouchableOpacity
              onPress={() => setSelectedQuarterFilter('All')}
              style={[styles.filterChip, selectedQuarterFilter === 'All' && styles.filterChipActive]}
            >
              <Text style={[styles.filterChipText, selectedQuarterFilter === 'All' && styles.filterChipTextActive]}>
                All Quarters ({timelinePosts.length})
              </Text>
            </TouchableOpacity>
            {QUARTERS.map(q => (
              <TouchableOpacity
                key={q}
                onPress={() => setSelectedQuarterFilter(q)}
                style={[styles.filterChip, selectedQuarterFilter === q && styles.filterChipActive]}
              >
                <Text style={[styles.filterChipText, selectedQuarterFilter === q && styles.filterChipTextActive]}>
                  {q}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Timeline Feed Stream */}
          {loadingTimeline ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={{ marginTop: 10, color: '#64748b', fontSize: 13 }}>Loading Civic Feed...</Text>
            </View>
          ) : filteredTimelinePosts.length === 0 ? (
            <Card style={{ padding: 24, alignItems: 'center' }}>
              <Text style={{ fontSize: 32, marginBottom: 8 }}>✍️</Text>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 4 }}>No updates in {selectedQuarterFilter}</Text>
              <Text style={{ fontSize: 13, color: '#64748b', textAlign: 'center', marginBottom: 12 }}>
                Be the first citizen to share what is on your mind!
              </Text>
              <TouchableOpacity style={styles.createFirstBtn} onPress={() => setShowComposerModal(true)}>
                <Text style={styles.createFirstBtnText}>Create Status Update</Text>
              </TouchableOpacity>
            </Card>
          ) : (
            filteredTimelinePosts.map(post => {
              const isFollowing = !!followingMap[post.author_name];
              const isFriend = !!friendsMap[post.author_name];
              const isSelf = post.author_name === currentUserName;

              return (
                <Card key={post.id} style={styles.timelineCard}>
                  {/* Card Header: Author, Quarter & Social Actions */}
                  <View style={styles.postHeaderRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                      <View style={styles.authorAvatarCircle}>
                        <Text style={{ fontSize: 18 }}>{post.author_avatar || '👤'}</Text>
                      </View>

                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                          <Text style={styles.authorNameText}>{post.author_name}</Text>
                          <View style={styles.verifiedBadge}>
                            <Text style={{ color: '#ffffff', fontSize: 9, fontWeight: 'bold' }}>✓</Text>
                          </View>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                          <Text style={styles.quarterBadgeText}>{post.author_quarter || 'Oke-Ogere'}</Text>
                          <Text style={{ color: '#94a3b8', fontSize: 11 }}>•</Text>
                          <Text style={styles.timeAgoText}>{formatRelativeTime(post.created_at)}</Text>
                          <Text style={{ color: '#94a3b8', fontSize: 11 }}>• 🌐</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Social Network Action Pills: Follow, Friend, Message */}
                  {!isSelf && (
                    <View style={styles.socialPillsRow}>
                      <TouchableOpacity
                        style={[styles.socialPill, isFollowing && styles.socialPillActive]}
                        onPress={() => handleToggleFollow(post.author_name)}
                      >
                        <Text style={[styles.socialPillText, isFollowing && styles.socialPillTextActive]}>
                          {isFollowing ? '✓ Following' : '+ Follow'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.socialPill, isFriend && styles.socialPillFriendActive]}
                        onPress={() => handleToggleFriend(post.author_name)}
                      >
                        <Text style={[styles.socialPillText, isFriend && styles.socialPillFriendTextActive]}>
                          {isFriend ? '🤝 Friends' : '👤+ Add Friend'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.messagePill}
                        onPress={() => handleOpenDirectMessage(post.author_name)}
                      >
                        <Text style={styles.messagePillText}>✉️ Message</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Post Text */}
                  {!!post.content_text && (
                    <Text style={styles.postBodyText}>{post.content_text}</Text>
                  )}

                  {/* Post Image Attachment */}
                  {!!post.image_url && (
                    <View style={styles.postImageWrapper}>
                      <Image
                        source={{ uri: post.image_url }}
                        style={styles.postImage}
                        resizeMode="cover"
                      />
                    </View>
                  )}

                  {/* Reactions Summary */}
                  <View style={styles.postMetaRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Text style={{ fontSize: 13 }}>👍❤️</Text>
                      <Text style={styles.postMetaText}>{post.likes_count}</Text>
                    </View>
                    <TouchableOpacity onPress={() => setActiveCommentPost(post)}>
                      <Text style={styles.postMetaText}>
                        {post.comments_count || post.comments?.length || 0} comments
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Action Buttons: Like, Comment, Share */}
                  <View style={styles.actionButtonsRow}>
                    <TouchableOpacity
                      style={styles.socialActionBtn}
                      onPress={() => handleToggleLike(post.id)}
                    >
                      <Text style={{ fontSize: 16 }}>{post.hasLiked ? '👍' : '👍'}</Text>
                      <Text style={[styles.socialActionText, post.hasLiked && styles.socialActionTextActive]}>
                        {post.hasLiked ? 'Liked' : 'Like'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.socialActionBtn}
                      onPress={() => setActiveCommentPost(post)}
                    >
                      <Text style={{ fontSize: 16 }}>💬</Text>
                      <Text style={styles.socialActionText}>Comment</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.socialActionBtn}
                      onPress={() => handleSharePost(post)}
                    >
                      <Text style={{ fontSize: 16 }}>↗️</Text>
                      <Text style={styles.socialActionText}>Share</Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              );
            })
          )}
        </ScrollView>
      ) : (
        /* ========================================================================= */
        /* 2. TOWN HALL DELIBERATIONS TAB                                            */
        /* ========================================================================= */
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {TOPIC_CATEGORIES.map(cat => (
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

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
                onPress={() => setShowNewTopicModal(true)}
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
                    style={[styles.upvoteBtn, topic.hasUpvoted && styles.upvoteBtnActive]}
                    onPress={() => handleToggleUpvote(topic.id)}
                  >
                    <Text style={{ fontSize: 13 }}>👍</Text>
                    <Text style={[styles.upvoteCount, topic.hasUpvoted && styles.upvoteCountActive]}>
                      {topic.upvotes}
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.commentCountBox}>
                    <Text style={{ fontSize: 13 }}>💬</Text>
                    <Text style={styles.commentCountText}>{topic.commentsCount} replies</Text>
                  </View>
                </View>
              </Card>
            ))}
          </ScrollView>
        </>
      )}

      {/* ========================================================================= */}
      {/* COMPOSER MODAL: "WHAT'S ON YOUR MIND?"                                   */}
      {/* ========================================================================= */}
      <Modal
        visible={showComposerModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowComposerModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeading}>What's On Your Mind?</Text>
              <TouchableOpacity onPress={() => setShowComposerModal(false)}>
                <Text style={{ fontSize: 20, color: '#64748b' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
              {/* Quarter & Privacy Selectors */}
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Quarter:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      {QUARTERS.map(q => (
                        <TouchableOpacity
                          key={q}
                          onPress={() => setPostQuarter(q)}
                          style={[styles.miniPill, postQuarter === q && styles.miniPillActive]}
                        >
                          <Text style={[styles.miniPillText, postQuarter === q && styles.miniPillTextActive]}>{q}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              </View>

              {/* Text Input */}
              <TextInput
                style={styles.composerTextInput}
                placeholder="What is happening in Ogere Remo? Share news, celebrations, or announcements..."
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={4}
                value={postText}
                onChangeText={setPostText}
              />

              {/* Preset Photos Selection */}
              <Text style={styles.inputLabel}>Attach Civic Photo (Select or enter link):</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {PRESET_PHOTOS.map(preset => (
                    <TouchableOpacity
                      key={preset.label}
                      onPress={() => setPostImage(preset.url)}
                      style={[styles.presetPhotoBtn, postImage === preset.url && styles.presetPhotoBtnActive]}
                    >
                      <Text style={[styles.presetPhotoText, postImage === preset.url && styles.presetPhotoTextActive]}>
                        {preset.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {/* Direct image url input */}
              <TextInput
                style={styles.input}
                placeholder="Or paste image URL (https://...)"
                placeholderTextColor="#94a3b8"
                value={postImage}
                onChangeText={setPostImage}
              />

              {/* Photo Preview */}
              {!!postImage && (
                <View style={styles.modalImagePreviewBox}>
                  <Image source={{ uri: postImage }} style={styles.modalImagePreview} resizeMode="cover" />
                  <TouchableOpacity style={styles.removeImageBtn} onPress={() => setPostImage('')}>
                    <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>✕</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>

            <TouchableOpacity
              style={[styles.publishPostBtn, isSubmittingPost && { opacity: 0.6 }]}
              onPress={handleCreatePost}
              disabled={isSubmittingPost}
            >
              <Text style={styles.publishPostBtnText}>
                {isSubmittingPost ? 'Publishing...' : 'Post to Civic Timeline 🚀'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* TIMELINE COMMENTS MODAL                                                   */}
      {/* ========================================================================= */}
      <Modal
        visible={!!activeCommentPost}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveCommentPost(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeading}>Comments</Text>
              <TouchableOpacity onPress={() => setActiveCommentPost(null)}>
                <Text style={{ fontSize: 20, color: '#64748b' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 340 }} showsVerticalScrollIndicator={false}>
              {activeCommentPost?.comments && activeCommentPost.comments.length > 0 ? (
                activeCommentPost.comments.map(cmt => (
                  <View key={cmt.id} style={styles.commentItemRow}>
                    <View style={styles.commentAvatarCircle}>
                      <Text style={{ fontSize: 13 }}>{cmt.author_avatar || '👤'}</Text>
                    </View>
                    <View style={styles.commentBubbleBox}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                        <Text style={styles.commentAuthorName}>{cmt.author_name}</Text>
                        <Text style={styles.commentTimeAgo}>{formatRelativeTime(cmt.created_at)}</Text>
                      </View>
                      <Text style={styles.commentContentText}>{cmt.comment_text}</Text>
                    </View>
                  </View>
                ))
              ) : (
                <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                  <Text style={{ color: '#94a3b8', fontSize: 13 }}>No comments yet. Be the first to reply!</Text>
                </View>
              )}
            </ScrollView>

            {/* Comment Input Bar */}
            <View style={styles.replyBar}>
              <TextInput
                style={styles.replyInput}
                placeholder="Write a civic comment..."
                placeholderTextColor="#94a3b8"
                value={newCommentText}
                onChangeText={setNewCommentText}
              />
              <TouchableOpacity
                style={[styles.replyBtn, isSubmittingComment && { opacity: 0.6 }]}
                onPress={handleAddPostComment}
                disabled={isSubmittingComment}
              >
                <Text style={styles.replyBtnText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* DIRECT MESSAGING CHAT MODAL                                              */}
      {/* ========================================================================= */}
      <Modal
        visible={!!activeDmUser}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveDmUser(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontSize: 18 }}>✉️</Text>
                <View>
                  <Text style={styles.modalHeading}>{activeDmUser}</Text>
                  <Text style={{ fontSize: 11, color: '#64748b' }}>Ogere Civic Direct Message</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setActiveDmUser(null)}>
                <Text style={{ fontSize: 20, color: '#64748b' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
              {dmMessages.map(msg => {
                const isMe = msg.sender === currentUserName;
                return (
                  <View key={msg.id} style={[styles.dmBubbleRow, isMe ? { justifyContent: 'flex-end' } : { justifyContent: 'flex-start' }]}>
                    <View style={[styles.dmBubble, isMe ? styles.dmBubbleMe : styles.dmBubbleOther]}>
                      <Text style={[styles.dmBubbleText, isMe ? styles.dmBubbleTextMe : styles.dmBubbleTextOther]}>
                        {msg.text}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            <View style={styles.replyBar}>
              <TextInput
                style={styles.replyInput}
                placeholder={`Message ${activeDmUser?.split(' ')[0]}...`}
                placeholderTextColor="#94a3b8"
                value={dmInputText}
                onChangeText={setDmInputText}
              />
              <TouchableOpacity style={styles.replyBtn} onPress={handleSendDirectMessage}>
                <Text style={styles.replyBtnText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* TOWN HALL: VIEW TOPIC MODAL                                               */}
      {/* ========================================================================= */}
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
                      Replies & Citizen Feedback ({topicCommentsList.length})
                    </Text>
                    {topicCommentsList.map((comm, idx) => (
                      <View key={idx} style={styles.commentBubble}>
                        <Text style={styles.commentText}>{comm}</Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>

                <View style={styles.replyBar}>
                  <TextInput
                    style={styles.replyInput}
                    placeholder="Contribute to discussion..."
                    placeholderTextColor="#94a3b8"
                    value={topicCommentText}
                    onChangeText={setTopicCommentText}
                  />
                  <TouchableOpacity style={styles.replyBtn} onPress={handleAddTopicComment}>
                    <Text style={styles.replyBtnText}>Send</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* TOWN HALL: NEW TOPIC MODAL                                                */}
      {/* ========================================================================= */}
      <Modal
        visible={showNewTopicModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNewTopicModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeading}>New Community Proposal</Text>
              <TouchableOpacity onPress={() => setShowNewTopicModal(false)}>
                <Text style={{ fontSize: 20, color: '#64748b' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 380 }}>
              <Text style={styles.inputLabel}>Proposal Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Waste Recycling & Sanitation"
                placeholderTextColor="#94a3b8"
                value={newTopicTitle}
                onChangeText={setNewTopicTitle}
              />

              <Text style={styles.inputLabel}>Your Name / Quarter *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Engr. Adeleke (Oke-Ogere)"
                placeholderTextColor="#94a3b8"
                value={newTopicAuthor}
                onChangeText={setNewTopicAuthor}
              />

              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.catPickerRow}>
                {TOPIC_CATEGORIES.filter(c => c !== 'All Topics').map(cat => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setNewTopicCategory(cat)}
                    style={[
                      styles.catPickerPill,
                      newTopicCategory === cat && styles.catPickerPillActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.catPickerText,
                        newTopicCategory === cat && styles.catPickerTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Proposal Details *</Text>
              <TextInput
                style={[styles.input, { minHeight: 90, textAlignVertical: 'top' }]}
                placeholder="Explain the background, benefits, and implementation details..."
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={4}
                value={newTopicContent}
                onChangeText={setNewTopicContent}
              />
            </ScrollView>

            <TouchableOpacity style={styles.publishPostBtn} onPress={handleCreateTopic}>
              <Text style={styles.publishPostBtnText}>Publish Deliberation Proposal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  tabSwitcherContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    padding: Spacing.xs,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: Radius.md,
  },
  tabButtonActiveTimeline: {
    backgroundColor: '#1877F2',
  },
  tabButtonActiveTownhall: {
    backgroundColor: Colors.gold,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  tabButtonTextActive: {
    color: '#ffffff',
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },

  // Composer prompt card
  composerTriggerCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: Radius.lg,
  },
  composerPromptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  authorAvatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.gold,
  },
  composerPromptBubble: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  composerPromptText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  composerQuickBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
  },
  composerQuickItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  composerQuickLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },

  // Filters
  filterChipScroll: {
    gap: 6,
    marginBottom: Spacing.md,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: '#e2e8f0',
  },
  filterChipActive: {
    backgroundColor: '#1877F2',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },

  // Timeline Post Cards
  timelineCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
  },
  postHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  authorNameText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  verifiedBadge: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#1877F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quarterBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  timeAgoText: {
    fontSize: 11,
    color: '#64748b',
  },

  // Social Pills: Follow, Friend, Message
  socialPillsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  socialPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  socialPillActive: {
    backgroundColor: '#e0f2fe',
    borderColor: '#38bdf8',
  },
  socialPillFriendActive: {
    backgroundColor: '#ecfdf5',
    borderColor: '#34d399',
  },
  socialPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#334155',
  },
  socialPillTextActive: {
    color: '#0284c7',
  },
  socialPillFriendTextActive: {
    color: '#059669',
  },
  messagePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#1877F2',
  },
  messagePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },

  // Post Content
  postBodyText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#1e293b',
    marginBottom: 10,
  },
  postImageWrapper: {
    borderRadius: Radius.md,
    overflow: 'hidden',
    marginBottom: 10,
  },
  postImage: {
    width: '100%',
    height: 220,
    backgroundColor: '#0f172a',
  },
  postMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    marginBottom: 6,
  },
  postMetaText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 4,
  },
  socialActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  socialActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  socialActionTextActive: {
    color: '#1877F2',
    fontWeight: '800',
  },

  // Modals & Bottom Sheets
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.lg,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  modalHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  composerTextInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: Radius.md,
    padding: 12,
    fontSize: 14,
    color: '#0f172a',
    minHeight: 90,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  miniPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  miniPillActive: {
    backgroundColor: '#1877F2',
    borderColor: '#1877F2',
  },
  miniPillText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  miniPillTextActive: {
    color: '#ffffff',
  },
  presetPhotoBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  presetPhotoBtnActive: {
    backgroundColor: '#dbeafe',
    borderColor: '#2563eb',
  },
  presetPhotoText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  presetPhotoTextActive: {
    color: '#1d4ed8',
  },
  modalImagePreviewBox: {
    position: 'relative',
    marginTop: 10,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  modalImagePreview: {
    width: '100%',
    height: 160,
  },
  removeImageBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  publishPostBtn: {
    backgroundColor: '#1877F2',
    paddingVertical: 12,
    borderRadius: Radius.md,
    alignItems: 'center',
    marginTop: 12,
  },
  publishPostBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  createFirstBtn: {
    backgroundColor: '#1877F2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.sm,
  },
  createFirstBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },

  // Comment Thread
  commentItemRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  commentAvatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentBubbleBox: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: Radius.md,
    padding: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  commentAuthorName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  commentTimeAgo: {
    fontSize: 10,
    color: '#94a3b8',
  },
  commentContentText: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 16,
  },

  // Direct Message Bubbles
  dmBubbleRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dmBubble: {
    maxWidth: '80%',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: Radius.md,
  },
  dmBubbleMe: {
    backgroundColor: '#1877F2',
  },
  dmBubbleOther: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  dmBubbleText: {
    fontSize: 13,
  },
  dmBubbleTextMe: {
    color: '#ffffff',
  },
  dmBubbleTextOther: {
    color: '#0f172a',
  },

  // Town Hall styles
  categoryScroll: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    gap: 6,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: '#e2e8f0',
  },
  categoryPillActive: {
    backgroundColor: Colors.primary,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  categoryPillTextActive: {
    color: '#ffffff',
  },
  bannerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#ffffff',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: Spacing.md,
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
  },
  newTopicBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.sm,
  },
  newTopicBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: Spacing.sm,
  },
  topicCard: {
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: Radius.lg,
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
    borderRadius: Radius.sm,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  topicTime: {
    fontSize: 11,
    color: '#64748b',
  },
  topicTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  topicAuthor: {
    fontSize: 11,
    color: '#64748b',
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
  },
  upvoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.sm,
  },
  upvoteBtnActive: {
    backgroundColor: '#dbeafe',
  },
  upvoteCount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  upvoteCountActive: {
    color: '#1d4ed8',
  },
  commentCountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  commentCountText: {
    fontSize: 12,
    color: '#64748b',
  },
  modalCat: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 1,
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
    marginBottom: 6,
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
