import { useState, useEffect, useRef } from 'react';
import {
  fetchTimelinePosts,
  submitTimelinePost,
  likeTimelinePost,
  addTimelineComment,
  followUser,
  addFriend,
  fetchDirectMessages,
  sendDirectMessage,
} from '../services/apiClient';
import { getSession } from '../services/auth';

const PRESET_PHOTOS = [
  {
    label: '👑 Lipakala Festival',
    url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: '💡 Solar Streetlights',
    url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: '🧵 Adire Indigo Crafts',
    url: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: '🛡️ Joint Security Patrol',
    url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
  },
];

const QUARTERS = ['Oke-Ogere', 'Wasimi Quarter', 'Ijana Quarter', 'Orile-Ogere', 'Expressway Axis', 'Diaspora'];
const AUDIENCES = [
  { id: 'Public Feed', label: '🌐 Public Feed', desc: 'Visible to everyone' },
  { id: 'Indigenes Only', label: '🏛️ Indigenes Only', desc: 'Verified indigenes & agbole' },
  { id: 'Neighborhood Watch', label: '🛡️ Ward Watch', desc: 'Local security & residents' },
];

export default function TimelineFeed({
  embedded = false,
  maxPosts = null,
  showHeader = true,
  title = null,
  subtitle = null,
  linkToAll = '/timeline',
} = {}) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [session, setSession] = useState(null);

  // Composer State
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [contentText, setContentText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedQuarter, setSelectedQuarter] = useState('Oke-Ogere');
  const [selectedAudience, setSelectedAudience] = useState('Public Feed');
  const [authorRole, setAuthorRole] = useState('Resident');
  const [authorName, setAuthorName] = useState('');
  const [authorAvatar, setAuthorAvatar] = useState('👤');
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Social connection states (Set of author names)
  const [followingMap, setFollowingMap] = useState({});
  const [friendsMap, setFriendsMap] = useState({});

  // Direct Messaging Drawer
  const [activeDmUser, setActiveDmUser] = useState(null);
  const [dmList, setDmList] = useState([]);
  const [dmInput, setDmInput] = useState('');
  const [dmLoading, setDmLoading] = useState(false);
  const [dmSending, setDmSending] = useState(false);

  // Comments state (map of postId -> boolean/string)
  const [expandedComments, setExpandedComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [submittingComment, setSubmittingComment] = useState({});

  // Lightbox modal for photos
  const [lightboxImg, setLightboxImg] = useState(null);

  // Filter state
  const [filterQuarter, setFilterQuarter] = useState('All');

  const fileInputRef = useRef(null);
  const chatBottomRef = useRef(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  useEffect(() => {
    (async () => {
      let currentUserName = 'Oluwaseun Adedayo';
      try {
        const curSession = await getSession();
        setSession(curSession);
        if (curSession) {
          currentUserName = curSession.fullName || curSession.name || 'Verified Citizen';
          setAuthorName(currentUserName);
          setSelectedQuarter(curSession.quarter || 'Oke-Ogere');
          setAuthorRole(curSession.role === 'ocda_admin' ? 'OCDA Admin' : curSession.role === 'security_officer' ? 'Security Officer' : 'Verified Indigene');
          setAuthorAvatar(curSession.role === 'ocda_admin' ? '⚙️' : curSession.role === 'security_officer' ? '🛡️' : '👑');
        } else {
          setAuthorName(currentUserName);
          setAuthorRole('Youth & Community Member');
          setSelectedQuarter('Oke-Ogere');
          setAuthorAvatar('👤');
        }
      } catch (_) {}
      loadPosts(currentUserName);
    })();
  }, []);

  const loadPosts = async (currentUserName) => {
    try {
      setLoading(true);
      const res = await fetchTimelinePosts();
      if (res && res.success && Array.isArray(res.data)) {
        setPosts(res.data);
        if (res.social) {
          const fMap = {};
          (res.social.following || []).forEach((u) => {
            fMap[u] = true;
          });
          setFollowingMap(fMap);

          const frMap = {};
          (res.social.friends || []).forEach((u) => {
            frMap[u] = true;
          });
          setFriendsMap(frMap);
        }
      }
    } catch (err) {
      console.warn('Failed to load timeline posts:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPosts(authorName);
  };

  // Image upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Photo is too large. Please choose an image under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setImageUrl(uploadEvent.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Publish Post
  const handlePublishPost = async (e) => {
    e?.preventDefault();
    if (!contentText.trim() && !imageUrl.trim()) {
      alert('Please type what is on your mind or attach a picture to share.');
      return;
    }

    try {
      setSubmitting(true);
      const postPayload = {
        author_name: authorName.trim() || 'Verified Citizen',
        author_role: authorRole,
        author_quarter: selectedQuarter,
        author_avatar: authorAvatar,
        content_text: contentText.trim(),
        image_url: imageUrl.trim(),
        audience: selectedAudience,
      };

      const res = await submitTimelinePost(postPayload);
      if (res && res.success && res.data) {
        setPosts([res.data, ...posts]);
        setContentText('');
        setImageUrl('');
        setIsComposerOpen(false);
        showToast('🎉 Published to Ogere Civic Timeline!');
      } else {
        alert(res?.error || 'Could not publish post. Please check connection.');
      }
    } catch (err) {
      alert('Error publishing update: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Like / Reaction
  const handleLike = async (postId) => {
    const userIdentifier = session?.id || authorName || 'citizen';
    setPosts((prevPosts) =>
      prevPosts.map((p) => {
        if (p.id === postId) {
          const liked = (p.liked_by || []).includes(userIdentifier);
          const newLikedBy = liked
            ? p.liked_by.filter((k) => k !== userIdentifier)
            : [...(p.liked_by || []), userIdentifier];
          const newCount = liked ? Math.max(0, (p.likes_count || 1) - 1) : (p.likes_count || 0) + 1;
          return { ...p, likes_count: newCount, liked_by: newLikedBy };
        }
        return p;
      })
    );

    try {
      await likeTimelinePost(postId, session?.id, authorName);
    } catch (_) {}
  };

  // Toggle Follow
  const handleToggleFollow = async (targetUser) => {
    if (targetUser === authorName) {
      alert('You cannot follow yourself.');
      return;
    }
    const currentStatus = !!followingMap[targetUser];
    const newStatus = !currentStatus;
    setFollowingMap((prev) => ({ ...prev, [targetUser]: newStatus }));
    showToast(newStatus ? `✓ Now following ${targetUser}` : `Unfollowed ${targetUser}`);

    try {
      await followUser(authorName, targetUser);
    } catch (err) {
      console.warn('Follow error:', err);
    }
  };

  // Toggle Friend
  const handleToggleFriend = async (targetUser) => {
    if (targetUser === authorName) {
      alert('You are already friends with yourself!');
      return;
    }
    const currentStatus = !!friendsMap[targetUser];
    const newStatus = !currentStatus;
    setFriendsMap((prev) => ({ ...prev, [targetUser]: newStatus }));
    showToast(newStatus ? `🤝 You are now friends with ${targetUser}!` : `Removed friend ${targetUser}`);

    try {
      await addFriend(authorName, targetUser);
    } catch (err) {
      console.warn('Add friend error:', err);
    }
  };

  // Open Direct Message Chat
  const handleOpenDirectMessage = async (targetUser) => {
    if (targetUser === authorName) {
      alert('This is your own profile post.');
      return;
    }
    setActiveDmUser(targetUser);
    setDmLoading(true);
    try {
      const res = await fetchDirectMessages(authorName, targetUser);
      if (res && res.success && Array.isArray(res.messages)) {
        setDmList(res.messages);
      } else {
        setDmList([
          {
            id: 'init-1',
            sender_name: targetUser,
            message_text: `Ẹ ku ọjọ oni! Hello ${authorName}, nice connecting on the Ogere Civic Timeline.`,
            created_at: new Date(Date.now() - 600000).toISOString(),
          },
        ]);
      }
    } catch (_) {
      setDmList([
        {
          id: 'init-1',
          sender_name: targetUser,
          message_text: `Ẹ ku ọjọ oni! Hello ${authorName}, nice connecting on the Ogere Civic Timeline.`,
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setDmLoading(false);
      setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 200);
    }
  };

  // Send Direct Message
  const handleSendDm = async (e) => {
    e?.preventDefault();
    const text = dmInput.trim();
    if (!text || !activeDmUser) return;

    const newMsg = {
      id: `msg-${Date.now()}`,
      sender_name: authorName,
      recipient_name: activeDmUser,
      message_text: text,
      created_at: new Date().toISOString(),
      status: 'delivered',
    };

    setDmList((prev) => [...prev, newMsg]);
    setDmInput('');
    setDmSending(true);

    try {
      await sendDirectMessage(authorName, activeDmUser, text);
    } catch (_) {}
    finally {
      setDmSending(false);
      setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  // Comments
  const toggleComments = (postId) => {
    setExpandedComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleAddComment = async (postId) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    setSubmittingComment((prev) => ({ ...prev, [postId]: true }));
    try {
      const res = await addTimelineComment(postId, authorName || 'Verified Citizen', authorAvatar || '👤', text);
      if (res && res.success && res.data?.comment) {
        setPosts((prevPosts) =>
          prevPosts.map((p) => {
            if (p.id === postId) {
              const updatedComments = [...(p.comments || []), res.data.comment];
              return { ...p, comments: updatedComments, comments_count: updatedComments.length };
            }
            return p;
          })
        );
        setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
      }
    } catch (err) {
      alert('Could not submit comment: ' + err.message);
    } finally {
      setSubmittingComment((prev) => ({ ...prev, [postId]: false }));
    }
  };

  // Share
  const handleShare = async (post) => {
    const shareText = `Check out "${post.author_name}" on the Ogere Remo Civic Timeline:\n\n${post.content_text || 'Civic community photo update'}\n\nhttps://ogereremo.vercel.app/forum`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Ogere Remo Civic Timeline', text: shareText, url: window.location.href });
      } catch (_) {}
    } else {
      navigator.clipboard?.writeText(shareText);
      showToast('📋 Link and post text copied to clipboard!');
    }
  };

  const filteredPosts = posts.filter((p) => {
    if (filterQuarter === 'All') return true;
    return p.author_quarter === filterQuarter;
  });

  const displayPosts = maxPosts ? filteredPosts.slice(0, maxPosts) : filteredPosts;

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return 'Just now';
    try {
      const diffSec = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
      if (diffSec < 60) return 'Just now';
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
      if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
      return new Date(dateStr).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
    } catch (_) {
      return 'Recent';
    }
  };

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto', padding: '0 12px' }}>
      {/* Optional Embedded Section Header */}
      {showHeader && (title || subtitle) && (
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          {title && (
            <h2 className="playfair" style={{ fontSize: '2rem', color: 'var(--cream, #0f172a)', marginBottom: '8px', fontWeight: 700 }}>
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="baskerville" style={{ fontSize: '1rem', color: 'rgba(245, 237, 216, 0.75)', maxWidth: '600px', margin: '0 auto' }}>
              {subtitle}
            </p>
          )}
        </div>
      )}
      {/* Toast Banner */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: '#0f172a',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '12px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px',
            fontWeight: '600',
            border: '1px solid #d4af37',
          }}
        >
          <span>✨</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FACEBOOK STYLE "WHAT'S ON YOUR MIND?" COMPOSER CARD                      */}
      {/* ========================================================================= */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.07)',
          border: '1px solid #e2e8f0',
          padding: '18px',
          marginBottom: '24px',
        }}
      >
        {/* Top prompt bar */}
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: isComposerOpen ? '16px' : '10px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              color: '#d4af37',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              border: '2px solid #f8fafc',
            }}
          >
            {authorAvatar}
          </div>

          <div
            onClick={() => setIsComposerOpen(true)}
            style={{
              flex: 1,
              background: '#f1f5f9',
              borderRadius: '24px',
              padding: '12px 18px',
              color: '#64748b',
              fontSize: '15px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              border: '1px solid #e2e8f0',
              fontWeight: '500',
            }}
          >
            {authorName ? `What's on your mind, ${authorName.split(' ')[0]}?` : "What's on your mind? Share text or picture..."}
          </div>
        </div>

        {/* Expanded Composer Area */}
        {isComposerOpen && (
          <div style={{ paddingTop: '8px' }}>
            {/* Meta Row: Name, Quarter, Audience */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f8fafc', padding: '4px 10px', borderRadius: '20px', border: '1px solid #cbd5e1' }}>
                <span style={{ fontSize: '12px', color: '#475569', fontWeight: '600' }}>Name:</span>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Your Name"
                  style={{ border: 'none', background: 'transparent', fontSize: '13px', fontWeight: '700', color: '#0f172a', outline: 'none', width: '130px' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f8fafc', padding: '4px 10px', borderRadius: '20px', border: '1px solid #cbd5e1' }}>
                <span style={{ fontSize: '12px', color: '#475569' }}>📍</span>
                <select
                  value={selectedQuarter}
                  onChange={(e) => setSelectedQuarter(e.target.value)}
                  style={{ border: 'none', background: 'transparent', fontSize: '12px', fontWeight: '700', color: '#0f172a', outline: 'none', cursor: 'pointer' }}
                >
                  {QUARTERS.map((q) => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f8fafc', padding: '4px 10px', borderRadius: '20px', border: '1px solid #cbd5e1' }}>
                <select
                  value={selectedAudience}
                  onChange={(e) => setSelectedAudience(e.target.value)}
                  style={{ border: 'none', background: 'transparent', fontSize: '12px', fontWeight: '600', color: '#0f172a', outline: 'none', cursor: 'pointer' }}
                >
                  {AUDIENCES.map((a) => (
                    <option key={a.id} value={a.id}>{a.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Post text area */}
            <textarea
              rows={4}
              value={contentText}
              onChange={(e) => setContentText(e.target.value)}
              placeholder="What's happening in Ogere Remo? Share community updates, stories, or achievements..."
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                fontSize: '15px',
                lineHeight: '1.5',
                color: '#0f172a',
                resize: 'vertical',
                outline: 'none',
                fontFamily: 'inherit',
                marginBottom: '12px',
                boxSizing: 'border-box',
              }}
            />

            {/* Emoji Quick Bar */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Add emoji:</span>
              {['👍', '❤️', '👑', '👏', '🔥', '🇳🇬', '💡', '🎉'].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setContentText((prev) => prev + ' ' + emoji)}
                  style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '4px 8px', fontSize: '16px', cursor: 'pointer' }}
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Image Preview */}
            {imageUrl && (
              <div
                style={{
                  position: 'relative',
                  marginBottom: '14px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid #cbd5e1',
                  maxHeight: '320px',
                  background: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img src={imageUrl} alt="Attached preview" style={{ maxWidth: '100%', maxHeight: '320px', objectFit: 'contain' }} />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'rgba(15, 23, 42, 0.75)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '16px',
                  }}
                >
                  ✕
                </button>
              </div>
            )}

            {/* Photo Attachment Presets & Direct URL */}
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>
                  📸 Attach Photo (Camera / Upload / Presets)
                </span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    background: '#1877F2',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  📁 Upload from Device
                </button>
              </div>

              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                {PRESET_PHOTOS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setImageUrl(preset.url)}
                    style={{
                      background: imageUrl === preset.url ? '#dbeafe' : '#ffffff',
                      border: imageUrl === preset.url ? '1px solid #2563eb' : '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      fontSize: '11px',
                      fontWeight: '600',
                      color: imageUrl === preset.url ? '#1d4ed8' : '#475569',
                      cursor: 'pointer',
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Or paste any picture web link (https://...)"
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box', background: '#ffffff' }}
              />
            </div>

            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => { setIsComposerOpen(false); setImageUrl(''); setContentText(''); }}
                style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '14px', fontWeight: '600', cursor: 'pointer', padding: '8px 14px' }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handlePublishPost}
                disabled={submitting || (!contentText.trim() && !imageUrl.trim())}
                style={{
                  background: submitting || (!contentText.trim() && !imageUrl.trim()) ? '#94a3b8' : '#1877F2',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px 24px',
                  fontSize: '14px',
                  fontWeight: '800',
                  cursor: submitting || (!contentText.trim() && !imageUrl.trim()) ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(24, 119, 242, 0.3)',
                }}
              >
                {submitting ? 'Publishing...' : 'Post to Timeline 🚀'}
              </button>
            </div>
          </div>
        )}

        {/* Bottom quick bar when closed */}
        {!isComposerOpen && (
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
            <button
              onClick={() => { setIsComposerOpen(true); setTimeout(() => fileInputRef.current?.click(), 100); }}
              style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
            >
              <span style={{ fontSize: '18px' }}>🖼️</span>
              <span>Photo / Picture</span>
            </button>

            <button
              onClick={() => setIsComposerOpen(true)}
              style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
            >
              <span style={{ fontSize: '18px' }}>😃</span>
              <span>Share Thought</span>
            </button>

            <button
              onClick={() => setIsComposerOpen(true)}
              style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
            >
              <span style={{ fontSize: '18px' }}>📍</span>
              <span>Quarter Check-in</span>
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TIMELINE CONTROLS & FILTER BAR                                           */}
      {/* ========================================================================= */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
          <button
            onClick={() => setFilterQuarter('All')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '700',
              border: 'none',
              background: filterQuarter === 'All' ? '#1877F2' : '#e2e8f0',
              color: filterQuarter === 'All' ? '#ffffff' : '#334155',
              cursor: 'pointer',
            }}
          >
            All Ogere ({posts.length})
          </button>
          {QUARTERS.map((quarter) => {
            const count = posts.filter((p) => p.author_quarter === quarter).length;
            return (
              <button
                key={quarter}
                onClick={() => setFilterQuarter(quarter)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  border: 'none',
                  background: filterQuarter === quarter ? '#1877F2' : '#e2e8f0',
                  color: filterQuarter === quarter ? '#ffffff' : '#475569',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {quarter} {count > 0 && `(${count})`}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          style={{
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: '600',
            color: '#334155',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
          }}
        >
          <span style={{ display: 'inline-block', transform: refreshing ? 'rotate(360deg)' : 'none', transition: 'transform 0.6s linear' }}>🔄</span>
          {refreshing ? 'Refreshing...' : 'Refresh Feed'}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TIMELINE POSTS STREAM                                                    */}
      {/* ========================================================================= */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
          <div style={{ fontSize: '16px', fontWeight: '600' }}>Loading Ogere Civic Timeline...</div>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '40px 20px', textAlign: 'center', border: '1px solid #e2e8f0', color: '#64748b' }}>
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>✍️</div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>No updates yet in {filterQuarter}</h3>
          <p style={{ fontSize: '14px', marginBottom: '16px' }}>Be the first citizen to share what is on your mind or post a photo!</p>
          <button
            onClick={() => setIsComposerOpen(true)}
            style={{ background: '#1877F2', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: '700', cursor: 'pointer' }}
          >
            Create First Post
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {displayPosts.map((post) => {
            const userIdentifier = session?.id || authorName || 'citizen';
            const isLiked = (post.liked_by || []).includes(userIdentifier);
            const isCommentsOpen = !!expandedComments[post.id];
            const isFollowingAuthor = !!followingMap[post.author_name];
            const isFriendAuthor = !!friendsMap[post.author_name];
            const isSelf = post.author_name === authorName;

            return (
              <div
                key={post.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  boxShadow: '0 2px 14px rgba(0, 0, 0, 0.06)',
                  border: '1px solid #e2e8f0',
                  overflow: 'hidden',
                }}
              >
                {/* 1. Header: Author & Social Actions */}
                <div style={{ padding: '16px 18px 12px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                        color: '#d4af37',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        flexShrink: 0,
                        border: '2px solid #f1f5f9',
                      }}
                    >
                      {post.author_avatar || '👤'}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: '800', fontSize: '15px', color: '#0f172a' }}>{post.author_name}</span>
                        {post.is_verified && (
                          <span title="Verified Indigene / Official" style={{ color: '#1877F2', fontSize: '14px', fontWeight: 'bold' }}>
                            ✓
                          </span>
                        )}
                        <span style={{ fontSize: '11px', background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '12px', fontWeight: '600' }}>
                          📍 {post.author_quarter || 'Oke-Ogere'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px', fontSize: '12px', color: '#64748b' }}>
                        <span>{post.author_role || 'Resident'}</span>
                        <span>•</span>
                        <span>{formatTimestamp(post.created_at)}</span>
                        <span>•</span>
                        <span style={{ fontSize: '11px' }}>
                          {post.audience === 'Indigenes Only' ? '🏛️ Indigenes' : post.audience === 'Neighborhood Watch' ? '🛡️ Watch' : '🌐 Public'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Social Follow / Friend / Message Buttons */}
                  {!isSelf && (
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <button
                        onClick={() => handleToggleFollow(post.author_name)}
                        style={{
                          background: isFollowingAuthor ? '#e2e8f0' : '#eff6ff',
                          color: isFollowingAuthor ? '#475569' : '#1d4ed8',
                          border: isFollowingAuthor ? '1px solid #cbd5e1' : '1px solid #bfdbfe',
                          padding: '4px 10px',
                          borderRadius: '16px',
                          fontSize: '11px',
                          fontWeight: '700',
                          cursor: 'pointer',
                        }}
                      >
                        {isFollowingAuthor ? '✓ Following' : '+ Follow'}
                      </button>

                      <button
                        onClick={() => handleToggleFriend(post.author_name)}
                        style={{
                          background: isFriendAuthor ? '#dcfce7' : '#f8fafc',
                          color: isFriendAuthor ? '#15803d' : '#475569',
                          border: isFriendAuthor ? '1px solid #86efac' : '1px solid #e2e8f0',
                          padding: '4px 8px',
                          borderRadius: '16px',
                          fontSize: '11px',
                          fontWeight: '700',
                          cursor: 'pointer',
                        }}
                        title={isFriendAuthor ? 'Connected Citizen' : 'Connect Citizen'}
                      >
                        {isFriendAuthor ? '🤝 Friend' : '➕ Friend'}
                      </button>

                      <button
                        onClick={() => handleOpenDirectMessage(post.author_name)}
                        style={{
                          background: '#1877F2',
                          color: '#ffffff',
                          border: 'none',
                          padding: '4px 10px',
                          borderRadius: '16px',
                          fontSize: '11px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <span>💬</span>
                        <span>Chat</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. Post Content Text */}
                {post.content_text && (
                  <div style={{ padding: '0 18px 12px', fontSize: '15px', color: '#1e293b', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                    {post.content_text}
                  </div>
                )}

                {/* 3. Post Image (if attached) */}
                {post.image_url && (
                  <div
                    onClick={() => setLightboxImg(post.image_url)}
                    style={{
                      background: '#0f172a',
                      maxHeight: '420px',
                      overflow: 'hidden',
                      cursor: 'zoom-in',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <img
                      src={post.image_url}
                      alt="Timeline upload"
                      style={{ width: '100%', maxHeight: '420px', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                      onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
                      onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    />
                  </div>
                )}

                {/* 4. Stats Bar */}
                <div style={{ padding: '10px 18px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#64748b' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '14px' }}>👍❤️</span>
                    <span>{post.likes_count || 0} reactions</span>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <span onClick={() => toggleComments(post.id)} style={{ cursor: 'pointer' }}>
                      {(post.comments || []).length} comments
                    </span>
                    <span>•</span>
                    <span onClick={() => handleShare(post)} style={{ cursor: 'pointer' }}>
                      Share
                    </span>
                  </div>
                </div>

                {/* 5. Action Buttons (Facebook Style) */}
                <div style={{ borderTop: '1px solid #e2e8f0', borderBottom: isCommentsOpen ? '1px solid #e2e8f0' : 'none', padding: '4px 8px', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                  <button
                    onClick={() => handleLike(post.id)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      background: 'transparent',
                      border: 'none',
                      color: isLiked ? '#1877F2' : '#475569',
                      fontWeight: isLiked ? '800' : '600',
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      borderRadius: '8px',
                    }}
                  >
                    <span>{isLiked ? '👍' : '👍'}</span>
                    <span>{isLiked ? 'Liked' : 'Like'}</span>
                  </button>

                  <button
                    onClick={() => toggleComments(post.id)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      background: 'transparent',
                      border: 'none',
                      color: isCommentsOpen ? '#1877F2' : '#475569',
                      fontWeight: '600',
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      borderRadius: '8px',
                    }}
                  >
                    <span>💬</span>
                    <span>Comment</span>
                  </button>

                  <button
                    onClick={() => handleShare(post)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      background: 'transparent',
                      border: 'none',
                      color: '#475569',
                      fontWeight: '600',
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      borderRadius: '8px',
                    }}
                  >
                    <span>↗️</span>
                    <span>Share</span>
                  </button>
                </div>

                {/* 6. Comments Section */}
                {isCommentsOpen && (
                  <div style={{ background: '#f8fafc', padding: '14px 18px' }}>
                    {/* List of comments */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>
                      {(post.comments || []).length === 0 ? (
                        <div style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', padding: '8px 0' }}>
                          No comments yet. Write the first response!
                        </div>
                      ) : (
                        (post.comments || []).map((c, cIdx) => (
                          <div key={cIdx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                            <div
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: '#e2e8f0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '16px',
                                flexShrink: 0,
                              }}
                            >
                              {c.author_avatar || '👤'}
                            </div>
                            <div style={{ flex: 1, background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '8px 12px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                                <span style={{ fontWeight: '700', fontSize: '12px', color: '#0f172a' }}>{c.author_name}</span>
                                <span style={{ fontSize: '10px', color: '#94a3b8' }}>{formatTimestamp(c.created_at)}</span>
                              </div>
                              <div style={{ fontSize: '13px', color: '#334155', lineHeight: '1.4' }}>{c.comment_text}</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Add Comment Input */}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={commentInputs[post.id] || ''}
                        onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddComment(post.id);
                        }}
                        placeholder="Write a comment..."
                        style={{
                          flex: 1,
                          padding: '9px 14px',
                          borderRadius: '20px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13px',
                          outline: 'none',
                          background: '#ffffff',
                        }}
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        disabled={submittingComment[post.id] || !commentInputs[post.id]?.trim()}
                        style={{
                          background: '#1877F2',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '50%',
                          width: '36px',
                          height: '36px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: submittingComment[post.id] || !commentInputs[post.id]?.trim() ? 'not-allowed' : 'pointer',
                          opacity: submittingComment[post.id] || !commentInputs[post.id]?.trim() ? 0.6 : 1,
                        }}
                        title="Send comment"
                      >
                        ➤
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Embedded Full Timeline Link / CTA */}
          {embedded && (
            <div style={{ textAlign: 'center', marginTop: '10px', marginBottom: '10px' }}>
              <a
                href={linkToAll}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, rgba(201,150,58,0.2) 0%, rgba(201,150,58,0.05) 100%)',
                  border: '1.5px solid var(--gold, #C9963A)',
                  color: 'var(--cream, #f5edd8)',
                  padding: '12px 28px',
                  borderRadius: '30px',
                  fontSize: '14px',
                  fontWeight: '700',
                  textDecoration: 'none',
                  boxShadow: '0 4px 18px rgba(0,0,0,0.3)',
                  transition: 'all 0.2s ease',
                }}
              >
                <span>📜 View Full Civic Timeline & Town Discussions ({posts.length}+ Updates)</span>
                <span>➔</span>
              </a>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* DIRECT MESSAGING CHAT WINDOW (FACEBOOK MESSENGER STYLE)                  */}
      {/* ========================================================================= */}
      {activeDmUser && (
        <div
          style={{
            position: 'fixed',
            bottom: '16px',
            right: '24px',
            width: '360px',
            maxWidth: '92vw',
            height: '480px',
            background: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.22)',
            border: '1px solid #cbd5e1',
            zIndex: 9990,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Chat Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              color: '#ffffff',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: '#d4af37',
                  color: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  fontWeight: 'bold',
                }}
              >
                👤
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>{activeDmUser}</span>
                  <span style={{ fontSize: '8px', color: '#4ade80' }}>●</span>
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Direct Message • Ogere Civic Network</div>
              </div>
            </div>

            <button
              onClick={() => setActiveDmUser(null)}
              style={{ background: 'transparent', border: 'none', color: '#ffffff', fontSize: '18px', cursor: 'pointer', padding: '4px' }}
            >
              ✕
            </button>
          </div>

          {/* Messages Area */}
          <div style={{ flex: 1, padding: '14px', overflowY: 'auto', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {dmLoading ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: '13px' }}>Loading conversation...</div>
            ) : (
              dmList.map((msg, idx) => {
                const isMe = msg.sender_name === authorName;
                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                    <div
                      style={{
                        maxWidth: '80%',
                        padding: '9px 13px',
                        borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        background: isMe ? '#1877F2' : '#ffffff',
                        color: isMe ? '#ffffff' : '#0f172a',
                        border: isMe ? 'none' : '1px solid #e2e8f0',
                        fontSize: '13px',
                        lineHeight: '1.4',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                      }}
                    >
                      {msg.message_text}
                    </div>
                    <span style={{ fontSize: '10px', color: '#94a3b8', marginTop: '3px', marginHorizontal: '4px' }}>
                      {formatTimestamp(msg.created_at)}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendDm} style={{ padding: '10px 14px', background: '#ffffff', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="text"
              value={dmInput}
              onChange={(e) => setDmInput(e.target.value)}
              placeholder={`Message ${activeDmUser.split(' ')[0]}...`}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: '20px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={!dmInput.trim() || dmSending}
              style={{
                background: '#1877F2',
                color: '#ffffff',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: !dmInput.trim() || dmSending ? 'not-allowed' : 'pointer',
                opacity: !dmInput.trim() || dmSending ? 0.6 : 1,
              }}
            >
              ➤
            </button>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LIGHTBOX PHOTO MODAL                                                      */}
      {/* ========================================================================= */}
      {lightboxImg && (
        <div
          onClick={() => setLightboxImg(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div style={{ position: 'relative', maxWidth: '92vw', maxHeight: '92vh' }}>
            <img src={lightboxImg} alt="Expanded view" style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: '8px', boxShadow: '0 10px 40px rgba(0,0,0,0.8)' }} />
            <button
              onClick={() => setLightboxImg(null)}
              style={{
                position: 'absolute',
                top: '-16px',
                right: '-16px',
                background: '#ffffff',
                color: '#0f172a',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
