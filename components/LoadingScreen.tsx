import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, Animated, Dimensions } from 'react-native';
import { Zap, Heart, Shield, Activity } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface LoadingScreenProps {
  message?: string;
  type?: 'default' | 'scan' | 'analysis' | 'verification' | 'electric';
  size?: 'small' | 'medium' | 'large';
  showProgress?: boolean;
  progress?: number;
  subtitle?: string;
}

export function LoadingScreen({
  message,
  type = 'default',
  size = 'large',
  showProgress = false,
  progress = 0,
  subtitle
}: LoadingScreenProps) {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Rotation animation for electric type
    if (type === 'electric') {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      ).start();
    }

    // Pulse animation for all types
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Progress animation
    if (showProgress) {
      Animated.timing(progressAnim, {
        toValue: progress / 100,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }
  }, [progress, showProgress]);

  const getDefaultMessage = () => {
    switch (type) {
      case 'scan':
        return 'Analyzing Medical Scan...';
      case 'analysis':
        return 'Processing AI Analysis...';
      case 'verification':
        return 'Verifying Information...';
      case 'electric':
        return 'Initializing System...';
      default:
        return 'Loading...';
    }
  };

  const getIcon = () => {
    const iconSize = size === 'large' ? 48 : size === 'medium' ? 32 : 24;

    switch (type) {
      case 'scan':
        return <Activity color="#00D4FF" size={iconSize} />;
      case 'analysis':
        return <Shield color="#00FF88" size={iconSize} />;
      case 'verification':
        return <Heart color="#FF0066" size={iconSize} />;
      case 'electric':
        return (
          <Animated.View
            style={{
              transform: [
                {
                  rotate: rotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            }}
          >
            <Zap color="#00D4FF" size={iconSize} />
          </Animated.View>
        );
      default:
        return <ActivityIndicator size={iconSize} color="#00D4FF" />;
    }
  };

  const getSpinnerSize = () => {
    switch (size) {
      case 'small':
        return 'small';
      case 'medium':
        return 'medium';
      case 'large':
        return 'large';
      default:
        return 'large';
    }
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Background Elements */}
      <View style={styles.background}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
        <View style={styles.circle3} />
      </View>

      <View style={styles.content}>
        {/* Animated Icon/Spinner */}
        <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
          {getIcon()}
          {type !== 'electric' && type !== 'default' && (
            <View style={[styles.iconGlow, { backgroundColor: getIconColor() }]} />
          )}
        </Animated.View>

        {/* Loading Message */}
        <Text style={styles.message}>
          {message || getDefaultMessage()}
        </Text>

        {/* Subtitle */}
        {subtitle && (
          <Text style={styles.subtitle}>
            {subtitle}
          </Text>
        )}

        {/* Progress Bar */}
        {showProgress && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: progressWidth,
                    backgroundColor: getIconColor(),
                  }
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round(progress)}%
            </Text>
          </View>
        )}

        {/* Loading Dots Animation */}
        {!showProgress && (
          <View style={styles.dotsContainer}>
            {[0, 1, 2].map((index) => (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    backgroundColor: getIconColor(),
                    transform: [
                      {
                        scale: pulseAnim.interpolate({
                          inputRange: [1, 1.2],
                          outputRange: [1, 1.2 - index * 0.1],
                        }),
                      },
                    ],
                  },
                ]}
              />
            ))}
          </View>
        )}

        {/* Type-specific additional info */}
        {type === 'scan' && (
          <Text style={styles.additionalInfo}>
            This may take a few moments while our AI analyzes your scan
          </Text>
        )}

        {type === 'analysis' && (
          <Text style={styles.additionalInfo}>
            Processing medical data with advanced algorithms
          </Text>
        )}

        {type === 'electric' && (
          <Text style={styles.additionalInfo}>
            Powering up medical analysis systems
          </Text>
        )}
      </View>

      {/* Floating decorative elements */}
      <View style={styles.floatingElements}>
        <Zap color="rgba(0, 212, 255, 0.3)" size={24} style={styles.floatingElement1} />
        <Heart color="rgba(255, 0, 102, 0.3)" size={20} style={styles.floatingElement2} />
        <Shield color="rgba(0, 255, 136, 0.3)" size={28} style={styles.floatingElement3} />
      </View>
    </Animated.View>
  );

  function getIconColor() {
    switch (type) {
      case 'scan':
        return '#00D4FF';
      case 'analysis':
        return '#00FF88';
      case 'verification':
        return '#FF0066';
      case 'electric':
        return '#00D4FF';
      default:
        return '#00D4FF';
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#001F3F',
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
    backgroundColor: 'rgba(0, 212, 255, 0.05)',
  },
  circle2: {
    position: 'absolute',
    bottom: '30%',
    right: '15%',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(0, 212, 255, 0.03)',
  },
  circle3: {
    position: 'absolute',
    top: '60%',
    left: '60%',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
    zIndex: 1,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 32,
  },
  iconGlow: {
    position: 'absolute',
    top: -12,
    left: -12,
    right: -12,
    bottom: -12,
    borderRadius: 50,
    opacity: 0.3,
    zIndex: -1,
  },
  message: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 212, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 32,
    fontWeight: '500',
    lineHeight: 22,
    opacity: 0.8,
  },
  progressContainer: {
    width: '80%',
    alignItems: 'center',
    marginBottom: 24,
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    opacity: 0.8,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  additionalInfo: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
    opacity: 0.7,
  },
  floatingElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  floatingElement1: {
    position: 'absolute',
    top: '25%',
    right: '20%',
    opacity: 0.5,
  },
  floatingElement2: {
    position: 'absolute',
    bottom: '35%',
    left: '15%',
    opacity: 0.4,
  },
  floatingElement3: {
    position: 'absolute',
    top: '65%',
    right: '10%',
    opacity: 0.3,
  },
});

// Additional specialized loading components for common use cases
export function ScanLoadingScreen(props: Omit<LoadingScreenProps, 'type'>) {
  return <LoadingScreen type="scan" {...props} />;
}

export function AnalysisLoadingScreen(props: Omit<LoadingScreenProps, 'type'>) {
  return <LoadingScreen type="analysis" {...props} />;
}

export function VerificationLoadingScreen(props: Omit<LoadingScreenProps, 'type'>) {
  return <LoadingScreen type="verification" {...props} />;
}

export function ElectricLoadingScreen(props: Omit<LoadingScreenProps, 'type'>) {
  return <LoadingScreen type="electric" {...props} />;
}

export function SmallLoadingScreen(props: Omit<LoadingScreenProps, 'size'>) {
  return <LoadingScreen size="small" {...props} />;
}

export function MediumLoadingScreen(props: Omit<LoadingScreenProps, 'size'>) {
  return <LoadingScreen size="medium" {...props} />;
}
