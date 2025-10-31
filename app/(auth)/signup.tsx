import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

const COUNTRIES = [
  'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Egypt', 'Ethiopia',
  'Tanzania', 'Uganda', 'Algeria', 'Morocco', 'Ivory Coast', 'Senegal'
];

export default function SignupScreen() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: 'Nigeria',
    agreeToTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const { signUp } = useAuth();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Create custom icon components for Ionicons
  const PersonIcon = (props: any) => <Ionicons name="person-outline" {...props} />;
  const MailIcon = (props: any) => <Ionicons name="mail-outline" {...props} />;
  const LockIcon = (props: any) => <Ionicons name="lock-closed-outline" {...props} />;
  const LocationIcon = (props: any) => <Ionicons name="location-outline" {...props} />;
  const PersonAddIcon = (props: any) => <Ionicons name="person-add" {...props} />;

  React.useEffect(() => {
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
      }),
    ]).start();
  }, []);

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');

    if (field === 'password') {
      calculatePasswordStrength(value as string);
    }
  };

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength += 25;
    if (password.match(/\d/)) strength += 25;
    if (password.match(/[^a-zA-Z\d]/)) strength += 25;

    setPasswordStrength(strength);
    Animated.timing(progressAnim, {
      toValue: strength,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 25) return '#FF3B30';
    if (passwordStrength < 50) return '#FF9500';
    if (passwordStrength < 75) return '#FFCC00';
    return '#4CD964';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 25) return 'Weak';
    if (passwordStrength < 50) return 'Fair';
    if (passwordStrength < 75) return 'Good';
    return 'Strong';
  };

  const validateForm = () => {
    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
      return 'Please fill in all fields';
    }

    if (!validateEmail(formData.email)) {
      return 'Please enter a valid email address';
    }

    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match';
    }

    if (formData.password.length < 6) {
      return 'Password must be at least 6 characters';
    }

    if (!formData.agreeToTerms) {
      return 'Please agree to the Terms of Service and Privacy Policy';
    }

    return null;
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSignup = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: signUpError } = await signUp(
        formData.email,
        formData.password,
        formData.fullName,
        formData.country
      );

      if (signUpError) {
        setError(signUpError.message);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Success animation before navigation
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: -50,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start(() => {
          router.replace('/(tabs)');
        });
      }
    } catch (err) {
      setError('An unexpected error occurred');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = () => {
    setFormData({
      fullName: 'Demo User',
      email: 'demo@medscan.africa',
      password: 'SecurePass123!',
      confirmPassword: 'SecurePass123!',
      country: 'Nigeria',
      agreeToTerms: true
    });
    calculatePasswordStrength('SecurePass123!');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2', '#f093fb']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Animated Header Section */}
          <Animated.View
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={['#ffffff', '#f8f9fa']}
                style={styles.logoBackground}
              >
                <Ionicons name="person-add" size={36} color="#667eea" />
              </LinearGradient>
            </View>

            <Text style={styles.title}>Join AFRIMED Africa</Text>
            <Text style={styles.subtitle}>
              Start your journey to better healthcare with AI diagnostics
            </Text>
          </Animated.View>

          {/* Animated Form Section */}
          <Animated.View
            style={[
              styles.formContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.98)']}
              style={styles.form}
            >
              <View style={styles.formHeader}>
                <Text style={styles.formTitle}>Create Account</Text>
                <Text style={styles.formSubtitle}>
                  Fill in your details to get started
                </Text>
              </View>

              {/* Full Name Input - FIXED */}
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChangeText={(text) => updateFormData('fullName', text)}
                leftIcon={PersonIcon}
                containerStyle={styles.inputContainer}
              />

              {/* Email Input - FIXED */}
              <Input
                label="Email Address"
                placeholder="Enter your email"
                value={formData.email}
                onChangeText={(text) => updateFormData('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                leftIcon={MailIcon}
                containerStyle={styles.inputContainer}
              />

              {/* Country Picker */}
              <TouchableOpacity
                style={styles.countryPicker}
                onPress={() => setShowCountryPicker(!showCountryPicker)}
              >
                <View style={styles.countryInput}>
                  <LocationIcon size={20} color="#666" />
                  <Text style={[
                    styles.countryText,
                    !formData.country && styles.countryPlaceholder
                  ]}>
                    {formData.country || 'Select your country'}
                  </Text>
                  <Ionicons
                    name={showCountryPicker ? "chevron-up" : "chevron-down"}
                    size={16}
                    color="#666"
                  />
                </View>
              </TouchableOpacity>

              {/* Country Dropdown */}
              {showCountryPicker && (
                <View style={styles.countryDropdown}>
                  <ScrollView style={styles.countryList} nestedScrollEnabled>
                    {COUNTRIES.map((country) => (
                      <TouchableOpacity
                        key={country}
                        style={styles.countryItem}
                        onPress={() => {
                          updateFormData('country', country);
                          setShowCountryPicker(false);
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                      >
                        <Text style={styles.countryItemText}>{country}</Text>
                        {formData.country === country && (
                          <Ionicons name="checkmark" size={16} color="#667eea" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Password Input - FIXED */}
              <Input
                label="Password"
                placeholder="Create a secure password"
                value={formData.password}
                onChangeText={(text) => updateFormData('password', text)}
                secureTextEntry
                showPasswordToggle
                leftIcon={LockIcon}
                containerStyle={styles.inputContainer}
              />

              {/* Password Strength Indicator */}
              {formData.password.length > 0 && (
                <View style={styles.passwordStrength}>
                  <View style={styles.strengthHeader}>
                    <Text style={styles.strengthLabel}>Password Strength</Text>
                    <Text style={[styles.strengthText, { color: getPasswordStrengthColor() }]}>
                      {getPasswordStrengthText()}
                    </Text>
                  </View>
                  <View style={styles.progressBar}>
                    <Animated.View
                      style={[
                        styles.progressFill,
                        {
                          width: progressAnim.interpolate({
                            inputRange: [0, 100],
                            outputRange: ['0%', '100%']
                          }),
                          backgroundColor: getPasswordStrengthColor()
                        }
                      ]}
                    />
                  </View>
                </View>
              )}

              {/* Confirm Password Input - FIXED */}
              <Input
                label="Confirm Password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChangeText={(text) => updateFormData('confirmPassword', text)}
                secureTextEntry
                showPasswordToggle
                leftIcon={LockIcon}
                containerStyle={styles.inputContainer}
              />

              {/* Terms Agreement */}
              <TouchableOpacity
                style={styles.termsContainer}
                onPress={() => updateFormData('agreeToTerms', !formData.agreeToTerms)}
              >
                <View style={[
                  styles.checkbox,
                  formData.agreeToTerms && styles.checkboxChecked
                ]}>
                  {formData.agreeToTerms && (
                    <Ionicons name="checkmark" size={16} color="white" />
                  )}
                </View>
                <Text style={styles.termsText}>
                  I agree to the{' '}
                  <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </TouchableOpacity>

              {/* Error Message */}
              {error ? (
                <Animated.View
                  style={[
                    styles.errorContainer,
                    { opacity: fadeAnim }
                  ]}
                >
                  <Ionicons name="warning-outline" size={16} color="#FF3B30" />
                  <Text style={styles.error}>{error}</Text>
                </Animated.View>
              ) : null}

              {/* Sign Up Button - FIXED */}
              <Button
                title="Create Account"
                onPress={handleSignup}
                loading={loading}
                style={styles.button}
                variant="primary"
                icon={PersonAddIcon}
                disabled={!formData.agreeToTerms}
              />

              {/* Quick Fill Demo */}
              <TouchableOpacity
                style={styles.demoButton}
                onPress={handleQuickFill}
              >
                <Text style={styles.demoText}>
                  Use Demo Data
                </Text>
              </TouchableOpacity>

              {/* Sign In Link */}
              <View style={styles.linkContainer}>
                <Text style={styles.linkText}>
                  Already have an account?{' '}
                </Text>
                <Link href="/(auth)/login" asChild>
                  <TouchableOpacity>
                    <Text style={styles.link}>
                      Sign In
                    </Text>
                  </TouchableOpacity>
                </Link>
              </View>

              {/* Security Assurance */}
              <View style={styles.securityBadge}>
                <Ionicons name="shield-checkmark" size={16} color="#4CD964" />
                <Text style={styles.securityText}>
                  Your data is securely encrypted and protected
                </Text>
              </View>
            </LinearGradient>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Background Decorations */}
      <View style={styles.backgroundCircle1} />
      <View style={styles.backgroundCircle2} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    minHeight: height,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoBackground: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 36,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  formContainer: {
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  form: {
    borderRadius: 24,
    padding: 30,
    overflow: 'hidden',
  },
  formHeader: {
    marginBottom: 25,
    alignItems: 'center',
  },
  formTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
  },
  formSubtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 18,
  },
  countryPicker: {
    marginBottom: 18,
  },
  countryInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  countryText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  countryPlaceholder: {
    color: '#999',
  },
  countryDropdown: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    marginTop: -10,
    marginBottom: 18,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  countryList: {
    maxHeight: 180,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  countryItemText: {
    fontSize: 16,
    color: '#333',
  },
  passwordStrength: {
    marginBottom: 18,
  },
  strengthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  strengthLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  strengthText: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e9ecef',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    padding: 12,
    backgroundColor: 'rgba(102, 126, 234, 0.05)',
    borderRadius: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#667eea',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  termsLink: {
    color: '#667eea',
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 18,
  },
  error: {
    color: '#FF3B30',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  button: {
    marginTop: 10,
    marginBottom: 15,
  },
  demoButton: {
    padding: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  demoText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  linkText: {
    color: '#666',
    fontSize: 14,
  },
  link: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '700',
  },
  securityBadge: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(76, 217, 100, 0.1)',
    borderRadius: 12,
  },
  securityText: {
    color: '#4CD964',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  backgroundCircle1: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -40,
    left: -40,
    zIndex: -1,
  },
  backgroundCircle2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    bottom: -20,
    right: -20,
    zIndex: -1,
  },
});
