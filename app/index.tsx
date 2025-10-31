import { useEffect, useState } from 'react';
import { View, Text, Animated, Dimensions, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Zap, Heart, Shield } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function Index() {
  const { user, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [appReady, setAppReady] = useState(false);

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.8))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const pulseAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    // Initial app loading sequence
    const initializeApp = async () => {
      // Simulate initial app loading (resources, fonts, etc.)
      await new Promise(resolve => setTimeout(resolve, 2000));
      setAppReady(true);

      // Start splash screen animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        })
      ]).start();

      // Pulsing animation for icons
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Show splash screen for minimum time
      setTimeout(() => {
        setShowSplash(false);
      }, 3000);
    };

    initializeApp();
  }, []);

  // Show splash screen during initial load
  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        {/* Animated Background */}
        <View style={styles.background}>
          <View style={styles.circle1} />
          <View style={styles.circle2} />
          <View style={styles.circle3} />
        </View>

        <Animated.View
          style={[
            styles.splashContent,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim }
              ]
            }
          ]}
        >
          {/* Main Logo/Icon */}
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <View style={styles.logoContainer}>
              <Zap color="#00D4FF" size={64} />
              <View style={styles.logoGlow} />
            </View>
          </Animated.View>

          {/* App Name */}
          <Text style={styles.appName}>AFRIMED</Text>
          <Text style={styles.appTagline}>AI-Powered Medical Assistance</Text>

          {/* Feature Icons */}
          <View style={styles.features}>
            <View style={styles.featureItem}>
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <Heart color="#FF0066" size={24} />
              </Animated.View>
              <Text style={styles.featureText}>Medical Aid</Text>
            </View>

            <View style={styles.featureItem}>
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <Shield color="#00FF88" size={24} />
              </Animated.View>
              <Text style={styles.featureText}>AI Analysis</Text>
            </View>

            <View style={styles.featureItem}>
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <Zap color="#FFB800" size={24} />
              </Animated.View>
              <Text style={styles.featureText}>Instant Scan</Text>
            </View>
          </View>

          {/* Loading Progress */}
          <View style={styles.loadingContainer}>
            <View style={styles.loadingBar}>
              <Animated.View
                style={[
                  styles.loadingProgress,
                  {
                    width: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%']
                    })
                  }
                ]}
              />
            </View>
            <Text style={styles.loadingText}>
              {appReady ? 'Ready' : 'Initializing...'}
            </Text>
          </View>

          {/* Version Info */}
          <View style={styles.versionInfo}>
            <Text style={styles.versionText}>v1.0.0</Text>
            <Text style={styles.copyright}>© 2024 AfriMed. All rights reserved.</Text>
          </View>
        </Animated.View>

        {/* Decorative Elements */}
        <View style={styles.floatingIcons}>
          <Zap color="rgba(0, 212, 255, 0.3)" size={32} style={styles.floatingIcon1} />
          <Heart color="rgba(255, 0, 102, 0.3)" size={28} style={styles.floatingIcon2} />
          <Shield color="rgba(0, 255, 136, 0.3)" size={36} style={styles.floatingIcon3} />
        </View>
      </View>
    );
  }

  // Show loading screen if still checking auth state
  if (loading) {
    return <LoadingScreen />;
  }
  // After splash, just render nothing — let _layout.tsx handle navigation
    return null;
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#001F3F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  circle1: {
    position: 'absolute',
    top: '20%',
    left: '10%',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
  },
  circle2: {
    position: 'absolute',
    bottom: '30%',
    right: '15%',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(0, 212, 255, 0.08)',
  },
  circle3: {
    position: 'absolute',
    top: '60%',
    left: '60%',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  splashContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  logoGlow: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    backgroundColor: 'rgba(0, 212, 255, 0.2)',
    borderRadius: 80,
    zIndex: -1,
  },
  appName: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 212, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    letterSpacing: 2,
  },
  appTagline: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
    marginBottom: 48,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.8,
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 48,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureText: {
    fontSize: 12,
    color: '#FFFFFF',
    marginTop: 8,
    fontWeight: '500',
    textAlign: 'center',
    opacity: 0.8,
  },
  loadingContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 32,
  },
  loadingBar: {
    width: '80%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 12,
  },
  loadingProgress: {
    height: '100%',
    backgroundColor: '#00D4FF',
    borderRadius: 2,
  },
  loadingText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    opacity: 0.8,
  },
  versionInfo: {
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    color: '#FFFFFF',
    marginBottom: 4,
    fontWeight: '500',
    opacity: 0.6,
  },
  copyright: {
    fontSize: 10,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.5,
  },
  floatingIcons: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  floatingIcon1: {
    position: 'absolute',
    top: '15%',
    right: '20%',
    opacity: 0.5,
  },
  floatingIcon2: {
    position: 'absolute',
    bottom: '25%',
    left: '15%',
    opacity: 0.4,
  },
  floatingIcon3: {
    position: 'absolute',
    top: '70%',
    right: '10%',
    opacity: 0.3,
  },
});
