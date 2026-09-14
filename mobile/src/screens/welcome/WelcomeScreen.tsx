import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Colors, Spacing, Radius, Typography, Shadows } from '../../theme';
import { Button } from '../../components/Button';
import { useAuth } from '../../services/authContext';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    icon: '👑',
    title: 'Welcome to Ogere Remo',
    subtitle: 'Gateway Kingdom of Heritage & Enterprise',
    description:
      'The official mobile portal of the ancient Remo kingdom. Connecting indigenes, residents, and diaspora citizens worldwide.',
  },
  {
    icon: '📱',
    title: '100% Offline Access',
    subtitle: 'Civic Knowledge in Your Pocket',
    description:
      'Read palace news, study the lineage of the Ologere of Ogere, listen to traditional Oriki, and access emergency helplines even without mobile data.',
  },
  {
    icon: '🏛️',
    title: 'World-Class Civic Services',
    subtitle: 'Direct Palace & Community Portal',
    description:
      'Verify digital ID cards, book royal audiences with Kabiyesi, report community incidents, and support town development projects.',
  },
];

export const WelcomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { setGuestMode } = useAuth();
  const [activeSlide, setActiveSlide] = useState(0);

  const handleExploreAsGuest = () => {
    setGuestMode(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Royal Header Badge */}
      <View style={styles.headerBadge}>
        <Text style={styles.sealEmoji}>🏛️</Text>
        <Text style={styles.headerState}>OGUN STATE · NIGERIA</Text>
      </View>

      {/* Carousel Section */}
      <View style={styles.carouselContainer}>
        <View style={styles.slideContent}>
          <View style={styles.iconCircle}>
            <Text style={styles.slideEmoji}>{SLIDES[activeSlide].icon}</Text>
          </View>
          <Text style={styles.slideTitle}>{SLIDES[activeSlide].title}</Text>
          <Text style={styles.slideSubtitle}>{SLIDES[activeSlide].subtitle}</Text>
          <Text style={styles.slideDescription}>
            {SLIDES[activeSlide].description}
          </Text>
        </View>

        {/* Indicators */}
        <View style={styles.indicatorRow}>
          {SLIDES.map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setActiveSlide(i)}
              style={[
                styles.indicatorDot,
                activeSlide === i && styles.indicatorDotActive,
              ]}
            />
          ))}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <Button
          title="Create Citizen Account"
          variant="secondary"
          size="lg"
          onPress={() => navigation.navigate('Register')}
          style={styles.actionBtn}
        />

        <Button
          title="Sign In with Account / Biometrics"
          variant="primary"
          size="md"
          onPress={() => navigation.navigate('Login')}
          style={styles.actionBtn}
        />

        <TouchableOpacity
          onPress={handleExploreAsGuest}
          style={styles.guestLink}
          activeOpacity={0.7}
        >
          <Text style={styles.guestLinkText}>
            Explore as Guest · No Sign In Required ➔
          </Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Access town news, emergency lines, and royal history without logging in.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    justifyContent: 'space-between',
  },
  headerBadge: {
    alignItems: 'center',
    paddingTop: Spacing.md,
    gap: 4,
  },
  sealEmoji: {
    fontSize: 28,
  },
  headerState: {
    fontSize: 11,
    letterSpacing: 2,
    color: '#a7f3d0',
    fontWeight: '700',
  },
  carouselContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  slideContent: {
    alignItems: 'center',
    maxWidth: 340,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 2,
    borderColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.elevated,
  },
  slideEmoji: {
    fontSize: 48,
  },
  slideTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  slideSubtitle: {
    fontSize: 14,
    color: Colors.goldSoft,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  slideDescription: {
    fontSize: 14,
    color: '#e2e8f0',
    textAlign: 'center',
    lineHeight: 22,
  },
  indicatorRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: Spacing.xl,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  indicatorDotActive: {
    width: 24,
    backgroundColor: Colors.gold,
  },
  actionsContainer: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: 12,
    ...Shadows.card,
  },
  actionBtn: {
    width: '100%',
  },
  guestLink: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  guestLinkText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  disclaimer: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
