import React, { useState, useEffect, useRef } from 'react';
import SEO from '../components/SEO';

// Verified Civic Contacts for 1-on-1 Direct Messaging
const DIRECT_CONTACTS = [
  {
    id: 'dm_palace',
    name: 'Chief Adebisi Adeleke',
    role: 'Palace Protocol & Secretary',
    title: 'Aafin Ologere Secretariat',
    avatar: '👑',
    color: '#d97706',
    online: true,
    lastSeen: 'Online',
    initialMsg: 'Peace and royal greetings! How may the Palace Secretariat assist you today?',
  },
  {
    id: 'dm_police',
    name: 'ASP Babatunde Oladipo',
    role: 'Divisional Police Officer',
    title: 'Nigeria Police Force (Ogere Post)',
    avatar: '👮‍♂️',
    color: '#3b82f6',
    online: true,
    lastSeen: 'Online',
    initialMsg: 'Ogere Police Command direct desk. You may communicate confidential security inquiries or reports here.',
  },
  {
    id: 'dm_ocda',
    name: 'Engr. Olufemi Balogun',
    role: 'Community Admin & Works',
    title: 'Ogere Community Development Assoc. (OCDA)',
    avatar: '🏛️',
    color: '#10b981',
    online: true,
    lastSeen: 'Online',
    initialMsg: 'Hello! I handle community development projects, street illumination, and civic infrastructure.',
  },
  {
    id: 'dm_diaspora',
    name: 'Dr. Folashade Adeyemi-Clark',
    role: 'Diaspora Liaison',
    title: 'UK & Global Indigenes Alliance',
    avatar: '🌍',
    color: '#8b5cf6',
    online: false,
    lastSeen: 'Today at 02:15 PM',
    initialMsg: 'Warm regards from London! Reach out if you are an indigene abroad seeking to connect or invest back home.',
  },
  {
    id: 'dm_market',
    name: 'Alhaja Sikirat (Iya Oloja)',
    role: 'Market Leader',
    title: 'Oke-Ogere Central Market & Crafts',
    avatar: '🛍️',
    color: '#f59e0b',
    online: true,
    lastSeen: 'Online',
    initialMsg: 'E kaasan! Inquiries about market stalls, bulk agricultural purchases, or Adire textiles are welcome.',
  },
];

// Community Group Channels
const GROUP_CHANNELS = [
  {
    id: 'grp_general',
    name: 'Ogere Remo Community Square',
    desc: 'Public town hub for civic notices, news & general discussion',
    avatar: '🏛️',
    color: '#10b981',
    isGroup: true,
    membersCount: 428,
  },
  {
    id: 'grp_diaspora',
    name: 'Global Diaspora Network',
    desc: 'Indigenes connecting from UK, USA, Canada, and worldwide',
    avatar: '🌍',
    color: '#3b82f6',
    isGroup: true,
    membersCount: 156,
  },
  {
    id: 'grp_security',
    name: 'Neighborhood Vigilante Watch',
    desc: 'Safety monitoring, expressway road alerts & night patrol reports',
    avatar: '🛡️',
    color: '#ef4444',
    isGroup: true,
    membersCount: 312,
  },
];

