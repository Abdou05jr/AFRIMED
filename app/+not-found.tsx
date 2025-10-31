import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Zap, Home, ArrowLeft, WifiOff, Search } from 'lucide-react-native';
import { useEffect, useRef } from 'react';

const { width, height } = Dimensions.get('window');

export default function NotFoundScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
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

    // Pulsing animation for the zap icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
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
  }, []);

  return (
    <>
      <Stack.Screen options={{ 
        title: 'Page Not Found',
        headerShown: false 
      }} />
      
      <View style={styles.container}>
        {/* Background Elements */}
        <View style={styles.background}>
          <View style={styles.circle1} />
          <View style={styles.circle2} />
          <View style={styles.circle3} />
        </View>

        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Animated Icon */}
          <View style={styles.iconContainer}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Zap color="#00D4FF" size={80} />
            </Animated.View>
            <View style={styles.iconBackground} />
          </View>

          {/* Error Code */}
          <Text style={styles.errorCode}>404</Text>
          
          {/* Main Message */}
          <Text style={styles.title}>Page Not Found</Text>
          
          {/* Description */}
          <Text style={styles.description}>
            The page you are looking for seems to have been lost in the digital void.
            It might have been moved, deleted, or never existed in the first place.
          </Text>

          {/* Additional Context */}
          <View style={styles.tipsContainer}>
            <View style={styles.tipItem}>
              <Search color="#00FF88" size={20} />
              <Text style={styles.tipText}>Check the URL for typos</Text>
            </View>
            <View style={styles.tipItem}>
              <WifiOff color="#FFB800" size={20} />
              <Text style={styles.tipText}>Verify your connection</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => window.history?.back()}
            >
              <ArrowLeft color="#0A0F1C" size={20} />
              <Text style={styles.primaryButtonText}>Go Back</Text>
            </TouchableOpacity>

            <Link href="/(tabs)" asChild>
              <TouchableOpacity style={styles.secondaryButton}>
                <Home color="#00D4FF" size={20} />
                <Text style={styles.secondaryButtonText}>Home Screen</Text>
              </TouchableOpacity>
            </Link>
          </View>

          {/* Quick Links */}
          <View style={styles.quickLinks}>
            <Text style={styles.quickLinksTitle}>Quick Access</Text>
            <View style={styles.linkGrid}>
              <Link href="/(tabs)/scan" asChild>
                <TouchableOpacity style={styles.quickLink}>
                  <Text style={styles.quickLinkText}>New Scan</Text>
                </TouchableOpacity>
              </Link>
              <Link href="/(tabs)/clinics" asChild>
                <TouchableOpacity style={styles.quickLink}>
                  <Text style={styles.quickLinkText}>Find Clinics</Text>
                </TouchableOpacity>
              </Link>
              <Link href="/(tabs)/profile" asChild>
                <TouchableOpacity style={styles.quickLink}>
                  <Text style={styles.quickLinkText}>Profile</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </Animated.View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Still need help? Contact our support team.
          </Text>
          <TouchableOpacity>
            <Text style={styles.supportLink}>Get Support</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1C',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
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
    top: '10%',
    left: '10%',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(0, 212, 255, 0.05)',
  },
  circle2: {
    position: 'absolute',
    bottom: '20%',
    right: '15%',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 0, 102, 0.05)',
  },
  circle3: {
    position: 'absolute',
    top: '50%',
    left: '60%',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 255, 136, 0.05)',
  },
  content: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  iconBackground: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    borderRadius: 80,
    zIndex: -1,
  },
  errorCode: {
    fontSize: 96,
    fontWeight: '900',
    color: '#00D4FF',
    textShadowColor: 'rgba(0, 212, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#8B9CB1',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    fontWeight: '500',
  },
  tipsContainer: {
    backgroundColor: 'rgba(26, 31, 46, 0.8)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#2D3748',
    width: '100%',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#8B9CB1',
    marginLeft: 12,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
    width: '100%',
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00D4FF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonText: {
    color: '#0A0F1C',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#00D4FF',
  },
  secondaryButtonText: {
    color: '#00D4FF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  quickLinks: {
    width: '100%',
    marginBottom: 40,
  },
  quickLinksTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8B9CB1',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 1,
  },
  linkGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  quickLink: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(26, 31, 46, 0.8)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2D3748',
  },
  quickLinkText: {
    color: '#00D4FF',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#8B9CB1',
    marginBottom: 8,
    textAlign: 'center',
  },
  supportLink: {
    fontSize: 14,
    color: '#00D4FF',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});