import { sqlQuery } from './lib/db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { pathname } = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const isScholarships = pathname.includes('scholarships') || req.query.type === 'scholarships';
  const isForum = pathname.includes('forum') || req.query.type === 'forum';
  const isTimeline = pathname.includes('timeline') || pathname.includes('feed') || req.query.type === 'timeline' || req.query.type === 'feed';

  // 1. Scholarships
  if (isScholarships) {
    if (req.method === 'POST') {
      const body = req.body || {};
      const appId = body.id || `SCH-APP-${Math.floor(100 + Math.random() * 900)}`;

      try {
        await sqlQuery(
          `INSERT INTO scholarship_applications
            (id, program_id, program_title, applicant_name, compound, institution, cgpa, email, phone, statement, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            appId,
            body.programId || '1',
            body.programTitle || 'Ogere Kingdom Academic Grant',
            body.applicantName || '',
            body.compound || '',
            body.institution || '',
            body.cgpa || '',
            body.email || '',
            body.phone || '',
            body.statement || '',
            body.status || 'under_review',
          ]
        );

        return res.status(201).json({
          success: true,
          message: 'Scholarship application submitted and registered in Neon database.',
          data: { id: appId, ...body },
        });
      } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
    }

    try {
      const rows = await sqlQuery('SELECT * FROM scholarship_applications ORDER BY created_at DESC LIMIT 50');
      return res.status(200).json({ success: true, total: rows.length, data: rows });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // 2. Forum
  if (isForum) {
    if (req.method === 'POST') {
      const body = req.body || {};
      const postId = Date.now();

      try {
        await sqlQuery(
          `INSERT INTO forum_posts (id, author_name, category, topic, body) VALUES ($1, $2, $3, $4, $5)`,
          [postId, body.name || 'Citizen', body.cat || 'general', body.topic || '', body.body || '']
        );

        return res.status(201).json({
          success: true,
          message: 'Discussion topic posted to community forum.',
          data: { id: postId, ...body },
        });
      } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
    }

    try {
      const rows = await sqlQuery('SELECT * FROM forum_posts ORDER BY created_at DESC LIMIT 50');
      return res.status(200).json({ success: true, total: rows.length, data: rows });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // 3. Civic Timeline Feed ("What's on your mind?")
  if (!global._memoryTimelinePosts) {
    global._memoryTimelinePosts = [
      {
        id: 'POST-101',
        author_name: 'HRH Ologere Palace Secretariat',
        author_role: 'Royal Court Protocol',
        author_quarter: 'Oke-Ogere',
        author_avatar: '👑',
        content_text: 'E ku odun, e ku iye dun! 🌟 Preparations for the 50th Golden Jubilee Lipakala Festival are in full gear at Aafin Ologere. Youth cultural troupes and age-grade groups are invited for ceremonial auditions this Saturday. Let us celebrate our royal heritage with dignity and harmony! #OgereRemo #LipakalaJubilee #Heritage',
        image_url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1200&q=80',
        audience: 'Public Feed',
        likes_count: 64,
        liked_by: ['usr_cit_001', 'usr_admin_001'],
        comments_count: 2,
        comments: [
          { id: 'c1', author_name: 'Chief Olatunji Orowa', author_avatar: '🏛️', comment_text: 'Kabiyeesi o! The elders of Kankanbina are fully ready with the ancestral masquerade troupe.', created_at: new Date(Date.now() - 3600000 * 3).toISOString() },
          { id: 'c2', author_name: 'Segun Adebayo (Youth President)', author_avatar: '🦅', comment_text: 'The youth wing has registered over 120 volunteers for crowd marshaling and logistics!', created_at: new Date(Date.now() - 3600000 * 2).toISOString() }
        ],
        created_at: new Date(Date.now() - 3600000 * 4).toISOString()
      },
      {
        id: 'POST-102',
        author_name: 'Engr. Dapo Saliu',
        author_role: 'Civic Infrastructure Taskforce',
        author_quarter: 'Wasimi Quarter',
        author_avatar: '⚡',
        content_text: 'Proud to share that Phase 2 of our Community Solar Streetlights project along the Wasimi-Ijana market corridor is officially completed! Over 45 high-lumen solar lamps are now active, keeping our night traders safe and vibrant. Big thanks to OCDA and our diaspora donors! 💡✨ #CivicProgress #LightUpOgere',
        image_url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80',
        audience: 'Public Feed',
        likes_count: 92,
        liked_by: ['usr_admin_001'],
        comments_count: 1,
        comments: [
          { id: 'c3', author_name: 'Iya Oloja Wasimi', author_avatar: '🧺', comment_text: 'Thank you Engr. Dapo! We can now sell our fresh farm produce till 9 PM with complete peace of mind.', created_at: new Date(Date.now() - 3600000 * 5).toISOString() }
        ],
        created_at: new Date(Date.now() - 3600000 * 8).toISOString()
      },
      {
        id: 'POST-103',
        author_name: 'Mrs. Folashade Adeleke',
        author_role: 'Wasimi Adire Artisans Hub',
        author_quarter: 'Ijana Quarter',
        author_avatar: '🎨',
        content_text: 'Fresh batch of genuine Ogere Adire Eleko and indigo-dyed fabrics ready for the upcoming trade exhibition! Our young women apprentices spent 3 weeks perfecting these traditional patterns. Preserving our ancestral craft while creating sustainable livelihoods! 🧵💙 #MadeInOgere #AdireHeritage #Empowerment',
        image_url: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=1200&q=80',
        audience: 'Public Feed',
        likes_count: 51,
        liked_by: [],
        comments_count: 1,
        comments: [
          { id: 'c4', author_name: 'Dr. Folashade Adeyemi-Clark (London)', author_avatar: '✈️', comment_text: 'Can we order batches shipped to the UK diaspora chapter for our cultural gala next month?', created_at: new Date(Date.now() - 3600000 * 10).toISOString() }
        ],
        created_at: new Date(Date.now() - 3600000 * 16).toISOString()
      },
      {
        id: 'POST-104',
        author_name: 'Commander Kayode Adeleke',
        author_role: 'Joint Patrol Commander',
        author_quarter: 'Expressway Axis',
        author_avatar: '🛡️',
        content_text: 'Security Advisory: Routine night patrols across the Sagamu-Benin Expressway interchange and inner ring-road corridors have been intensified. Please keep emergency speed dials handy in your Ogere Mobile App. If you notice any suspicious gathering, use the SOS beacon or Whistleblower hotline immediately. We remain on 24/7 guard! 🚓🚨 #OgereSafety #Vigilance',
        image_url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
        audience: 'Public Feed',
        likes_count: 78,
        liked_by: [],
        comments_count: 0,
        comments: [],
        created_at: new Date(Date.now() - 3600000 * 24).toISOString()
      }
    ];
  }

  if (isTimeline) {
    try {
      await sqlQuery(`
        CREATE TABLE IF NOT EXISTS community_timeline_posts (
          id VARCHAR(64) PRIMARY KEY,
          author_name VARCHAR(255) NOT NULL,
          author_role VARCHAR(100),
          author_quarter VARCHAR(100),
          author_avatar VARCHAR(255),
          content_text TEXT,
          image_url TEXT,
          audience VARCHAR(50) DEFAULT 'Public Feed',
          likes_count INT DEFAULT 0,
          liked_by JSONB DEFAULT '[]',
          comments_count INT DEFAULT 0,
          comments JSONB DEFAULT '[]',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `).catch(() => {});
    } catch (_) {}

    if (req.method === 'POST') {
      const body = req.body || {};
      const action = body.action || 'create_post';

      // Action 1: Toggle Like
      if (action === 'like_post') {
        const { postId, userId, userName } = body;
        const post = global._memoryTimelinePosts.find(p => p.id === postId);
        if (post) {
          const userKey = userId || userName || 'citizen';
          const alreadyLiked = (post.liked_by || []).includes(userKey);
          if (alreadyLiked) {
            post.liked_by = (post.liked_by || []).filter(k => k !== userKey);
            post.likes_count = Math.max(0, (post.likes_count || 1) - 1);
          } else {
            if (!post.liked_by) post.liked_by = [];
            post.liked_by.push(userKey);
            post.likes_count = (post.likes_count || 0) + 1;
          }

          try {
            await sqlQuery(
              `UPDATE community_timeline_posts SET likes_count = $1, liked_by = $2 WHERE id = $3`,
              [post.likes_count, JSON.stringify(post.liked_by), postId]
            ).catch(() => {});
          } catch (_) {}

          return res.status(200).json({
            success: true,
            message: alreadyLiked ? 'Post unliked' : 'Post liked',
            data: {
              postId,
              likes_count: post.likes_count,
              liked: !alreadyLiked
            }
          });
        }
        return res.status(404).json({ success: false, error: 'Post not found' });
      }

      // Action 2: Add Comment
      if (action === 'add_comment') {
        const { postId, author_name, author_avatar, comment_text } = body;
        if (!comment_text || !comment_text.trim()) {
          return res.status(400).json({ success: false, error: 'Comment text is required.' });
        }

        const post = global._memoryTimelinePosts.find(p => p.id === postId);
        if (post) {
          const newComment = {
            id: `cmt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            author_name: author_name || 'Verified Citizen',
            author_avatar: author_avatar || '👤',
            comment_text: comment_text.trim(),
            created_at: new Date().toISOString()
          };

          if (!post.comments) post.comments = [];
          post.comments.push(newComment);
          post.comments_count = post.comments.length;

          try {
            await sqlQuery(
              `UPDATE community_timeline_posts SET comments_count = $1, comments = $2 WHERE id = $3`,
              [post.comments_count, JSON.stringify(post.comments), postId]
            ).catch(() => {});
          } catch (_) {}

          return res.status(201).json({
            success: true,
            message: 'Comment published to timeline post.',
            data: {
              postId,
              comment: newComment,
              comments_count: post.comments_count
            }
          });
        }
        return res.status(404).json({ success: false, error: 'Post not found' });
      }

      // Action 3: Follow User (Toggle)
      if (action === 'follow_user') {
        const { current_user, target_user } = body;
        if (!current_user || !target_user) {
          return res.status(400).json({ success: false, error: 'current_user and target_user are required' });
        }
        if (!global._memorySocialConnections) global._memorySocialConnections = [];
        const existingIdx = global._memorySocialConnections.findIndex(
          c => c.user_name === current_user && c.target_user_name === target_user && c.relationship_type === 'follow'
        );

        let isFollowing = false;
        if (existingIdx >= 0) {
          global._memorySocialConnections.splice(existingIdx, 1);
          isFollowing = false;
        } else {
          global._memorySocialConnections.push({
            id: `SOC-${Date.now()}`,
            user_name: current_user,
            target_user_name: target_user,
            relationship_type: 'follow',
            status: 'active',
            created_at: new Date().toISOString()
          });
          isFollowing = true;
        }

        try {
          if (isFollowing) {
            await sqlQuery(
              `INSERT INTO community_social_connections (id, user_name, target_user_name, relationship_type, status) VALUES ($1, $2, $3, $4, $5)`,
              [`SOC-${Date.now()}`, current_user, target_user, 'follow', 'active']
            ).catch(() => {});
          } else {
            await sqlQuery(
              `DELETE FROM community_social_connections WHERE user_name = $1 AND target_user_name = $2 AND relationship_type = 'follow'`,
              [current_user, target_user]
            ).catch(() => {});
          }
        } catch (_) {}

        return res.status(200).json({
          success: true,
          message: isFollowing ? `Now following ${target_user}` : `Unfollowed ${target_user}`,
          data: { isFollowing, target_user }
        });
      }

      // Action 4: Add Friend (Toggle)
      if (action === 'add_friend') {
        const { current_user, target_user } = body;
        if (!current_user || !target_user) {
          return res.status(400).json({ success: false, error: 'current_user and target_user are required' });
        }
        if (!global._memorySocialConnections) global._memorySocialConnections = [];
        const existingIdx = global._memorySocialConnections.findIndex(
          c => ((c.user_name === current_user && c.target_user_name === target_user) ||
               (c.user_name === target_user && c.target_user_name === current_user)) &&
               c.relationship_type === 'friend'
        );

        let friendStatus = 'none';
        if (existingIdx >= 0) {
          global._memorySocialConnections.splice(existingIdx, 1);
          friendStatus = 'none';
        } else {
          global._memorySocialConnections.push({
            id: `FRD-${Date.now()}`,
            user_name: current_user,
            target_user_name: target_user,
            relationship_type: 'friend',
            status: 'accepted',
            created_at: new Date().toISOString()
          });
          friendStatus = 'friends';
        }

        try {
          if (friendStatus === 'friends') {
            await sqlQuery(
              `INSERT INTO community_social_connections (id, user_name, target_user_name, relationship_type, status) VALUES ($1, $2, $3, $4, $5)`,
              [`FRD-${Date.now()}`, current_user, target_user, 'friend', 'accepted']
            ).catch(() => {});
          } else {
            await sqlQuery(
              `DELETE FROM community_social_connections WHERE ((user_name = $1 AND target_user_name = $2) OR (user_name = $2 AND target_user_name = $1)) AND relationship_type = 'friend'`,
              [current_user, target_user]
            ).catch(() => {});
          }
        } catch (_) {}

        return res.status(200).json({
          success: true,
          message: friendStatus === 'friends' ? `You are now friends with ${target_user}` : `Removed ${target_user} from friends`,
          data: { friendStatus, target_user }
        });
      }

      // Action 5: Create New Timeline Post ("What's on your mind?")
      const {
        author_name,
        author_role,
        author_quarter,
        author_avatar,
        content_text,
        image_url,
        audience
      } = body;

      if (!content_text?.trim() && !image_url?.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Please enter what is on your mind or attach a picture to share.'
        });
      }

      const newPostId = `POST-${Date.now()}`;
      const newPost = {
        id: newPostId,
        author_name: author_name?.trim() || 'Verified Citizen',
        author_role: author_role || 'Resident',
        author_quarter: author_quarter || 'Oke-Ogere',
        author_avatar: author_avatar || '👤',
        content_text: content_text?.trim() || '',
        image_url: image_url?.trim() || '',
        audience: audience || 'Public Feed',
        likes_count: 0,
        liked_by: [],
        comments_count: 0,
        comments: [],
        created_at: new Date().toISOString()
      };

      global._memoryTimelinePosts.unshift(newPost);

      try {
        await sqlQuery(
          `INSERT INTO community_timeline_posts
            (id, author_name, author_role, author_quarter, author_avatar, content_text, image_url, audience, likes_count, liked_by, comments_count, comments, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
          [
            newPost.id,
            newPost.author_name,
            newPost.author_role,
            newPost.author_quarter,
            newPost.author_avatar,
            newPost.content_text,
            newPost.image_url,
            newPost.audience,
            0,
            JSON.stringify([]),
            0,
            JSON.stringify([]),
            newPost.created_at
          ]
        ).catch(() => {});
      } catch (_) {}

      return res.status(201).json({
        success: true,
        message: 'Status update published to Ogere Civic Timeline.',
        data: newPost
      });
    }

    // GET Timeline Feed
    const currentUser = req.query.current_user || null;
    let followingList = [];
    let friendsList = [];
    if (global._memorySocialConnections && currentUser) {
      followingList = global._memorySocialConnections
        .filter(c => c.user_name === currentUser && c.relationship_type === 'follow')
        .map(c => c.target_user_name);
      friendsList = global._memorySocialConnections
        .filter(c => ((c.user_name === currentUser || c.target_user_name === currentUser) && c.relationship_type === 'friend'))
        .map(c => c.user_name === currentUser ? c.target_user_name : c.user_name);
    }

    try {
      const rows = await sqlQuery('SELECT * FROM community_timeline_posts ORDER BY created_at DESC LIMIT 50');
      if (rows && rows.length > 0) {
        const parsed = rows.map(r => ({
          ...r,
          liked_by: typeof r.liked_by === 'string' ? JSON.parse(r.liked_by) : (r.liked_by || []),
          comments: typeof r.comments === 'string' ? JSON.parse(r.comments) : (r.comments || [])
        }));
        return res.status(200).json({
          success: true,
          total: parsed.length,
          data: parsed,
          social: {
            following: followingList,
            friends: friendsList
          }
        });
      }
    } catch (_) {}

    return res.status(200).json({
      success: true,
      total: global._memoryTimelinePosts.length,
      data: global._memoryTimelinePosts,
      social: {
        following: followingList,
        friends: friendsList
      }
    });
  }

  // Memory fallback for emergency contacts and push tokens
  if (!global._memoryEmergencyContacts) global._memoryEmergencyContacts = [];
  if (!global._memoryPushTokens) global._memoryPushTokens = [];

  // 4. Emergency Guardian Contacts & Civic Users Directory
  const isContacts = pathname.includes('contacts') || pathname.includes('users') || req.query.type === 'contacts' || req.query.type === 'users';
  if (isContacts) {
    const action = req.body?.action || req.query?.action;
    const userId = req.body?.userId || req.query?.userId;

    // Handle Emergency Contacts operations
    if (action === 'list' || req.query?.userId) {
      try {
        const rows = await sqlQuery('SELECT * FROM emergency_contacts WHERE user_id = $1 ORDER BY created_at DESC', [userId || 'default_user']).catch(() => []);
        const results = rows.length > 0 ? rows : global._memoryEmergencyContacts.filter(c => c.user_id === userId || !userId);
        return res.status(200).json({ success: true, contacts: results });
      } catch (_) {
        const results = global._memoryEmergencyContacts.filter(c => c.user_id === userId || !userId);
        return res.status(200).json({ success: true, contacts: results });
      }
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      if (body.action === 'add') {
        const newContact = {
          id: `ec_${Date.now()}`,
          user_id: body.userId || 'default_user',
          name: body.name || 'Guardian',
          phone: body.phone || '',
          relationship: body.relationship || 'Kin',
          notify_on_sos: body.notifyOnSos !== false,
          created_at: new Date().toISOString(),
        };
        global._memoryEmergencyContacts.push(newContact);
        try {
          await sqlQuery(
            `INSERT INTO emergency_contacts (id, user_id, name, phone, relationship, notify_on_sos)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [newContact.id, newContact.user_id, newContact.name, newContact.phone, newContact.relationship, newContact.notify_on_sos]
          ).catch(() => {});
        } catch (_) {}
        return res.status(201).json({ success: true, message: 'Guardian contact added.', contact: newContact });
      }

      if (body.action === 'delete') {
        const id = body.id;
        global._memoryEmergencyContacts = global._memoryEmergencyContacts.filter(c => c.id !== id);
        try {
          await sqlQuery('DELETE FROM emergency_contacts WHERE id = $1', [id]).catch(() => {});
        } catch (_) {}
        return res.status(200).json({ success: true, message: 'Guardian contact deleted.' });
      }
    }

    // Default users directory query
    try {
      const rows = await sqlQuery(
        `SELECT id, full_name, role, citizen_type, quarter, compound, agency_name, id_card_number, created_at 
         FROM users 
         ORDER BY 
           CASE WHEN role = 'super_admin' OR role = 'palace_protocol' THEN 1 
                WHEN role = 'security_officer' THEN 2 
                WHEN role = 'ocda_admin' THEN 3 
                ELSE 4 END, 
           full_name ASC 
         LIMIT 100`
      );
      return res.status(200).json({
        success: true,
        total: rows.length,
        users: rows,
        contacts: rows,
      });
    } catch (err) {
      console.warn('[Community Users Directory Fallback]:', err.message);
      return res.status(200).json({
        success: true,
        total: 0,
        users: [],
        contacts: [],
      });
    }
  }

  // 4. Civic Community Messaging & Chat System
  const isMessages = pathname.includes('messages') || pathname.includes('chat') || req.query.type === 'messages';
  if (isMessages) {
    // Ensure table exists
    try {
      await sqlQuery(`
        CREATE TABLE IF NOT EXISTS community_messages (
          id VARCHAR(64) PRIMARY KEY,
          channel_id VARCHAR(64) NOT NULL DEFAULT 'general',
          sender_name VARCHAR(128) NOT NULL,
          sender_phone VARCHAR(32),
          recipient_name VARCHAR(128),
          message_text TEXT NOT NULL,
          media_type VARCHAR(32) DEFAULT 'text',
          media_url TEXT,
          status VARCHAR(32) DEFAULT 'delivered',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_comm_msg_channel ON community_messages(channel_id, created_at DESC);
      `);
    } catch (_) {}

    // Send Message
    if (req.method === 'POST') {
      const body = req.body || {};
      const msgId = `MSG-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
      const channelId = body.channelId || 'general';
      const senderName = body.senderName || 'Ogere Citizen';
      const senderPhone = body.senderPhone || '';
      const text = body.text || body.message || '';
      const recipientName = body.recipientName || null;
      const mediaType = body.mediaType || 'text'; // text, image, audio, location
      const mediaUrl = body.mediaUrl || null;
      const status = 'delivered';

      try {
        await sqlQuery(
          `INSERT INTO community_messages 
            (id, channel_id, sender_name, sender_phone, recipient_name, message_text, media_type, media_url, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [msgId, channelId, senderName, senderPhone, recipientName, text, mediaType, mediaUrl, status]
        );

        return res.status(201).json({
          success: true,
          message: 'Message sent successfully',
          data: {
            id: msgId,
            channel_id: channelId,
            sender_name: senderName,
            sender_phone: senderPhone,
            recipient_name: recipientName,
            message_text: text,
            media_type: mediaType,
            media_url: mediaUrl,
            status,
            created_at: new Date().toISOString(),
          },
        });
      } catch (err) {
        console.warn('[Community Messaging Fallback]:', err.message);
        return res.status(201).json({
          success: true,
          message: 'Message dispatched',
          data: {
            id: msgId,
            channel_id: channelId,
            sender_name: senderName,
            message_text: text,
            status: 'delivered',
            created_at: new Date().toISOString(),
          },
        });
      }
    }

    // Retrieve Messages (Channel or Direct 1-on-1 between two users)
    const channel = req.query.channel || null;
    const user1 = req.query.user1 || null;
    const user2 = req.query.user2 || null;

    try {
      let rows;
      if (user1 && user2) {
        // Direct 1-on-1 private message query
        rows = await sqlQuery(
          `SELECT * FROM community_messages 
           WHERE (sender_name = $1 AND recipient_name = $2)
              OR (sender_name = $2 AND recipient_name = $1)
           ORDER BY created_at ASC 
           LIMIT 100`,
          [user1, user2]
        );
      } else {
        // Channel / room query
        rows = await sqlQuery(
          `SELECT * FROM community_messages 
           WHERE channel_id = $1 
           ORDER BY created_at ASC 
           LIMIT 100`,
          [channel || 'general']
        );
      }

      return res.status(200).json({
        success: true,
        channel: channel || `${user1} <-> ${user2}`,
        total: rows.length,
        messages: rows,
      });
    } catch (err) {
      return res.status(200).json({
        success: true,
        channel: channel || 'private',
        total: 0,
        messages: [],
      });
    }
  }

  // 5. Delta Sync Handler: /api/sync
  const isSync = pathname.includes('sync') || req.query.type === 'sync';
  if (isSync) {
    return res.status(200).json({
      success: true,
      delta: {
        news: [],
        businesses: [],
      },
      timestamp: new Date().toISOString(),
    });
  }

  // 6. Push Tokens Registration: /api/push-tokens
  const isPushTokens = pathname.includes('push-tokens') || pathname.includes('push') || req.query.type === 'push-tokens';
  if (isPushTokens) {
    if (req.method === 'POST') {
      const { token, userId, role } = req.body || {};
      if (token) {
        global._memoryPushTokens.push({
          token,
          user_id: userId || 'anonymous',
          role: role || 'citizen',
          updated_at: new Date().toISOString(),
        });
      }
      return res.status(200).json({ success: true, message: 'Push token registered successfully.' });
    }
    return res.status(200).json({ success: true, tokensCount: global._memoryPushTokens.length });
  }

  // Default community status
  return res.status(200).json({
    success: true,
    service: 'Ogere Remo Community API',
    timestamp: new Date().toISOString(),
  });
}
