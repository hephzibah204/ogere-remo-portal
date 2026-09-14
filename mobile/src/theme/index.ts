import { Colors } from './colors';

export { Colors };

export const Typography = {
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  bodyBold: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: Colors.textMuted,
  },
  badge: {
    fontSize: 11,
    fontWeight: '700' as const,
    textTransform: 'uppercase' as const,
  },
  // NEW
  overline: {
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
    color: Colors.textMuted,
  },
  label: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
};

export const Spacing = {
  xs:   4,
  sm:   8,
  md:   16,
  lg:   24,
  xl:   32,
  xxl:  48,
  '3xl': 64,
};

export const Radius = {
  sm:   6,
  md:   12,
  lg:   18,
  xl:   24,
  '2xl': 32,
  full: 9999,
};

export const Shadows = {
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  card: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 4,
  },
  elevated: {
    shadowColor: '#064e3b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  // NEW — gold-branded glow for featured cards
  gold: {
    shadowColor: '#C9963A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 10,
  },
  // NEW — red alert glow for SOS / emergency elements
  danger: {
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
};

/** Animation durations in ms for use with Animated API */
export const AnimDuration = {
  fast:   150,
  normal: 300,
  slow:   500,
  enter:  400,
};

/** Google Maps configuration */
export const MapConfig = {
  defaultRegion: {
    latitude:      6.9233,
    longitude:     3.5827,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  },
  mapStyle: 'dark', // 'standard' | 'dark' | 'satellite'
};