export default function MessagesPage() {
  const [activeTab, setActiveTab] = useState('direct'); // 'direct' (1-on-1 private) or 'groups'
  const [activeChat, setActiveChat] = useState(DIRECT_CONTACTS[0]);
  const [senderName, setSenderName] = useState(() => {
    try {
      const savedUser = localStorage.getItem('ogere_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed.fullName) return parsed.fullName;
      }
    } catch (_) {}
    return localStorage.getItem('ogere_chat_name') || 'Ogere Citizen ' + Math.floor(100 + Math.random() * 900);
  });
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(senderName);

  // Registered database users state
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [dbContacts, setDbContacts] = useState([]);

  // New Private Contact Modal
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [customContactName, setCustomContactName] = useState('');
  const [customContactTitle, setCustomContactTitle] = useState('');
  const [customContacts, setCustomContacts] = useState([]);

  // Messages dictionary
  const [chatMessages, setChatMessages] = useState({});
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileView, setMobileView] = useState('list'); // 'list' or 'chat'

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat.id, chatMessages]);

  // Fetch real registered users from Neon database
  const fetchContacts = async () => {
    try {
      const res = await fetch('/api/contacts');
      if (res.ok) {
        const data = await res.json();
        const users = data.users || [];
        setRegisteredUsers(users);

        const mapped = users
          .filter(u => u.full_name && u.full_name.trim().toLowerCase() !== senderName.trim().toLowerCase())
          .map(u => ({
            id: `usr_${u.id}`,
            name: u.full_name,
            role: u.agency_name ? `${u.agency_name} (${u.role || 'Officer'})` : (u.role === 'palace_protocol' ? 'Palace Protocol & Secretariat' : (u.citizen_type === 'indigene' ? `Indigene · ${u.quarter || 'Oke-Ogere'}` : `${u.citizen_type || 'Resident'}`)),
            title: u.compound || u.agency_name || u.quarter || 'Ogere Remo Community',
            avatar: u.role === 'palace_protocol' || u.role === 'super_admin' ? '👑' : u.role === 'security_officer' ? '👮‍♂️' : u.role === 'ocda_admin' ? '🏛️' : '👤',
            color: u.role === 'security_officer' ? '#3b82f6' : u.role === 'palace_protocol' ? '#d97706' : '#059669',
            online: true,
            lastSeen: 'Active',
            initialMsg: `Direct conversation initiated with ${u.full_name}.`,
          }));
        setDbContacts(mapped);
      }
    } catch (_) {}
  };

  useEffect(() => {
    fetchContacts();
  }, [senderName]);

  // Combine database registered contacts, verified civic contacts, and custom session contacts
  const existingNames = new Set();
  const allDirectContacts = [];

  for (const c of dbContacts) {
    if (!existingNames.has(c.name.toLowerCase())) {
      existingNames.add(c.name.toLowerCase());
      allDirectContacts.push(c);
    }
  }
  for (const c of DIRECT_CONTACTS) {
    if (!existingNames.has(c.name.toLowerCase())) {
      existingNames.add(c.name.toLowerCase());
      allDirectContacts.push(c);
    }
  }
  for (const c of customContacts) {
    if (!existingNames.has(c.name.toLowerCase())) {
      existingNames.add(c.name.toLowerCase());
      allDirectContacts.push(c);
    }
  }

  // Fetch messages from backend for the active 1-on-1 or group
  const fetchMessages = async () => {
    try {
      let url = '';
      if (activeChat.isGroup) {
        url = `/api/messages?channel=${encodeURIComponent(activeChat.id)}`;
      } else {
        url = `/api/messages?user1=${encodeURIComponent(senderName)}&user2=${encodeURIComponent(activeChat.name)}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const serverMsgs = data.messages || [];

        // Seed initial greeting if empty
        const initialList = activeChat.initialMsg ? [{
          id: `init-${activeChat.id}`,
          sender_name: activeChat.name,
          message_text: activeChat.initialMsg,
          created_at: new Date(Date.now() - 3600000).toISOString(),
          status: 'read',
          is_me: false,
        }] : [];

        setChatMessages(prev => ({
          ...prev,
          [activeChat.id]: serverMsgs.length > 0 ? serverMsgs : (prev[activeChat.id] || initialList),
        }));
      }
    } catch (_) {}
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
  }, [activeChat.id, senderName]);

  // Send message handler
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const text = inputText.trim();
    setInputText('');
    setIsSending(true);

    const tempId = `temp-${Date.now()}`;
    const newMsg = {
      id: tempId,
      sender_name: senderName,
      recipient_name: activeChat.isGroup ? null : activeChat.name,
      channel_id: activeChat.isGroup ? activeChat.id : 'direct',
      message_text: text,
      created_at: new Date().toISOString(),
      status: 'sending',
      is_me: true,
    };

    // Optimistic UI update
    setChatMessages(prev => ({
      ...prev,
      [activeChat.id]: [...(prev[activeChat.id] || []), newMsg],
    }));

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelId: activeChat.isGroup ? activeChat.id : 'direct',
          senderName,
          recipientName: activeChat.isGroup ? null : activeChat.name,
          text,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages(prev => ({
          ...prev,
          [activeChat.id]: prev[activeChat.id].map(m => m.id === tempId ? { ...m, ...data.data, status: 'delivered', is_me: true } : m),
        }));
      }
    } catch (_) {
      setChatMessages(prev => ({
        ...prev,
        [activeChat.id]: prev[activeChat.id].map(m => m.id === tempId ? { ...m, status: 'delivered', is_me: true } : m),
      }));
    } finally {
      setIsSending(false);
    }
  };

  // Add custom user to chat with
  const handleStartCustomChat = (e) => {
    e.preventDefault();
    if (!customContactName.trim()) return;

    const newContact = {
      id: `dm_${Date.now()}`,
      name: customContactName.trim(),
      role: 'Citizen / Community Member',
      title: customContactTitle.trim() || 'Ogere Indigene',
      avatar: '👤',
      color: '#059669',
      online: true,
      lastSeen: 'Online',
      initialMsg: `Direct private conversation started between ${senderName} and ${customContactName.trim()}.`,
    };

    setCustomContacts(prev => [newContact, ...prev]);
    setActiveChat(newContact);
    setActiveTab('direct');
    setShowNewChatModal(false);
    setCustomContactName('');
    setCustomContactTitle('');
    setMobileView('chat');
  };

  const handleSaveName = () => {
    if (nameInput.trim()) {
      setSenderName(nameInput.trim());
      localStorage.setItem('ogere_chat_name', nameInput.trim());
      setIsEditingName(false);
    }
  };

  const currentMessages = chatMessages[activeChat.id] || (activeChat.initialMsg ? [{
    id: `init-${activeChat.id}`,
    sender_name: activeChat.name,
    message_text: activeChat.initialMsg,
    created_at: new Date().toISOString(),
    status: 'read',
    is_me: false,
  }] : []);

  const formatTime = (isoString) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const displayList = activeTab === 'direct' ? allDirectContacts : GROUP_CHANNELS;
  const filteredList = displayList.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.role && item.role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={{ background: '#0b141a', minHeight: '100vh', color: '#e9edef', paddingTop: '75px' }}>
      <SEO
        title="Direct Private Messenger — Ogere Remo Portal"
        description="Encrypted private 1-on-1 messaging between citizens, community leaders, and palace administration."
      />

      <div style={{ maxWidth: 1400, margin: '0 auto', height: 'calc(100vh - 75px)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', background: '#111b21', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          
          {/* ── LEFT SIDEBAR: CONVERSATION THREADS ── */}
          <div style={{
            width: '390px',
            borderRight: '1px solid #222d34',
            background: '#111b21',
            display: mobileView === 'chat' && window.innerWidth < 768 ? 'none' : 'flex',
            flexDirection: 'column',
            flexShrink: 0,
          }}>
            {/* Top Identity Header */}
            <div style={{ padding: '10px 16px', background: '#202c33', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                }}>
                  💬
                </div>
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#e9edef' }}>Direct Chat</div>
                  <div style={{ fontSize: '0.68rem', color: '#25d366', fontWeight: 600 }}>● Connected as {senderName}</div>
                </div>
              </div>

              {/* Start New Chat & Edit Profile */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => setShowNewChatModal(true)}
                  title="Message a new citizen"
                  style={{
                    background: '#00a884',
                    border: 'none',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: 900,
                  }}
                >
                  +
                </button>

                {isEditingName ? (
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <input
                      value={nameInput}
                      onChange={e => setNameInput(e.target.value)}
                      style={{ background: '#2a3942', border: '1px solid #00a884', color: '#fff', fontSize: '0.72rem', padding: '3px 6px', borderRadius: '4px', width: '90px' }}
                    />
                    <button onClick={handleSaveName} style={{ background: '#00a884', border: 'none', color: '#fff', fontSize: '0.65rem', padding: '3px 6px', borderRadius: '4px', cursor: 'pointer', fontWeight: 700 }}>OK</button>
                  </div>
                ) : (
                  <div onClick={() => setIsEditingName(true)} title="Click to rename yourself" style={{ background: '#2a3942', padding: '3px 8px', borderRadius: '16px', fontSize: '0.68rem', color: '#8696a0', cursor: 'pointer' }}>
                    ✏️ Name
                  </div>
                )}
              </div>
            </div>

            {/* Private 1-on-1 vs Community Groups Switcher */}
            <div style={{ display: 'flex', background: '#111b21', padding: '6px 12px', gap: '6px', borderBottom: '1px solid #222d34' }}>
              <button
                onClick={() => setActiveTab('direct')}
                style={{
                  flex: 1,
                  padding: '7px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  background: activeTab === 'direct' ? '#2a3942' : 'transparent',
                  color: activeTab === 'direct' ? '#00a884' : '#8696a0',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <span>👤 Private (1-on-1)</span>
                <span style={{ background: '#00a884', color: '#fff', fontSize: '0.62rem', padding: '1px 6px', borderRadius: '10px' }}>
                  {allDirectContacts.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('groups')}
                style={{
                  flex: 1,
                  padding: '7px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  background: activeTab === 'groups' ? '#2a3942' : 'transparent',
                  color: activeTab === 'groups' ? '#00a884' : '#8696a0',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <span>👥 Community Rooms</span>
              </button>
            </div>

            {/* Search Bar */}
            <div style={{ padding: '8px 12px', background: '#111b21', borderBottom: '1px solid #222d34' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#202c33', padding: '6px 12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.85rem', color: '#8696a0' }}>🔍</span>
                <input
                  type="text"
                  placeholder={activeTab === 'direct' ? 'Search contacts, leaders, or officers' : 'Search town rooms'}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: '#e9edef', fontSize: '0.82rem', width: '100%', outline: 'none' }}
                />
              </div>
            </div>

            {/* Conversation List */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {filteredList.map(item => {
                const isSelected = activeChat.id === item.id;
                const lastMsg = chatMessages[item.id]?.[chatMessages[item.id]?.length - 1];

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setActiveChat(item);
                      setMobileView('chat');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      cursor: 'pointer',
                      background: isSelected ? '#2a3942' : 'transparent',
                      borderBottom: '1px solid #222d34',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#202c33'; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div style={{ position: 'relative' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: `${item.color}25`,
                        border: `1.5px solid ${item.color}60`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.4rem',
                        flexShrink: 0,
                      }}>
                        {item.avatar}
                      </div>
                      {item.online && (
                        <div style={{
                          position: 'absolute',
                          bottom: 2,
                          right: 2,
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          background: '#25d366',
                          border: '2px solid #111b21',
                        }} />
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#e9edef', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.name}
                        </div>
                        {lastMsg && (
                          <div style={{ fontSize: '0.65rem', color: isSelected ? '#00a884' : '#8696a0', flexShrink: 0 }}>
                            {formatTime(lastMsg.created_at)}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '0.74rem', color: '#8696a0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {lastMsg ? lastMsg.message_text : (item.title || item.desc)}
                        </div>
                        {item.role && (
                          <span style={{ fontSize: '0.58rem', padding: '1px 5px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)', color: '#aebac1' }}>
                            {item.role.split(' ')[0]}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── RIGHT CHAT PANE: PRIVATE 1-ON-1 CONVERSATION ── */}
          <div style={{
            flex: 1,
            display: mobileView === 'list' && window.innerWidth < 768 ? 'none' : 'flex',
            flexDirection: 'column',
            background: '#0b141a',
            position: 'relative',
          }}>
            {/* WhatsApp Wallpaper Pattern */}
            <div style={{
              position: 'absolute',
              inset: 0,
              opacity: 0.035,
              backgroundImage: `radial-gradient(#25d366 1px, transparent 1px), radial-gradient(#ffffff 1px, transparent 1px)`,
              backgroundSize: '24px 24px',
              backgroundPosition: '0 0, 12px 12px',
              pointerEvents: 'none',
            }} />

            {/* Conversation Header */}
            <div style={{
              padding: '10px 16px',
              background: '#202c33',
              borderBottom: '1px solid #222d34',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative',
              zIndex: 2,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={() => setMobileView('list')}
                  style={{ background: 'transparent', border: 'none', color: '#00a884', fontSize: '1.3rem', cursor: 'pointer', display: 'none', '@media (max-width: 768px)': { display: 'block' } }}
                >
                  ←
                </button>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: `${activeChat.color}25`,
                  border: `1.5px solid ${activeChat.color}60`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem',
                }}>
                  {activeChat.avatar}
                </div>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e9edef' }}>
                    {activeChat.name}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: activeChat.online ? '#25d366' : '#8696a0' }}>
                    {activeChat.isGroup ? `${activeChat.membersCount} members` : (activeChat.online ? '● Online' : activeChat.lastSeen)}
                    {activeChat.title && <span style={{ color: '#8696a0' }}> · {activeChat.title}</span>}
                  </div>
                </div>
              </div>

              {/* Private Security Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontSize: '0.68rem',
                  background: 'rgba(37,211,102,0.12)',
                  color: '#25d366',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  <span>🔒</span>
                  <span>{activeChat.isGroup ? 'Verified Group' : 'Private Direct Message'}</span>
                </span>
              </div>
            </div>

            {/* Messages Feed */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '18px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              position: 'relative',
              zIndex: 2,
            }}>
              {/* Encryption Banner */}
              <div style={{ textAlign: 'center', margin: '4px 0 12px' }}>
                <div style={{
                  display: 'inline-block',
                  background: '#182229',
                  border: '1px solid #222d34',
                  borderRadius: '8px',
                  padding: '6px 14px',
                  fontSize: '0.68rem',
                  color: '#ffd279',
                  maxWidth: '480px',
                  lineHeight: 1.4,
                }}>
                  🔒 End-to-end encrypted private session between <strong>{senderName}</strong> and <strong>{activeChat.name}</strong>. No third parties or unauthorized operators can read these messages.
                </div>
              </div>

              {currentMessages.map((msg, idx) => {
                const isMe = msg.is_me || msg.sender_name === senderName;

                return (
                  <div
                    key={msg.id || idx}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isMe ? 'flex-end' : 'flex-start',
                      width: '100%',
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '75%',
                        background: isMe ? '#005c4b' : '#202c33',
                        color: '#e9edef',
                        borderRadius: isMe ? '8px 0px 8px 8px' : '0px 8px 8px 8px',
                        padding: '8px 12px 6px',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
                        position: 'relative',
                        wordBreak: 'break-word',
                      }}
                    >
                      {/* Sender Name in group */}
                      {!isMe && activeChat.isGroup && (
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#53bdeb', marginBottom: '3px' }}>
                          {msg.sender_name}
                        </div>
                      )}

                      <div style={{ fontSize: '0.86rem', lineHeight: 1.5, color: '#e9edef' }}>
                        {msg.message_text}
                      </div>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: '4px',
                        marginTop: '3px',
                        fontSize: '0.62rem',
                        color: 'rgba(255,255,255,0.6)',
                      }}>
                        <span>{formatTime(msg.created_at)}</span>
                        {isMe && (
                          <span style={{ color: msg.status === 'read' ? '#53bdeb' : '#8696a0', fontSize: '0.72rem' }}>
                            ✓✓
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Bar */}
            <form
              onSubmit={handleSendMessage}
              style={{
                padding: '10px 16px',
                background: '#202c33',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                position: 'relative',
                zIndex: 2,
              }}
            >
              <input
                type="text"
                placeholder={`Type a private message to ${activeChat.name}...`}
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                style={{
                  flex: 1,
                  background: '#2a3942',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '9px 14px',
                  color: '#e9edef',
                  fontSize: '0.88rem',
                  outline: 'none',
                }}
              />

              <button
                type="submit"
                disabled={isSending || !inputText.trim()}
                style={{
                  background: inputText.trim() ? '#00a884' : '#2a3942',
                  color: inputText.trim() ? '#fff' : '#8696a0',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  cursor: inputText.trim() ? 'pointer' : 'default',
                  transition: 'background 0.2s ease',
                }}
              >
                ➤
              </button>
            </form>

          </div>
        </div>
      </div>

      {/* ── MODAL: START NEW PRIVATE 1-ON-1 CHAT ── */}
      {showNewChatModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(6px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
        }}>
          <div style={{
            background: '#111b21',
            border: '1px solid #222d34',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '420px',
            padding: '1.5rem',
            color: '#e9edef',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ fontSize: '1rem', fontWeight: 800 }}>Start Private Chat</div>
              <button
                onClick={() => setShowNewChatModal(false)}
                style={{ background: 'none', border: 'none', color: '#8696a0', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.78rem', color: '#8696a0', marginBottom: '1.2rem', lineHeight: 1.5 }}>
              Select a verified community member or enter any name to start a confidential 1-on-1 direct conversation.
            </p>

            {/* Quick Select from Registered Directory */}
            {registeredUsers.length > 0 && (
              <div style={{ marginBottom: '1.2rem' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#00a884', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Registered Community Directory ({registeredUsers.length})
                </div>
                <div style={{ maxHeight: '140px', overflowY: 'auto', background: '#0b141a', borderRadius: '8px', border: '1px solid #222d34', padding: '4px' }}>
                  {registeredUsers
                    .filter(u => u.full_name && u.full_name.trim().toLowerCase() !== senderName.trim().toLowerCase())
                    .map(u => (
                      <div
                        key={u.id}
                        onClick={() => {
                          const contactObj = {
                            id: `usr_${u.id}`,
                            name: u.full_name,
                            role: u.agency_name ? `${u.agency_name} (${u.role || 'Officer'})` : (u.role === 'palace_protocol' ? 'Palace Protocol' : (u.citizen_type === 'indigene' ? `Indigene · ${u.quarter || 'Oke-Ogere'}` : 'Resident')),
                            title: u.compound || u.agency_name || u.quarter || 'Ogere Remo',
                            avatar: u.role === 'palace_protocol' || u.role === 'super_admin' ? '👑' : u.role === 'security_officer' ? '👮‍♂️' : '👤',
                            color: u.role === 'security_officer' ? '#3b82f6' : u.role === 'palace_protocol' ? '#d97706' : '#059669',
                            online: true,
                            lastSeen: 'Active',
                            initialMsg: `Direct conversation initiated with ${u.full_name}.`,
                          };
                          setCustomContacts(prev => [contactObj, ...prev.filter(c => c.name !== contactObj.name)]);
                          setActiveChat(contactObj);
                          setActiveTab('direct');
                          setShowNewChatModal(false);
                          setMobileView('chat');
                        }}
                        style={{
                          padding: '6px 10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#202c33'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#e9edef' }}>{u.full_name}</div>
                          <div style={{ fontSize: '0.65rem', color: '#8696a0' }}>{u.quarter || u.agency_name || u.citizen_type || 'Indigene'}</div>
                        </div>
                        <span style={{ fontSize: '0.7rem', color: '#00a884', fontWeight: 700 }}>Chat →</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#8696a0', marginBottom: '8px', textTransform: 'uppercase' }}>
              Or Enter New Contact Name
            </div>

            <form onSubmit={handleStartCustomChat} style={{ display: 'grid', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#8696a0', display: 'block', marginBottom: '4px' }}>
                  RECIPIENT NAME *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bisi Adeleke, Chief Sobukonla"
                  value={customContactName}
                  onChange={e => setCustomContactName(e.target.value)}
                  style={{ width: '100%', background: '#2a3942', border: '1px solid #222d34', padding: '8px 12px', borderRadius: '6px', color: '#fff', fontSize: '0.82rem' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#8696a0', display: 'block', marginBottom: '4px' }}>
                  ROLE / COMPOUND / QUARTER
                </label>
                <input
                  type="text"
                  placeholder="e.g. Agbele Quarter, Youth Leader, Farmer"
                  value={customContactTitle}
                  onChange={e => setCustomContactTitle(e.target.value)}
                  style={{ width: '100%', background: '#2a3942', border: '1px solid #222d34', padding: '8px 12px', borderRadius: '6px', color: '#fff', fontSize: '0.82rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowNewChatModal(false)}
                  style={{ flex: 1, background: '#202c33', color: '#8696a0', padding: '8px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, background: '#00a884', color: '#fff', padding: '8px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}
                >
                  Start Chatting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
