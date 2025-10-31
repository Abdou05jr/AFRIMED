import React, { useState, useRef } from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps, TouchableOpacity, Animated } from 'react-native';
import { Eye, EyeOff, Search, CheckCircle, AlertCircle, LucideIcon } from 'lucide-react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  success?: boolean;
  containerStyle?: any;
  variant?: 'default' | 'outlined' | 'filled' | 'electric';
  size?: 'small' | 'medium' | 'large';
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  onRightIconPress?: () => void;
  showPasswordToggle?: boolean;
  characterCount?: {
    max: number;
    show?: boolean;
  };
  animatedLabel?: boolean;
  required?: boolean;
}

export function Input({
  label,
  error,
  success = false,
  containerStyle,
  style,
  variant = 'default',
  size = 'medium',
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  onRightIconPress,
  showPasswordToggle = false,
  characterCount,
  animatedLabel = true,
  required = false,
  secureTextEntry,
  value,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(!secureTextEntry);
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const focusAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = (e: any) => {
    setIsFocused(true);
    animateLabel(1);
    animateFocus(1);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (!value) {
      animateLabel(0);
    }
    animateFocus(0);
    onBlur?.(e);
  };

  const animateLabel = (toValue: number) => {
    if (!animatedLabel) return;
    Animated.spring(labelAnim, {
      toValue,
      useNativeDriver: false,
    }).start();
  };

  const animateFocus = (toValue: number) => {
    Animated.spring(focusAnim, {
      toValue,
      useNativeDriver: false,
    }).start();
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'default':
        return styles.default;
      case 'outlined':
        return styles.outlined;
      case 'filled':
        return styles.filled;
      case 'electric':
        return styles.electric;
      default:
        return styles.default;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return styles.small;
      case 'medium':
        return styles.medium;
      case 'large':
        return styles.large;
      default:
        return styles.medium;
    }
  };

  const getBorderColor = () => {
    if (error) return '#FF0066';
    if (success) return '#00FF88';
    if (isFocused) return '#00D4FF';
    return 'transparent';
  };

  const getBackgroundColor = () => {
    if (variant === 'filled') return '#001F3F';
    if (variant === 'electric' && isFocused) return 'rgba(0, 212, 255, 0.05)';
    return '#FFFFFF';
  };

  const labelStyle = {
    transform: [
      {
        translateY: labelAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -24],
        }),
      },
    ],
    fontSize: labelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: labelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['#6C757D', error ? '#FF0066' : success ? '#00FF88' : '#000814'],
    }),
  };

  const focusBorderStyle = {
    transform: [
      {
        scaleX: focusAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
        }),
      },
    ],
  };

  const currentCharCount = value?.length || 0;
  const showCharCount = characterCount?.show && characterCount.max > 0;
  const charCountExceeded = showCharCount && currentCharCount > characterCount.max;

  // Safe icon rendering function
  const renderIcon = (IconComponent: LucideIcon | undefined, position: 'left' | 'right') => {
    if (!IconComponent) return null;

    // Check if it's a valid React component
    if (typeof IconComponent !== 'function' && typeof IconComponent !== 'object') {
      console.error('[DEBUG] Invalid icon component:', IconComponent);
      return null;
    }

    const iconProps = {
      color: error ? '#FF0066' : success ? '#00FF88' : isFocused ? '#000814' : '#6C757D',
      size: 20,
    };

    try {
      // Render the icon component properly
      const IconElement = IconComponent as React.ComponentType<any>;
      return <IconElement {...iconProps} style={position === 'left' ? styles.leftIcon : {}} />;
    } catch (err) {
      console.error(`[DEBUG] Error rendering ${position} icon:`, err);
      return null;
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.inputWrapper}>
        {/* Animated Label */}
        {label && animatedLabel && (
          <Animated.Text style={[styles.label, labelStyle]}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Animated.Text>
        )}

        {/* Static Label for non-animated */}
        {label && !animatedLabel && (
          <Text style={[styles.staticLabel, error && styles.staticLabelError]}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
        )}

        <View style={[
          styles.inputContainer,
          getVariantStyles(),
          getSizeStyles(),
          {
            borderColor: getBorderColor(),
            backgroundColor: getBackgroundColor(),
          },
        ]}>
          {/* Left Icon */}
          {LeftIcon && (
            <View style={styles.leftIconContainer}>
              {renderIcon(LeftIcon, 'left')}
            </View>
          )}

          {/* Main Input */}
          <TextInput
            style={[
              styles.input,
              LeftIcon && styles.inputWithLeftIcon,
              (RightIcon || showPasswordToggle) && styles.inputWithRightIcon,
              style,
            ]}
            placeholderTextColor="#6C757D"
            secureTextEntry={!showPassword && secureTextEntry}
            value={value}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />

          {/* Right Side Icons */}
          <View style={styles.rightIcons}>
            {/* Character Count */}
            {showCharCount && (
              <Text style={[
                styles.charCount,
                charCountExceeded && styles.charCountExceeded
              ]}>
                {currentCharCount}/{characterCount.max}
              </Text>
            )}

            {/* Success/Error Icons */}
            {error && (
              <AlertCircle color="#FF0066" size={20} style={styles.statusIcon} />
            )}
            {success && !error && (
              <CheckCircle color="#00FF88" size={20} style={styles.statusIcon} />
            )}

            {/* Password Toggle */}
            {showPasswordToggle && (
              <TouchableOpacity onPress={togglePasswordVisibility} style={styles.iconButton}>
                {showPassword ? (
                  <EyeOff color="#6C757D" size={20} />
                ) : (
                  <Eye color="#6C757D" size={20} />
                )}
              </TouchableOpacity>
            )}

            {/* Custom Right Icon */}
            {RightIcon && (
              <TouchableOpacity
                onPress={onRightIconPress}
                style={styles.iconButton}
                disabled={!onRightIconPress}
              >
                {renderIcon(RightIcon, 'right')}
              </TouchableOpacity>
            )}
          </View>

          {/* Focus Border Animation */}
          {variant !== 'filled' && (
            <Animated.View
                style={[
                styles.focusBorder,
                {
                  backgroundColor: error ? '#FF0066' : success ? '#00FF88' : '#000814',
                  transform: focusBorderStyle.transform,
                }
              ]}
            />
          )}
        </View>
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <AlertCircle color="#FF0066" size={14} />
          <Text style={styles.error}>{error}</Text>
        </View>
      )}

      {/* Character Count Warning */}
      {showCharCount && charCountExceeded && (
        <Text style={styles.charCountWarning}>
          Exceeded maximum character limit
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  inputWrapper: {
    position: 'relative',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  default: {
    // Base styles already applied
  },
  outlined: {
    backgroundColor: 'transparent',
  },
  filled: {
    borderWidth: 0,
    backgroundColor: '#001F3F',
  },
  electric: {
    shadowColor: '#000814',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  small: {
    minHeight: 44,
  },
  medium: {
    minHeight: 52,
  },
  large: {
    minHeight: 60,
  },
  label: {
    position: 'absolute',
    left: 16,
    top: 16,
    zIndex: 1,
    fontWeight: '600',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 4,
  },
  staticLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6C757D',
    marginBottom: 8,
  },
  staticLabelError: {
    color: '#FF0066',
  },
  required: {
    color: '#FF0066',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  inputWithLeftIcon: {
    paddingLeft: 8,
  },
  inputWithRightIcon: {
    paddingRight: 8,
  },
  leftIconContainer: {
    marginLeft: 16,
  },
  leftIcon: {
    // Icon styles if needed
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    gap: 8,
  },
  iconButton: {
    padding: 4,
  },
  statusIcon: {
    marginLeft: 4,
  },
  charCount: {
    fontSize: 12,
    color: '#6C757D',
    fontWeight: '500',
  },
  charCountExceeded: {
    color: '#FF0066',
  },
  charCountWarning: {
    fontSize: 12,
    color: '#FF0066',
    marginTop: 4,
    fontWeight: '500',
  },
  focusBorder: {
    position: 'absolute',
    bottom: -2,
    left: 0,
    right: 0,
    height: 2,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  error: {
    color: '#FF0066',
    fontSize: 12,
    fontWeight: '500',
  },
});

// Additional specialized input components for common use cases
export function SearchInput(props: Omit<InputProps, 'leftIcon'>) {
  return <Input leftIcon={Search} placeholder="Search..." {...props} />;
}

export function PasswordInput(props: Omit<InputProps, 'showPasswordToggle' | 'secureTextEntry'>) {
  return <Input showPasswordToggle secureTextEntry placeholder="Enter password..." {...props} />;
}

export function EmailInput(props: Omit<InputProps, 'keyboardType' | 'autoCapitalize'>) {
  return (
    <Input
      keyboardType="email-address"
      autoCapitalize="none"
      placeholder="Enter email address..."
      {...props}
    />
  );
}

export function OutlinedInput(props: Omit<InputProps, 'variant'>) {
  return <Input variant="outlined" {...props} />;
}

export function FilledInput(props: Omit<InputProps, 'variant'>) {
  return <Input variant="filled" {...props} />;
}

export function ElectricInput(props: Omit<InputProps, 'variant'>) {
  return <Input variant="electric" {...props} />;
}
