import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Animated, TouchableOpacity } from 'react-native';
import { syncManager, SyncStatus } from '../database/syncManager';
import { Colors, Typography, Spacing } from '../theme';

export const OfflineNotice: React.FC = () => {
  const [status, setStatus] = useState<SyncStatus>({
    isOnline: true,
    isSyncing: false,
    lastSynced: null,
    pendingCount: 0,
  });

  useEffect(() => {
    const unsubscribe = syncManager.subscribe(setStatus);
    return unsubscribe;
  }, []);

  if (status.isOnline && !status.isSyncing && status.pendingCount === 0) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        status.isOnline ? styles.onlineSyncContainer : styles.offlineContainer,
      ]}
    >
      <View style={styles.contentRow}>
        <View
          style={[
            styles.dot,
            status.isOnline ? styles.syncDot : styles.offlineDot,
          ]}
        />
        <Text style={styles.text}>
          {!status.isOnline
            ? 'Offline Mode · Viewing Cached Records'
            : status.isSyncing
            ? 'Updating Community Content with Palace Server...'
            : `${status.pendingCount} submission(s) pending sync`}
        </Text>
      </View>

      {status.isOnline && !status.isSyncing && (
        <TouchableOpacity
          onPress={() => syncManager.performDeltaSync()}
          style={styles.syncBtn}
        >
          <Text style={styles.syncBtnText}>Sync Now</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 999,
  },
  offlineContainer: {
    backgroundColor: '#fffbeb',
    borderBottomWidth: 1,
    borderBottomColor: '#fde68a',
  },
  onlineSyncContainer: {
    backgroundColor: '#ecfdf5',
    borderBottomWidth: 1,
    borderBottomColor: '#a7f3d0',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  offlineDot: {
    backgroundColor: '#d97706',
  },
  syncDot: {
    backgroundColor: '#059669',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  syncBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  syncBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
});
