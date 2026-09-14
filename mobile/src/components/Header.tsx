import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Colors, Spacing } from '../theme';
import { useAuth } from '../services/authContext';
import { SosModal } from './SosModal';
import { liveTrackingService, LiveTrackingState } from '../services/liveTrackingService';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showProfile?: boolean;
  onProfilePress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'OGERE REMO',
  subtitle = 'Community & Royal Portal',
  showProfile = true,
  onProfilePress,
}) => {
  const { user } = useAuth();
  const [sosVisible, setSosVisible] = useState(false);
  const [liveState, setLiveState] = useState<LiveTrackingState>(liveTrackingService.getState());

  React.useEffect(() => {
    const unsub = liveTrackingService.subscribe(setLiveState);
    return unsub;
  }, []);

  return (
    <>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={styles.badgeRow}>
            <Text style={styles.royalEmblem}>👑</Text>
            <Text style={styles.title}>{title}</Text>
          </View>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        <View style={styles.rightActionsRow}>
          {/* Quick SOS Trigger Button */}
          <TouchableOpacity
            style={styles.sosButton}
            onPress={() => setSosVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.sosText}>SOS 🚨</Text>
          </TouchableOpacity>

          {showProfile && (
            <TouchableOpacity
              style={styles.profileBadge}
              onPress={onProfilePress}
              activeOpacity={0.8}
            >
              {user ? (
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>
                    {user.fullName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              ) : (
                <View style={styles.guestBadge}>
                  <Text style={styles.guestText}>GUEST</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Omnipresent WhatsApp-Style Live Location Radar Strip */}
      {liveState.isActive && (
        <View style={styles.liveStrip}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
            <Text style={{ fontSize: 13 }}>🟢</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.liveStripTitle}>
                LIVE LOCATION STREAMING ON (WHATSAPP STYLE)
              </Text>
              <Text style={styles.liveStripSub}>
                Ogere Security Command tracking · {liveState.pingCount} pings · {liveState.currentCoords?.speed || 0} km/h
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => liveTrackingService.stopTracking()}
            style={styles.liveStripEndBtn}
          >
            <Text style={styles.liveStripEndText}>End Sharing</Text>
          </TouchableOpacity>
        </View>
      )}

      <SosModal visible={sosVisible} onClose={() => setSosVisible(false)} />
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingTop: 14,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderBottomColor: Colors.gold,
  },
  titleContainer: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  royalEmblem: {
    fontSize: 18,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 11,
    color: '#a7f3d0',
    fontWeight: '500',
    marginTop: 2,
  },
  rightActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sosButton: {
    backgroundColor: '#dc2626',
    borderWidth: 1.5,
    borderColor: '#fca5a5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  sosText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  profileBadge: {
    padding: 2,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  guestBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  guestText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  liveStrip: {
    backgroundColor: '#052e16',
    borderBottomWidth: 1.5,
    borderBottomColor: '#22c55e',
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  liveStripTitle: {
    color: '#4ade80',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  liveStripSub: {
    color: '#bbf7d0',
    fontSize: 9,
    marginTop: 1,
  },
  liveStripEndBtn: {
    backgroundColor: '#b91c1c',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  liveStripEndText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
});
