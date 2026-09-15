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

  // Memory fallback for emergency contacts and push tokens
  if (!global._memoryEmergencyContacts) global._memoryEmergencyContacts = [];
  if (!global._memoryPushTokens) global._memoryPushTokens = [];

  // 3. Emergency Guardian Contacts & Civic Users Directory
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
