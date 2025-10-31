import React, { useState } from 'react';
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
import { Input, EmailInput, PasswordInput } from '@/components/Input';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();

  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

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

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: signInError } = await signIn(email, password);

      if (signInError) {
        setError(signInError.message);
      } else {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: -50,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          router.replace('/(tabs)');
        });
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleForgotPassword = () => {
    Alert.alert(
      "Reset Password",
      "A password reset link will be sent to your email.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Send", onPress: () => console.log("Send reset email") }
      ]
    );
  };

  const handleQuickDemo = () => {
    setEmail('demo@medscan.africa');
    setPassword('demopassword123');
  };

  // Create custom icon components for Ionicons
  const MailIcon = (props: any) => <Ionicons name="mail-outline" {...props} />;
  const LockIcon = (props: any) => <Ionicons name="lock-closed-outline" {...props} />;
  const EyeIcon = (props: any) => <Ionicons name="eye-outline" {...props} />;
  const EyeOffIcon = (props: any) => <Ionicons name="eye-off-outline" {...props} />;

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
                <Ionicons name="medical" size={40} color="#667eea" />
              </LinearGradient>
            </View>

            <Text style={styles.title}>Welcome to{'\n'}AFRIMED</Text>
            <Text style={styles.subtitle}>
              AI-Powered Medical Diagnostics & Healthcare Solutions
            </Text>

            <View style={styles.featureGrid}>
              <View style={styles.featureItem}>
                <Ionicons name="scan-circle" size={20} color="#4CD964" />
                <Text style={styles.featureText}>AI Analysis</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="shield-checkmark" size={20} color="#007AFF" />
                <Text style={styles.featureText}>Secure</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="speedometer" size={20} color="#FF9500" />
                <Text style={styles.featureText}>Fast Results</Text>
              </View>
            </View>
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
                <Text style={styles.formTitle}>Sign In</Text>
                <Text style={styles.formSubtitle}>
                  Access your medical dashboard
                </Text>
              </View>

              {/* Email Input - FIXED */}
              <Input
                label="Email Address"
                placeholder="Enter your email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                leftIcon={MailIcon}
                containerStyle={styles.inputContainer}
              />

              {/* Password Input - FIXED */}
              <Input
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setError('');
                }}
                secureTextEntry
                showPasswordToggle
                leftIcon={LockIcon}
                containerStyle={styles.inputContainer}
              />

              {/* Forgot Password */}
              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={handleForgotPassword}
              >
                <Text style={styles.forgotPasswordText}>
                  Forgot your password?
                </Text>
              </TouchableOpacity>

              {/* Error Message */}
              {error ? (
                <Animated.View
                  style={[
                    styles.errorContainer,
                    {
                      opacity: fadeAnim,
                    }
                  ]}
                >
                  <Ionicons name="warning-outline" size={16} color="#FF3B30" />
                  <Text style={styles.error}>{error}</Text>
                </Animated.View>
              ) : null}

              {/* Login Button - FIXED */}
              <Button
                title="Sign In to Dashboard"
                onPress={handleLogin}
                loading={loading}
                style={styles.button}
                variant="primary"
                icon={props => <Ionicons name="arrow-forward" {...props} />}
              />

              {/* Demo Access */}
              <TouchableOpacity
                style={styles.demoButton}
                onPress={handleQuickDemo}
              >
                <Text style={styles.demoText}>
                  Try Demo Access
                </Text>
              </TouchableOpacity>

              {/* Sign Up Link */}
              <View style={styles.linkContainer}>
                <Text style={styles.linkText}>
                  New to MedScan Africa?{' '}
                </Text>
                <Link href="/(auth)/signup" asChild>
                  <TouchableOpacity>
                    <Text style={styles.link}>
                      Create Account
                    </Text>
                  </TouchableOpacity>
                </Link>
              </View>

              {/* Security Badge */}
              <View style={styles.securityBadge}>
                <Ionicons name="shield-checkmark" size={16} color="#4CD964" />
                <Text style={styles.securityText}>
                  HIPAA Compliant • End-to-End Encrypted
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
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 38,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  featureGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  featureText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
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
    marginBottom: 30,
    alignItems: 'center',
  },
  formTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#00D4FF',
    fontSize: 14,
    fontWeight: '500',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
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
    color: '#00D4FF',
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
    color: '#6C757D',
    fontSize: 14,
  },
  link: {
    color: '#00D4FF',
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
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -50,
    right: -50,
    zIndex: -1,
  },
  backgroundCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    bottom: -30,
    left: -30,
    zIndex: -1,
  },
});
