import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  Dimensions,
  StatusBar,
  Easing,
} from 'react-native';
import { Colors } from '../../theme';

interface SplashScreenProps {
  onFinish?: () => void;
  isOfficerApp?: boolean;
}

const { width } = Dimensions.get('window');

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish, isOfficerApp = false }) => {
  // Animation drivers
  const crownScale = useRef(new Animated.Value(0.3)).current;
  const crownOpacity = useRef(new Animated.Value(0)).current;
  const titleSlide = useRef(new Animated.Value(25)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const badgeOpacity = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;
  const exitOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Entrance sequence
    Animated.parallel([
      Animated.timing(crownScale, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.back(1.6)),
        useNativeDriver: true,
      }),
      Animated.timing(crownOpacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(titleSlide, {
        toValue: 0,
        duration: 800,
        delay: 350,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 700,
        delay: 350,
        useNativeDriver: true,
      }),
      Animated.timing(badgeOpacity, {
        toValue: 1,
        duration: 600,
        delay: 600,
        useNativeDriver: true,
      }),
      Animated.timing(progressWidth, {
        toValue: 1,
        duration: 2200,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: false,
      }),
    ]).start();

    // 2. Continuous royal seal halo breathing
    const breathing = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, {
          toValue: 1.08,
          duration: 1100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseScale, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    breathing.start();

    // 3. Graceful auto-transition if onFinish callback provided
    let timer: any;
    if (onFinish) {
      timer = setTimeout(() => {
        Animated.timing(exitOpacity, {
          toValue: 0,
          duration: 400,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }).start(() => {
          breathing.stop();
          onFinish();
        });
      }, 2500);
    }

    return () => {
      if (timer) clearTimeout(timer);
      breathing.stop();
    };
  }, []);

  const progressInterpolate = progressWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: exitOpacity }]}>
      <StatusBar barStyle="light-content" backgroundColor="#06382b" translucent={false} />

      {/* Decorative Gold Radial Vignette Background Circles */}
      <View style={styles.topVignette} />
      <View style={styles.bottomVignette} />

      {/* Centered Brand Emblem */}
      <View style={styles.centerContent}>
        {/* Pulsing Aura */}
        <Animated.View
          style={[
            styles.haloRing,
            {
              transform: [{ scale: pulseScale }],
            },
          ]}
        />

        {/* Royal Crest / Badge Emblem */}
        <Animated.View
          style={[
            styles.crestCircle,
            {
              opacity: crownOpacity,
              transform: [{ scale: crownScale }],
            },
          ]}
        >
          <Text style={styles.crestEmoji}>{isOfficerApp ? '🛡️' : '👑'}</Text>
          <View style={styles.crestFoilBorder} />
        </Animated.View>

        {/* Royal Hierarchy Typography */}
        <Animated.View
          style={{
            alignItems: 'center',
            opacity: titleOpacity,
            transform: [{ translateY: titleSlide }],
          }}
        >
          <Text style={styles.kingdomPrefix}>KINGDOM OF OGERE REMO</Text>
          <Text style={styles.appTitle}>
            {isOfficerApp ? 'OFFICER COMMAND' : 'CIVIC PORTAL'}
          </Text>
          <View style={styles.goldDivider} />
          <Text style={styles.motto}>
            {isOfficerApp
              ? 'Tactical Security Dispatch & Palace Protocol'
              : 'Gateway Kingdom of Heritage, Unity & Enterprise'}
          </Text>
        </Animated.View>

        {/* State Seal Sub-Badge */}
        <Animated.View style={[styles.sealPill, { opacity: badgeOpacity }]}>
          <Text style={styles.sealPillText}>
            {isOfficerApp ? 'LAW ENFORCEMENT & PALACE DESK' : 'REMO TRADITIONAL COUNCIL · OGUN STATE'}
          </Text>
        </Animated.View>
      </View>

      {/* Modern Royal Loading Bar & Offline Indicator */}
      <View style={styles.footerContainer}>
        <View style={styles.progressBarTrack}>
          <Animated.View
            style={[
              styles.progressBarFill,
              { width: progressInterpolate },
            ]}
          />
        </View>

        <Text style={styles.loadingStatusText}>
          {isOfficerApp
            ? 'Connecting to Joint Security Network...'
            : 'Synchronizing Palace Registry & Offline Archives...'}
        </Text>

        <Text style={styles.versionText}>v6.0.0 · 100% Offline Capable</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#053327', // Deep Yoruba Forest Emerald
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 50,
  },
  topVignette: {
    position: 'absolute',
    top: -120,
    right: -100,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(217, 119, 6, 0.08)', // subtle crown gold glow
  },
  bottomVignette: {
    position: 'absolute',
    bottom: -150,
    left: -120,
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: 'rgba(6, 78, 59, 0.4)',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  haloRing: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 1.5,
    borderColor: 'rgba(217, 119, 6, 0.35)',
    backgroundColor: 'rgba(217, 119, 6, 0.05)',
  },
  crestCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#0a4233',
    borderWidth: 3,
    borderColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 26,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 12,
  },
  crestEmoji: {
    fontSize: 54,
  },
  crestFoilBorder: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: 4,
    bottom: 4,
    borderRadius: 56,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  kingdomPrefix: {
    color: '#a7f3d0',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  appTitle: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  goldDivider: {
    width: 48,
    height: 3,
    backgroundColor: Colors.gold,
    borderRadius: 2,
    marginVertical: 12,
  },
  motto: {
    color: 'rgba(255, 255, 255, 0.82)',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 290,
  },
  sealPill: {
    marginTop: 22,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.4)',
  },
  sealPillText: {
    color: Colors.goldSoft,
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  footerContainer: {
    width: width * 0.76,
    alignItems: 'center',
    gap: 8,
  },
  progressBarTrack: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.gold,
    borderRadius: 2,
  },
  loadingStatusText: {
    color: '#a7f3d0',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 2,
  },
  versionText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 10,
    letterSpacing: 0.5,
  },
});
