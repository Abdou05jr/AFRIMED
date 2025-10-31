import React from 'react';
import { View, StyleSheet, ViewStyle, Animated } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled' | 'gradient' | 'electric';
  padding?: 'none' | 'small' | 'medium' | 'large';
  borderRadius?: 'small' | 'medium' | 'large' | 'xl';
  shadow?: 'none' | 'light' | 'medium' | 'heavy' | 'glow';
  borderColor?: string;
  backgroundColor?: string;
  animated?: boolean;
  onPress?: () => void;
  disabled?: boolean;
}

export function Card({
  children,
  style,
  variant = 'default',
  padding = 'medium',
  borderRadius = 'medium',
  shadow = 'light',
  borderColor,
  backgroundColor,
  animated = false,
  onPress,
  disabled = false,
}: CardProps) {
  const scaleValue = new Animated.Value(1);
  const opacityValue = new Animated.Value(1);

  const handlePressIn = () => {
    if (!onPress || disabled) return;
    Animated.spring(scaleValue, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (!onPress || disabled) return;
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'default':
        return styles.default;
      case 'elevated':
        return styles.elevated;
      case 'outlined':
        return styles.outlined;
      case 'filled':
        return styles.filled;
      case 'gradient':
        return styles.gradient;
      case 'electric':
        return styles.electric;
      default:
        return styles.default;
    }
  };

  const getPaddingStyles = () => {
    switch (padding) {
      case 'none':
        return styles.paddingNone;
      case 'small':
        return styles.paddingSmall;
      case 'medium':
        return styles.paddingMedium;
      case 'large':
        return styles.paddingLarge;
      default:
        return styles.paddingMedium;
    }
  };

  const getBorderRadiusStyles = () => {
    switch (borderRadius) {
      case 'small':
        return styles.borderRadiusSmall;
      case 'medium':
        return styles.borderRadiusMedium;
      case 'large':
        return styles.borderRadiusLarge;
      case 'xl':
        return styles.borderRadiusXl;
      default:
        return styles.borderRadiusMedium;
    }
  };

  const getShadowStyles = () => {
    switch (shadow) {
      case 'none':
        return styles.shadowNone;
      case 'light':
        return styles.shadowLight;
      case 'medium':
        return styles.shadowMedium;
      case 'heavy':
        return styles.shadowHeavy;
      case 'glow':
        return styles.shadowGlow;
      default:
        return styles.shadowLight;
    }
  };

  const cardContent = (
    <View style={[
      styles.card,
      getVariantStyles(),
      getPaddingStyles(),
      getBorderRadiusStyles(),
      getShadowStyles(),
      borderColor && { borderColor },
      backgroundColor && { backgroundColor },
      disabled && styles.disabled,
      onPress && styles.pressable,
      style,
    ]}>
      {children}
      {variant === 'electric' && <View style={styles.electricGlow} />}
      {variant === 'gradient' && <View style={styles.gradientOverlay} />}
    </View>
  );

  if (animated && onPress) {
    return (
      <Animated.View
        style={[
          { transform: [{ scale: scaleValue }], opacity: opacityValue },
          styles.animatedContainer,
        ]}
      >
        <View
          style={styles.touchableContainer}
          onStartShouldSetResponder={() => true}
          onResponderGrant={handlePressIn}
          onResponderRelease={handlePressOut}
          onResponderTerminate={handlePressOut}
          onTouchEnd={onPress}
        >
          {cardContent}
        </View>
      </Animated.View>
    );
  }

  if (onPress) {
    return (
      <View
        style={styles.touchableContainer}
        onStartShouldSetResponder={() => true}
        onTouchEnd={onPress}
      >
        {cardContent}
      </View>
    );
  }

  return cardContent;
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
  },
  // Variants
  default: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
  },
  elevated: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
  },
  outlined: {
    backgroundColor: 'transparent',
    borderColor: '#000814',
  },
  filled: {
    backgroundColor: '#001F3F',
    borderColor: 'transparent',
  },
  gradient: {
    backgroundColor: '#FFFFFF',
    borderColor: 'transparent',
  },
  electric: {
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    borderColor: '#00D4FF',
  },
  // Padding
  paddingNone: {
    padding: 0,
  },
  paddingSmall: {
    padding: 12,
  },
  paddingMedium: {
    padding: 16,
  },
  paddingLarge: {
    padding: 24,
  },
  // Border Radius
  borderRadiusSmall: {
    borderRadius: 8,
  },
  borderRadiusMedium: {
    borderRadius: 16,
  },
  borderRadiusLarge: {
    borderRadius: 20,
  },
  borderRadiusXl: {
    borderRadius: 24,
  },
  // Shadows
  shadowNone: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  shadowLight: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  shadowMedium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  shadowHeavy: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  shadowGlow: {
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  // Special Effects
  electricGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#000814',
    shadowColor: '#000814',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'linear-gradient(135deg, rgba(0, 212, 255, 0.05) 0%, rgba(0, 255, 136, 0.05) 100%)',
    opacity: 0.6,
  },
  // States
  disabled: {
    opacity: 0.5,
  },
  pressable: {
    cursor: 'pointer',
  },
  // Layout
  animatedContainer: {
    flex: 1,
  },
  touchableContainer: {
    flex: 1,
  },
});

// Additional specialized card components for common use cases
export function ElevatedCard(props: Omit<CardProps, 'variant'>) {
  return <Card variant="elevated" {...props} />;
}

export function OutlinedCard(props: Omit<CardProps, 'variant'>) {
  return <Card variant="outlined" {...props} />;
}

export function FilledCard(props: Omit<CardProps, 'variant'>) {
  return <Card variant="filled" {...props} />;
}

export function GradientCard(props: Omit<CardProps, 'variant'>) {
  return <Card variant="gradient" {...props} />;
}

export function ElectricCard(props: Omit<CardProps, 'variant'>) {
  return <Card variant="electric" {...props} />;
}

export function PressableCard(props: Omit<CardProps, 'variant' | 'onPress'> & { onPress: () => void }) {
  return <Card variant="default" animated {...props} />;
}
