import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
  RefreshControl,
} from 'react-native';
import { Colors, Spacing, Radius, Shadows } from '../../theme';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { useAdminAuth, OfficerRole } from '../../services/adminAuthContext';
import { API_BASE_URL } from '../../database/syncManager';

export const AdminDashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { officer, signOutOfficer, activeRole, switchDutyRole } = useAdminAuth();
  const [stats, setStats] = useState<any>({
    incidents: { total: 0, code_red: 0, open_count: 0, dispatched_count: 0 },
    audiences: { total: 0, pending: 0, confirmed: 0, postponed: 0 },
    idCards: { total: 0, pending: 0, approved: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [urgentIncidents, setUrgentIncidents] = useState<any[]>([]);
  const [pendingAudiences, setPendingAudiences] = useState<any[]>([]);

  const fetchCommandData = async () => {
    try {
      const [statsRes, incRes, audRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin-officers`).catch(() => null),
        fetch(`${API_BASE_URL}/api/incidents?limit=5`).catch(() => null),
        fetch(`${API_BASE_URL}/api/royal-audiences?status=pending`).catch(() => null),
      ]);

      if (statsRes && statsRes.ok) {
        const d = await statsRes.json();
        if (d.stats) setStats(d.stats);
      }

      if (incRes && incRes.ok) {
        const d = await incRes.json();
        setUrgentIncidents(d.incidents || d.data || []);
      }

      if (audRes && audRes.ok) {
        const d = await audRes.json();
        setPendingAudiences(d.bookings || d.data || []);
      }
    } catch (e) {
      console.warn('Command data fetch notice:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCommandData();
    const interval = setInterval(fetchCommandData, 15000);
    return () => clearInterval(interval);
  }, [activeRole]);

  const handleSignOut = () => {
    Alert.alert('Sign Out of Duty', 'Are you sure you want to log off your officer terminal?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Off',
        style: 'destructive',
        onPress: async () => {
          await signOutOfficer();
          navigation.reset({ index: 0, routes: [{ name: 'AdminLogin' }] });
        },
      },
    ]);
  };

  const getRoleHeader = () => {
    if (activeRole === 'security_officer') {
      return {
        title: 'TACTICAL SECURITY DISPATCH',
        subtitle: 'Joint Patrol Operations · Expressway Corridor',
        themeColor: '#ef4444',
        icon: '🛡️',
      };
    }
    if (activeRole === 'palace_protocol') {
      return {
        title: 'PALACE PROTOCOL SECRETARIAT',
        subtitle: 'Audience Manifest & Chamberlain Registry',
        themeColor: Colors.gold,
        icon: '👑',
      };
    }
    return {
      title: 'OCDA CIVIC CENTRAL COMMAND',
      subtitle: 'Town Operations, ID Cards & Public Registries',
      themeColor: '#059669',
      icon: '🏛️',
    };
  };

  const roleInfo = getRoleHeader();

  return (
    <SafeAreaView style={styles.container}>
      {/* Officer Command Top Bar */}
      <View style={styles.topBar}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 16 }}>{roleInfo.icon}</Text>
            <Text style={[styles.agencyText, { color: roleInfo.themeColor }]}>
              {officer?.agencyName || 'Ogere Remo Field Command'}
            </Text>
          </View>
          <Text style={styles.officerName}>
            {officer?.fullName || 'Officer on Duty'} ({officer?.badgeNumber || 'DUTY-01'})
          </Text>
        </View>

        <TouchableOpacity onPress={handleSignOut} style={styles.signoutBtn}>
          <Text style={styles.signoutBtnText}>Log Off</Text>
        </TouchableOpacity>
      </View>

      {/* Duty Role Switcher Ribbon (for multi-clearance officials) */}
      <View style={styles.dutySwitcher}>
        <TouchableOpacity
          onPress={() => switchDutyRole('security_officer')}
          style={[styles.switchChip, activeRole === 'security_officer' && styles.switchChipActive]}
        >
          <Text style={styles.switchChipText}>🛡️ Security</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => switchDutyRole('palace_protocol')}
          style={[styles.switchChip, activeRole === 'palace_protocol' && styles.switchChipActive]}
        >
          <Text style={styles.switchChipText}>👑 Protocol</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => switchDutyRole('ocda_admin')}
          style={[styles.switchChip, activeRole === 'ocda_admin' && styles.switchChipActive]}
        >
          <Text style={styles.switchChipText}>🏛️ OCDA Admin</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchCommandData(); }}
            tintColor={Colors.gold}
          />
        }
      >
        {/* Urgent CODE RED Broadcast Warning Banner */}
        {Number(stats.incidents.code_red || 0) > 0 && (
          <View style={styles.codeRedBanner}>
            <Text style={{ fontSize: 20 }}>🚨</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.codeRedTitle}>
                {stats.incidents.code_red} ACTIVE CODE RED ARMED EMERGENCY
              </Text>
              <Text style={styles.codeRedSub}>
                Police & Vigilante rapid response teams dispatched to sector.
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                const codeRed = urgentIncidents.find((i: any) => i.threat_level === 'CODE_RED') || urgentIncidents[0];
                if (codeRed) {
                  navigation.navigate('SosIntercept', { incident: codeRed });
                } else {
                  navigation.navigate('SecurityDashboard');
                }
              }}
              style={styles.codeRedAction}
            >
              <Text style={styles.codeRedActionText}>Intercept ➔</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Live Operational Counters Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statBox, { borderLeftColor: '#ef4444' }]}>
            <Text style={styles.statLabel}>ACTIVE INCIDENTS</Text>
            <Text style={[styles.statNum, { color: '#ef4444' }]}>
              {stats.incidents.open_count || 0}
            </Text>
            <Text style={styles.statSub}>
              {stats.incidents.dispatched_count || 0} units responding
            </Text>
          </View>

          <View style={[styles.statBox, { borderLeftColor: Colors.gold }]}>
            <Text style={styles.statLabel}>ROYAL AUDIENCES</Text>
            <Text style={[styles.statNum, { color: Colors.goldLight }]}>
              {stats.audiences.pending || 0}
            </Text>
            <Text style={styles.statSub}>
              {stats.audiences.confirmed || 0} confirmed passes
            </Text>
          </View>

          <View style={[styles.statBox, { borderLeftColor: '#059669' }]}>
            <Text style={styles.statLabel}>ID APPLICATIONS</Text>
            <Text style={[styles.statNum, { color: '#86efac' }]}>
              {stats.idCards.pending || 0}
            </Text>
            <Text style={styles.statSub}>
              {stats.idCards.approved || 0} certified badges
            </Text>
          </View>
        </View>

        {/* ── ROLE CONSOLE: 1. SECURITY PATROL OFFICER ── */}
        {activeRole === 'security_officer' && (
          <View style={styles.roleSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>🛡️ Tactical Security Operations</Text>
              <TouchableOpacity onPress={() => navigation.navigate('SecurityDashboard')}>
                <Text style={styles.sectionLink}>Full Agency Feed ➔</Text>
              </TouchableOpacity>
            </View>

            {/* Quick Action Matrix */}
            <View style={styles.actionGrid}>
              <TouchableOpacity
                onPress={() => navigation.navigate('SecurityDashboard')}
                style={styles.actionBtnCard}
              >
                <Text style={{ fontSize: 24 }}>🚨</Text>
                <Text style={styles.actionBtnTitle}>Agency Dispatch</Text>
                <Text style={styles.actionBtnDesc}>Live intercept radar & response</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('VerifyId')}
                style={styles.actionBtnCard}
              >
                <Text style={{ fontSize: 24 }}>🪪</Text>
                <Text style={styles.actionBtnTitle}>Gate ID Scanner</Text>
                <Text style={styles.actionBtnDesc}>Validate indigene & visitor IDs</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('Whistleblower')}
                style={styles.actionBtnCard}
              >
                <Text style={{ fontSize: 24 }}>🔒</Text>
                <Text style={styles.actionBtnTitle}>Anonymous SITREPs</Text>
                <Text style={styles.actionBtnDesc}>Encrypted tips & contraband alerts</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => Alert.alert('Geofenced Check-In', 'Outpost: Aafin Gatehouse\nGPS: 6.9368°N, 3.6330°E\nStatus: Verified on Night Patrol')}
                style={styles.actionBtnCard}
              >
                <Text style={{ fontSize: 24 }}>📍</Text>
                <Text style={styles.actionBtnTitle}>Patrol Check-In</Text>
                <Text style={styles.actionBtnDesc}>Log GPS outpost timestamp</Text>
              </TouchableOpacity>
            </View>

            {/* Recent Incoming Incidents */}
            <Card style={styles.card}>
              <Text style={styles.cardHeader}>Recent Priority Alerts</Text>
              {urgentIncidents.length === 0 ? (
                <Text style={styles.emptyText}>No open incident alerts at this time.</Text>
              ) : (
                urgentIncidents.slice(0, 5).map((inc: any) => (
                  <TouchableOpacity
                    key={inc.id}
                    style={styles.incidentRow}
                    onPress={() => navigation.navigate('SosIntercept', { incident: inc })}
                    activeOpacity={0.7}
                  >
                    <View style={{ flex: 1, gap: 3 }}>
                      {/* Category + threat level */}
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.incidentTitle}>{inc.category}</Text>
                        {inc.threat_level === 'CODE_RED' && (
                          <View style={{ backgroundColor: '#dc2626', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 }}>
                            <Text style={{ color: '#fff', fontSize: 8, fontWeight: '900' }}>CODE RED</Text>
                          </View>
                        )}
                      </View>
                      {/* Truncated description */}
                      <Text style={styles.incidentDesc} numberOfLines={1}>{inc.description}</Text>
                      {/* Location */}
                      <Text style={styles.incidentLoc}>📍 {inc.location}</Text>
                      {/* GPS + IP + Battery telemetry badges */}
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 2 }}>
                        {inc.latitude && inc.longitude && (
                          <View style={{ backgroundColor: 'rgba(56,189,248,0.15)', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2, borderWidth: 1, borderColor: 'rgba(56,189,248,0.3)' }}>
                            <Text style={{ color: '#38bdf8', fontSize: 8, fontWeight: '700', fontFamily: 'monospace' }}>
                              🛰️ {parseFloat(inc.latitude).toFixed(4)}, {parseFloat(inc.longitude).toFixed(4)}
                            </Text>
                          </View>
                        )}
                        {inc.accuracy && (
                          <View style={{ backgroundColor: 'rgba(34,197,94,0.1)', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2, borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)' }}>
                            <Text style={{ color: '#4ade80', fontSize: 8, fontWeight: '700' }}>±{Math.round(parseFloat(inc.accuracy))}m</Text>
                          </View>
                        )}
                        {inc.ip_address && (
                          <View style={{ backgroundColor: 'rgba(148,163,184,0.1)', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2, borderWidth: 1, borderColor: 'rgba(148,163,184,0.2)' }}>
                            <Text style={{ color: '#94a3b8', fontSize: 8 }}>🌐 {inc.ip_address}</Text>
                          </View>
                        )}
                        {inc.battery_level != null && (
                          <View style={{ backgroundColor: inc.battery_level > 20 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.15)', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2, borderWidth: 1, borderColor: inc.battery_level > 20 ? 'rgba(34,197,94,0.3)' : '#ef4444' }}>
                            <Text style={{ color: inc.battery_level > 20 ? '#4ade80' : '#f87171', fontSize: 8, fontWeight: '800' }}>🔋{inc.battery_level}%</Text>
                          </View>
                        )}
                        {inc.device_model && (
                          <View style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                            <Text style={{ color: '#64748b', fontSize: 8 }}>📱 {inc.device_model}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    {/* Right side: Map shortcut + tap indicator */}
                    <View style={{ alignItems: 'center', gap: 6 }}>
                      <TouchableOpacity
                        onPress={() => {
                          const lat = inc.latitude;
                          const lng = inc.longitude;
                          if (lat && lng) {
                            Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
                          }
                        }}
                        style={styles.mapSmallBtn}
                      >
                        <Text style={styles.mapSmallBtnText}>🧭</Text>
                      </TouchableOpacity>
                      <Text style={{ color: '#475569', fontSize: 9 }}>Tap row</Text>
                      <Text style={{ color: '#475569', fontSize: 9 }}>for full brief</Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
              <TouchableOpacity
                onPress={() => navigation.navigate('SecurityDashboard')}
                style={{ paddingTop: 8, alignItems: 'center' }}
              >
                <Text style={{ color: Colors.gold, fontSize: 11, fontWeight: '700' }}>
                View Full Agency Feed ➔
                </Text>
              </TouchableOpacity>
            </Card>
          </View>
        )}

        {/* ── ROLE CONSOLE: 2. PALACE PROTOCOL OFFICER ── */}
        {activeRole === 'palace_protocol' && (
          <View style={styles.roleSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>👑 Palace Audience & Chamber Protocol</Text>
              <TouchableOpacity onPress={() => navigation.navigate('AdminAudienceManager')}>
                <Text style={styles.sectionLink}>Manage Audiences ➔</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.actionGrid}>
              <TouchableOpacity
                onPress={() => navigation.navigate('AdminAudienceManager')}
                style={styles.actionBtnCard}
              >
                <Text style={{ fontSize: 24 }}>👑</Text>
                <Text style={styles.actionBtnTitle}>Audience Queue</Text>
                <Text style={styles.actionBtnDesc}>Assign chambers & dispatch royal passes</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('RoyalAudience')}
                style={styles.actionBtnCard}
              >
                <Text style={{ fontSize: 24 }}>🔍</Text>
                <Text style={styles.actionBtnTitle}>Pass Lookup</Text>
                <Text style={styles.actionBtnDesc}>Verify gate entry code at palace doors</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => Alert.alert('Royal Protocol Calendar', 'Palace Chambers:\n• Throne Room: Tues & Thurs 10am-2pm\n• Inner Council: Mon, Wed & Fri\n• Agbole Courtyard: Delegations & Clan Heads')}
                style={styles.actionBtnCard}
              >
                <Text style={{ fontSize: 24 }}>🏛️</Text>
                <Text style={styles.actionBtnTitle}>Chamber Guide</Text>
                <Text style={styles.actionBtnDesc}>Palace protocol & dress attire codes</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('VerifyId')}
                style={styles.actionBtnCard}
              >
                <Text style={{ fontSize: 24 }}>🪪</Text>
                <Text style={styles.actionBtnTitle}>VIP Gate Pass</Text>
                <Text style={styles.actionBtnDesc}>Scan visiting dignitary barcodes</Text>
              </TouchableOpacity>
            </View>

            {/* Pending Royal Audiences Queue */}
            <Card style={styles.card}>
              <Text style={styles.cardHeader}>Pending Requests Awaiting Kabiyesi's Review</Text>
              {pendingAudiences.length === 0 ? (
                <Text style={styles.emptyText}>All audience requests have been processed.</Text>
              ) : (
                pendingAudiences.slice(0, 3).map((b: any) => (
                  <View key={b.id} style={styles.incidentRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.incidentTitle}>{b.full_name || b.fullName}</Text>
                      <Text style={styles.incidentDesc} numberOfLines={1}>{b.purpose}</Text>
                      <Text style={styles.incidentLoc}>
                        📅 Req: {b.booking_date || b.bookingDate} · Ref: {b.id}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => navigation.navigate('AdminAudienceManager')}
                      style={[styles.mapSmallBtn, { backgroundColor: Colors.gold }]}
                    >
                      <Text style={[styles.mapSmallBtnText, { color: '#000' }]}>Review</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </Card>
          </View>
        )}

        {/* ── ROLE CONSOLE: 3. OCDA ADMINISTRATOR ── */}
        {activeRole === 'ocda_admin' && (
          <View style={styles.roleSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>🏛️ OCDA Civic Governance Desk</Text>
              <TouchableOpacity onPress={() => navigation.navigate('AdminIdApproval')}>
                <Text style={styles.sectionLink}>Review Applications ➔</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.actionGrid}>
              <TouchableOpacity
                onPress={() => navigation.navigate('AdminIdApproval')}
                style={styles.actionBtnCard}
              >
                <Text style={{ fontSize: 24 }}>🪪</Text>
                <Text style={styles.actionBtnTitle}>ID Approvals</Text>
                <Text style={styles.actionBtnDesc}>Approve & certify digital citizen cards</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('VerifyId')}
                style={styles.actionBtnCard}
              >
                <Text style={{ fontSize: 24 }}>🔍</Text>
                <Text style={styles.actionBtnTitle}>ID Registry Search</Text>
                <Text style={styles.actionBtnDesc}>Lookup citizen database records</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('IncidentReport')}
                style={styles.actionBtnCard}
              >
                <Text style={{ fontSize: 24 }}>📢</Text>
                <Text style={styles.actionBtnTitle}>Broadcast Alert</Text>
                <Text style={styles.actionBtnDesc}>Publish urgent town announcement</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('Whistleblower')}
                style={styles.actionBtnCard}
              >
                <Text style={{ fontSize: 24 }}>📋</Text>
                <Text style={styles.actionBtnTitle}>Civic Audit Log</Text>
                <Text style={styles.actionBtnDesc}>Inspection records & compliance</Text>
              </TouchableOpacity>
            </View>

            <Card style={styles.card}>
              <Text style={styles.cardHeader}>Palace & OCDA Operational Summary</Text>
              <Text style={{ fontSize: 12, color: 'rgba(245,237,216,0.7)', lineHeight: 18 }}>
                • Total Registered Citizens: <strong style={{ color: '#fff' }}>2,481</strong>{'\n'}
                • Digital ID Cards in Circulation: <strong style={{ color: '#86efac' }}>1,894</strong>{'\n'}
                • Active Express Corridor Patrol Units: <strong style={{ color: Colors.gold }}>4 Units</strong>{'\n'}
                • Night Curfew Status: <strong style={{ color: '#86efac' }}>Normal (No Active Curfew)</strong>
              </Text>
            </Card>
          </View>
        )}

        {/* Direct Link to Citizen Preview */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Main')}
          style={styles.citizenPortalBtn}
        >
          <Text style={styles.citizenPortalBtnText}>
            👁️ Preview Citizen Facing Portal (App Home) ➔
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0503',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    backgroundColor: '#160d07',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(201,150,58,0.25)',
  },
  agencyText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  officerName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 2,
  },
  signoutBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: Radius.sm,
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  signoutBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fca5a5',
  },
  dutySwitcher: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    backgroundColor: '#120904',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(201,150,58,0.15)',
  },
  switchChip: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(201,150,58,0.2)',
  },
  switchChipActive: {
    backgroundColor: 'rgba(201,150,58,0.25)',
    borderColor: Colors.gold,
  },
  switchChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.goldLight,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
    gap: 14,
  },
  codeRedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220,38,38,0.2)',
    borderWidth: 1.5,
    borderColor: '#ef4444',
    borderRadius: Radius.md,
    padding: 12,
    gap: 10,
  },
  codeRedTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#f87171',
  },
  codeRedSub: {
    fontSize: 10,
    color: '#fca5a5',
    marginTop: 2,
  },
  codeRedAction: {
    backgroundColor: '#dc2626',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: Radius.sm,
  },
  codeRedActionText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#160d07',
    padding: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(201,150,58,0.2)',
    borderLeftWidth: 3,
  },
  statLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: 'rgba(245,237,216,0.5)',
    letterSpacing: 0.5,
  },
  statNum: {
    fontSize: 18,
    fontWeight: '900',
    marginVertical: 2,
  },
  statSub: {
    fontSize: 9,
    color: 'rgba(245,237,216,0.6)',
  },
  roleSection: {
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.goldLight,
    letterSpacing: 0.5,
  },
  sectionLink: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.gold,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionBtnCard: {
    width: '48.5%',
    backgroundColor: '#160d07',
    borderWidth: 1,
    borderColor: 'rgba(201,150,58,0.25)',
    borderRadius: Radius.md,
    padding: 12,
    gap: 4,
  },
  actionBtnTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
  },
  actionBtnDesc: {
    fontSize: 10,
    color: 'rgba(245,237,216,0.5)',
    lineHeight: 14,
  },
  card: {
    backgroundColor: '#160d07',
    borderWidth: 1,
    borderColor: 'rgba(201,150,58,0.25)',
    borderRadius: Radius.md,
    padding: 12,
    gap: 8,
  },
  cardHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.goldLight,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(201,150,58,0.15)',
    paddingBottom: 6,
  },
  emptyText: {
    fontSize: 11,
    color: 'rgba(245,237,216,0.4)',
    fontStyle: 'italic',
    paddingVertical: 6,
  },
  incidentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  incidentTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
  },
  incidentDesc: {
    fontSize: 11,
    color: 'rgba(245,237,216,0.6)',
  },
  incidentLoc: {
    fontSize: 10,
    color: Colors.gold,
    marginTop: 2,
  },
  mapSmallBtn: {
    backgroundColor: '#ef4444',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: Radius.sm,
  },
  mapSmallBtnText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  citizenPortalBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(201,150,58,0.3)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    marginTop: 8,
  },
  citizenPortalBtnText: {
    color: Colors.goldLight,
    fontSize: 12,
    fontWeight: '700',
  },
});
