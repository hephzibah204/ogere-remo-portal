import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Header } from '../../components/Header';
import { Colors, Spacing, Radius, Shadows } from '../../theme';
import { useAuth } from '../../services/authContext';
import { API_BASE_URL } from '../../database/syncManager';

interface Message {
  id: string;
  sender_name: string;
  recipient_name?: string | null;
  channel_id?: string;
  message_text: string;
  status: string;
  created_at: string;
  is_me?: boolean;
}

interface ChatContact {
  id: string;
  name: string;
  role: string;
  title: string;
  avatar: string;
  color: string;
  online: boolean;
  lastSeen: string;
  initialMsg?: string;
  isGroup?: boolean;
  membersCount?: number;
}

const DEFAULT_DIRECT_CONTACTS: ChatContact[] = [
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

const GROUP_CHANNELS: ChatContact[] = [
  {
    id: 'grp_general',
    name: 'Ogere Remo Town Square',
    role: 'Town Channel',
    title: 'Public town hub for civic notices, news & general discussion',
    avatar: '🏛️',
    color: '#10b981',
    online: true,
    lastSeen: '428 members',
    isGroup: true,
    membersCount: 428,
  },
  {
    id: 'grp_diaspora',
    name: 'Global Diaspora Network',
    role: 'Diaspora Hub',
    title: 'Indigenes connecting from UK, USA, Canada, and worldwide',
    avatar: '🌍',
    color: '#3b82f6',
    online: true,
    lastSeen: '156 members',
    isGroup: true,
    membersCount: 156,
  },
  {
    id: 'grp_security',
    name: 'Neighborhood Vigilante Watch',
    role: 'Safety Patrol',
    title: 'Safety monitoring, expressway road alerts & night patrol reports',
    avatar: '🛡️',
    color: '#ef4444',
    online: true,
    lastSeen: '312 members',
    isGroup: true,
    membersCount: 312,
  },
];

export const MessagesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const currentSenderName = user?.fullName || 'Ogere Citizen ' + Math.floor(100 + Math.random() * 900);

  const [activeTab, setActiveTab] = useState<'direct' | 'groups'>('direct');
  const [activeChat, setActiveChat] = useState<ChatContact | null>(null);
  const [dbContacts, setDbContacts] = useState<ChatContact[]>([]);
  const [customContacts, setCustomContacts] = useState<ChatContact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Messages state
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // New Chat Modal
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);

  const flatListRef = useRef<FlatList>(null);

  // 1. Fetch live registered users from backend
  useEffect(() => {
    const fetchRegisteredUsers = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/contacts`);
        if (res.ok) {
          const data = await res.json();
          const users = data.users || [];
          setRegisteredUsers(users);

          const mapped: ChatContact[] = users
            .filter((u: any) => u.full_name && u.full_name.trim().toLowerCase() !== currentSenderName.trim().toLowerCase())
            .map((u: any) => ({
              id: `usr_${u.id}`,
              name: u.full_name,
              role: u.agency_name ? `${u.agency_name} (${u.role || 'Officer'})` : (u.role === 'palace_protocol' ? 'Palace Protocol & Secretariat' : (u.citizen_type === 'indigene' ? `Indigene · ${u.quarter || 'Oke-Ogere'}` : 'Resident')),
              title: u.compound || u.agency_name || u.quarter || 'Ogere Remo Community',
              avatar: u.role === 'palace_protocol' || u.role === 'super_admin' ? '👑' : u.role === 'security_officer' ? '👮‍♂️' : '👤',
              color: u.role === 'security_officer' ? '#3b82f6' : u.role === 'palace_protocol' ? '#d97706' : '#059669',
              online: true,
              lastSeen: 'Active',
              initialMsg: `Direct conversation initiated with ${u.full_name}.`,
            }));
          setDbContacts(mapped);
        }
      } catch (_) {}
    };
    fetchRegisteredUsers();
  }, [currentSenderName]);

  // Combine contacts
  const existingNames = new Set<string>();
  const allDirectContacts: ChatContact[] = [];

  for (const c of dbContacts) {
    if (!existingNames.has(c.name.toLowerCase())) {
      existingNames.add(c.name.toLowerCase());
      allDirectContacts.push(c);
    }
  }
  for (const c of DEFAULT_DIRECT_CONTACTS) {
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

  // 2. Fetch messages for active chat
  const fetchMessages = async (showLoading = false) => {
    if (!activeChat) return;
    if (showLoading) setIsLoadingMessages(true);

    try {
      let url = '';
      if (activeChat.isGroup) {
        url = `${API_BASE_URL}/api/messages?channel=${encodeURIComponent(activeChat.id)}`;
      } else {
        url = `${API_BASE_URL}/api/messages?user1=${encodeURIComponent(currentSenderName)}&user2=${encodeURIComponent(activeChat.name)}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const serverMsgs: Message[] = (data.messages || []).map((m: any) => ({
          ...m,
          is_me: m.sender_name?.trim().toLowerCase() === currentSenderName.trim().toLowerCase(),
        }));

        if (serverMsgs.length === 0 && activeChat.initialMsg) {
          setMessages([
            {
              id: `init-${activeChat.id}`,
              sender_name: activeChat.name,
              message_text: activeChat.initialMsg,
              created_at: new Date(Date.now() - 3600000).toISOString(),
              status: 'read',
              is_me: false,
            },
          ]);
        } else {
          setMessages(serverMsgs);
        }
      }
    } catch (_) {} finally {
      if (showLoading) setIsLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (activeChat) {
      fetchMessages(true);
      const interval = setInterval(() => fetchMessages(false), 4000);
      return () => clearInterval(interval);
    }
  }, [activeChat?.id, currentSenderName]);

  // 3. Send message handler
  const handleSendMessage = async () => {
    if (!inputText.trim() || !activeChat || isSending) return;
    const text = inputText.trim();
    setInputText('');
    setIsSending(true);

    const tempId = `temp-${Date.now()}`;
    const newMsg: Message = {
      id: tempId,
      sender_name: currentSenderName,
      recipient_name: activeChat.isGroup ? null : activeChat.name,
      channel_id: activeChat.isGroup ? activeChat.id : 'direct',
      message_text: text,
      status: 'sending',
      created_at: new Date().toISOString(),
      is_me: true,
    };

    setMessages((prev) => [...prev, newMsg]);

    try {
      const res = await fetch(`${API_BASE_URL}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelId: activeChat.isGroup ? activeChat.id : 'direct',
          senderName: currentSenderName,
          recipientName: activeChat.isGroup ? null : activeChat.name,
          text,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...m, ...data.data, status: 'delivered', is_me: true } : m))
        );
      }
    } catch (_) {
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, status: 'delivered', is_me: true } : m))
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleStartDirectChat = (contact: ChatContact) => {
    setActiveChat(contact);
    setShowNewChatModal(false);
  };

  const handleCreateCustomContact = () => {
    if (!customName.trim()) return;
    const newContact: ChatContact = {
      id: `dm_${Date.now()}`,
      name: customName.trim(),
      role: customRole.trim() || 'Citizen / Resident',
      title: customRole.trim() || 'Ogere Remo',
      avatar: '👤',
      color: '#059669',
      online: true,
      lastSeen: 'Active',
      initialMsg: `Direct conversation initiated with ${customName.trim()}.`,
    };
    setCustomContacts((prev) => [newContact, ...prev]);
    setActiveChat(newContact);
    setCustomName('');
    setCustomRole('');
    setShowNewChatModal(false);
  };

  const filteredContacts = (activeTab === 'direct' ? allDirectContacts : GROUP_CHANNELS).filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* If in active chat */}
      {activeChat ? (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Chat Room Top Bar */}
          <View style={styles.chatHeader}>
            <TouchableOpacity
              onPress={() => setActiveChat(null)}
              style={styles.backBtn}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 20, color: '#ffffff' }}>←</Text>
            </TouchableOpacity>

            <View style={[styles.avatarCircle, { backgroundColor: activeChat.color }]}>
              <Text style={{ fontSize: 16 }}>{activeChat.avatar}</Text>
            </View>

            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.chatHeaderName} numberOfLines={1}>
                {activeChat.name}
              </Text>
              <Text style={styles.chatHeaderStatus} numberOfLines={1}>
                {activeChat.isGroup ? activeChat.lastSeen : '🟢 ' + activeChat.lastSeen}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => fetchMessages(true)}
              style={styles.refreshBtn}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 16, color: '#a7f3d0' }}>🔄</Text>
            </TouchableOpacity>
          </View>

          {/* Messages Feed */}
          <View style={styles.chatFeedContainer}>
            {isLoadingMessages ? (
              <View style={styles.centerLoading}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.loadingText}>Syncing messages...</Text>
              </View>
            ) : (
              <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.messagesList}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                renderItem={({ item }) => {
                  const isMe = item.is_me;
                  return (
                    <View
                      style={[
                        styles.bubbleWrapper,
                        isMe ? styles.bubbleWrapperRight : styles.bubbleWrapperLeft,
                      ]}
                    >
                      <View
                        style={[
                          styles.messageBubble,
                          isMe ? styles.bubbleMe : styles.bubbleThem,
                        ]}
                      >
                        {!isMe && activeChat.isGroup && (
                          <Text style={styles.groupSenderName}>{item.sender_name}</Text>
                        )}
                        <Text style={[styles.messageText, isMe ? styles.messageTextMe : styles.messageTextThem]}>
                          {item.message_text}
                        </Text>
                        <View style={styles.bubbleFooter}>
                          <Text style={[styles.timeText, isMe ? styles.timeTextMe : styles.timeTextThem]}>
                            {new Date(item.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Text>
                          {isMe && (
                            <Text style={styles.tickText}>
                              {item.status === 'sending' ? '🕒' : '✓✓'}
                            </Text>
                          )}
                        </View>
                      </View>
                    </View>
                  );
                }}
              />
            )}
          </View>

          {/* Chat Input Bar */}
          <View style={styles.inputBar}>
            <TextInput
              style={styles.chatInput}
              placeholder={`Message ${activeChat.name}...`}
              placeholderTextColor="#94a3b8"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                inputText.trim() ? styles.sendBtnActive : styles.sendBtnDisabled,
              ]}
              onPress={handleSendMessage}
              disabled={!inputText.trim() || isSending}
              activeOpacity={0.8}
            >
              {isSending ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.sendIcon}>➤</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      ) : (
        /* Conversation List View */
        <View style={{ flex: 1 }}>
          <Header
            title="TOWN MESSENGER"
            subtitle={`Signed in as ${currentSenderName}`}
            onProfilePress={() => navigation.navigate('Profile')}
          />

          {/* Top Segment Tabs */}
          <View style={styles.tabsRow}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'direct' && styles.tabBtnActive]}
              onPress={() => setActiveTab('direct')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  activeTab === 'direct' && styles.tabBtnTextActive,
                ]}
              >
                💬 Direct 1-on-1 ({allDirectContacts.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'groups' && styles.tabBtnActive]}
              onPress={() => setActiveTab('groups')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  activeTab === 'groups' && styles.tabBtnTextActive,
                ]}
              >
                👥 Town Channels (3)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Search Input Bar */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search contacts, chiefs, or officers..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Contacts Feed */}
          <ScrollView contentContainerStyle={styles.contactsScroll}>
            {filteredContacts.map((contact) => (
              <TouchableOpacity
                key={contact.id}
                style={styles.contactItem}
                onPress={() => handleStartDirectChat(contact)}
                activeOpacity={0.7}
              >
                <View style={[styles.contactAvatar, { backgroundColor: contact.color }]}>
                  <Text style={{ fontSize: 22 }}>{contact.avatar}</Text>
                  {contact.online && <View style={styles.onlineDot} />}
                </View>

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={styles.contactHeaderRow}>
                    <Text style={styles.contactName} numberOfLines={1}>
                      {contact.name}
                    </Text>
                    <Text style={styles.contactTime}>{contact.online ? 'Online' : ''}</Text>
                  </View>
                  <Text style={styles.contactRole} numberOfLines={1}>
                    {contact.role}
                  </Text>
                  <Text style={styles.contactTitle} numberOfLines={1}>
                    {contact.title}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Floating Action Button: New Private Chat */}
          <TouchableOpacity
            style={styles.fabBtn}
            onPress={() => setShowNewChatModal(true)}
            activeOpacity={0.85}
          >
            <Text style={{ fontSize: 24, color: '#ffffff' }}>💬 +</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── MODAL: START PRIVATE CHAT WITH CITIZEN ── */}
      <Modal visible={showNewChatModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Start 1-on-1 Private Chat</Text>
              <TouchableOpacity onPress={() => setShowNewChatModal(false)}>
                <Text style={{ fontSize: 20, color: '#94a3b8' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Select any registered resident from the Neon database or enter a name below:
            </Text>

            {/* Registered Directory List */}
            {registeredUsers.length > 0 && (
              <View style={styles.directorySection}>
                <Text style={styles.directoryHeading}>
                  VERIFIED CITIZENS DIRECTORY ({registeredUsers.length})
                </Text>
                <ScrollView style={{ maxHeight: 150 }}>
                  {registeredUsers
                    .filter(
                      (u) =>
                        u.full_name &&
                        u.full_name.trim().toLowerCase() !== currentSenderName.trim().toLowerCase()
                    )
                    .map((u) => (
                      <TouchableOpacity
                        key={u.id}
                        style={styles.directoryItem}
                        onPress={() =>
                          handleStartDirectChat({
                            id: `usr_${u.id}`,
                            name: u.full_name,
                            role: u.agency_name ? `${u.agency_name}` : (u.role === 'palace_protocol' ? 'Palace Protocol' : (u.citizen_type === 'indigene' ? `Indigene · ${u.quarter || 'Oke-Ogere'}` : 'Resident')),
                            title: u.compound || u.quarter || 'Ogere Remo',
                            avatar: u.role === 'palace_protocol' ? '👑' : u.role === 'security_officer' ? '👮‍♂️' : '👤',
                            color: u.role === 'security_officer' ? '#3b82f6' : '#059669',
                            online: true,
                            lastSeen: 'Active',
                          })
                        }
                      >
                        <View>
                          <Text style={styles.dirName}>{u.full_name}</Text>
                          <Text style={styles.dirQuarter}>{u.quarter || u.citizen_type || 'Indigene'}</Text>
                        </View>
                        <Text style={styles.dirChatAction}>Chat ➔</Text>
                      </TouchableOpacity>
                    ))}
                </ScrollView>
              </View>
            )}

            {/* Manual Form */}
            <Text style={[styles.directoryHeading, { marginTop: 12 }]}>OR TYPE CITIZEN NAME</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Chief Adebayo Ogunlesi"
              placeholderTextColor="#94a3b8"
              value={customName}
              onChangeText={setCustomName}
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Role or Quarter (e.g. Agbele Quarter)"
              placeholderTextColor="#94a3b8"
              value={customRole}
              onChangeText={setCustomRole}
            />

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowNewChatModal(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={handleCreateCustomContact}
              >
                <Text style={styles.confirmBtnText}>Start Conversation</Text>
              </TouchableOpacity>
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
    backgroundColor: '#0b141a',
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#111b21',
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#222d34',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: '#202c33',
  },
  tabBtnText: {
    color: '#8696a0',
    fontSize: 13,
    fontWeight: '700',
  },
  tabBtnTextActive: {
    color: '#00a884',
    fontWeight: '800',
  },
  searchContainer: {
    padding: 10,
    backgroundColor: '#111b21',
  },
  searchInput: {
    backgroundColor: '#202c33',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#e9edef',
    fontSize: 14,
  },
  contactsScroll: {
    paddingBottom: 80,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  contactAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  onlineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#25d366',
    borderWidth: 2,
    borderColor: '#111b21',
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  contactHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactName: {
    color: '#e9edef',
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  contactTime: {
    color: '#25d366',
    fontSize: 11,
    fontWeight: '600',
  },
  contactRole: {
    color: '#00a884',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  contactTitle: {
    color: '#8696a0',
    fontSize: 12,
    marginTop: 2,
  },
  fabBtn: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    backgroundColor: '#00a884',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#202c33',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2a3942',
  },
  backBtn: {
    padding: 6,
    marginRight: 6,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatHeaderName: {
    color: '#e9edef',
    fontSize: 15,
    fontWeight: '700',
  },
  chatHeaderStatus: {
    color: '#25d366',
    fontSize: 11,
    marginTop: 1,
  },
  refreshBtn: {
    padding: 8,
  },
  chatFeedContainer: {
    flex: 1,
    backgroundColor: '#0b141a',
  },
  centerLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#8696a0',
    fontSize: 13,
    marginTop: 8,
  },
  messagesList: {
    padding: 12,
    paddingBottom: 20,
  },
  bubbleWrapper: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bubbleWrapperRight: {
    justifyContent: 'flex-end',
  },
  bubbleWrapperLeft: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '82%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  bubbleMe: {
    backgroundColor: '#005c4b',
    borderBottomRightRadius: 2,
  },
  bubbleThem: {
    backgroundColor: '#202c33',
    borderBottomLeftRadius: 2,
  },
  groupSenderName: {
    color: '#f59e0b',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 19,
  },
  messageTextMe: {
    color: '#e9edef',
  },
  messageTextThem: {
    color: '#e9edef',
  },
  bubbleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 4,
  },
  timeText: {
    fontSize: 10,
  },
  timeTextMe: {
    color: 'rgba(255,255,255,0.6)',
  },
  timeTextThem: {
    color: '#8696a0',
  },
  tickText: {
    color: '#53bdeb',
    fontSize: 10,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#202c33',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#2a3942',
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#2a3942',
    color: '#e9edef',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    maxHeight: 100,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendBtnActive: {
    backgroundColor: '#00a884',
  },
  sendBtnDisabled: {
    backgroundColor: '#2a3942',
  },
  sendIcon: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#111b21',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#222d34',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    color: '#e9edef',
    fontSize: 16,
    fontWeight: '800',
  },
  modalSubtitle: {
    color: '#8696a0',
    fontSize: 12,
    marginBottom: 12,
  },
  directorySection: {
    backgroundColor: '#0b141a',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#222d34',
    marginBottom: 8,
  },
  directoryHeading: {
    color: '#00a884',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  directoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#1a2730',
  },
  dirName: {
    color: '#e9edef',
    fontSize: 13,
    fontWeight: '700',
  },
  dirQuarter: {
    color: '#8696a0',
    fontSize: 11,
  },
  dirChatAction: {
    color: '#00a884',
    fontSize: 12,
    fontWeight: '700',
  },
  modalInput: {
    backgroundColor: '#202c33',
    color: '#e9edef',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2a3942',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#202c33',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#8696a0',
    fontSize: 13,
    fontWeight: '700',
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: '#00a884',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
});
