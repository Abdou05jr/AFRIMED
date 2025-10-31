import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle, Animated, View } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' | 'electric';
  size?: 'small' | 'medium' | 'large' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  shadow?: boolean;
  gradient?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  shadow = true,
  gradient = false,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const scaleValue = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (isDisabled) return;
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (isDisabled) return;
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return styles.primary;
      case 'secondary':
        return styles.secondary;
      case 'danger':
        return styles.danger;
      case 'outline':
        return styles.outline;
      case 'ghost':
        return styles.ghost;
      case 'electric':
        return styles.electric;
      default:
        return styles.primary;
    }
  };

  const getTextVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryText;
      case 'secondary':
        return styles.secondaryText;
      case 'danger':
        return styles.dangerText;
      case 'outline':
        return styles.outlineText;
      case 'ghost':
        return styles.ghostText;
      case 'electric':
        return styles.electricText;
      default:
        return styles.primaryText;
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'primary':
        return '#000000';
      case 'secondary':
      case 'danger':
      case 'electric':
        return '#FFFFFF';
      case 'outline':
        return '#000814';
      case 'ghost':
        return '#000814';
      default:
        return '#000000';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 16;
      case 'medium':
        return 18;
      case 'large':
        return 20;
      case 'xl':
        return 22;
      default:
        return 18;
    }
  };

  // Safe icon rendering function
  const renderIcon = () => {
    if (!Icon) return null;

    // Check if it's a valid React component
    if (typeof Icon !== 'function' && typeof Icon !== 'object') {
      console.error('[DEBUG] Invalid icon component in Button:', Icon);
      return null;
    }

    const iconProps = {
      color: getIconColor(),
      size: getIconSize(),
    };

    try {
      // Render the icon component properly
      const IconElement = Icon as React.ComponentType<any>;
      return <IconElement {...iconProps} style={iconPosition === 'left' ? styles.leftIcon : styles.rightIcon} />;
    } catch (err) {
      console.error('[DEBUG] Error rendering button icon:', err);
      return null;
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          color={getIconColor()}
          size={getIconSize()}
        />
      );
    }

    const iconElement = renderIcon();

    return (
      <View style={styles.content}>
        {Icon && iconPosition === 'left' && iconElement}
        <Text style={[
          styles.text,
          getTextVariantStyles(),
          styles[`${size}Text`],
          textStyle
        ]}>
          {title}
        </Text>
        {Icon && iconPosition === 'right' && iconElement}
      </View>
    );
  };

  return (
    <Animated.View style={[
      { transform: [{ scale: scaleValue }] },
      shadow && variant !== 'ghost' && styles.shadow,
    ]}>
      <TouchableOpacity
        style={[
          styles.button,
          getVariantStyles(),
          styles[`${size}Button`],
          isDisabled && styles.disabled,
          fullWidth && styles.fullWidth,
          gradient && styles.gradientOverlay,
          style,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        activeOpacity={0.8}
      >
        {gradient && <View style={styles.gradientBackground} />}
        {renderContent()}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  primary: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  secondary: {
    backgroundColor: '#001F3F',
    borderColor: '#001F3F',
  },
  danger: {
    backgroundColor: '#FF0066',
    borderColor: '#FF0066',
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: '#00D4FF',
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  electric: {
    backgroundColor: '#00D4FF',
    borderColor: '#00D4FF',
  },
  disabled: {
    opacity: 0.5,
  },
  smallButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    minHeight: 40,
  },
  mediumButton: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    minHeight: 52,
  },
  largeButton: {
    paddingVertical: 18,
    paddingHorizontal: 36,
    minHeight: 60,
  },
  xlButton: {
    paddingVertical: 22,
    paddingHorizontal: 44,
    minHeight: 68,
  },
  fullWidth: {
    width: '100%',
  },
  shadow: {
    shadowColor: '#000814',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '700',
    textAlign: 'center',
  },
  primaryText: {
    color: '#000000',
  },
  secondaryText: {
    color: '#FFFFFF',
  },
  dangerText: {
    color: '#FFFFFF',
  },
  outlineText: {
    color: '#000814',
  },
  ghostText: {
    color: '#000814',
  },
  electricText: {
    color: '#FFFFFF',
  },
  smallText: {
    fontSize: 14,
    letterSpacing: 0.5,
  },
  mediumText: {
    fontSize: 16,
    letterSpacing: 0.5,
  },
  largeText: {
    fontSize: 18,
    letterSpacing: 0.5,
  },
  xlText: {
    fontSize: 20,
    letterSpacing: 0.5,
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#00D4FF',
    opacity: 0.9,
  },
  gradientOverlay: {
    shadowColor: '#00D4FF',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
});

// Additional specialized button components for common use cases
export function PrimaryButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="primary" {...props} />;
}

export function SecondaryButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="secondary" {...props} />;
}

export function DangerButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="danger" {...props} />;
}

export function OutlineButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="outline" {...props} />;
}

export function ElectricButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="electric" {...props} />;
}

export function GhostButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="ghost" {...props} />;
}
