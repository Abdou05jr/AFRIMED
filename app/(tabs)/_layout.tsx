import { Tabs } from 'expo-router';
import { Home, Activity, Heart, Building2, User, Scan } from 'lucide-react-native';
import { StyleSheet, View, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

export default function TabLayout() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const TabBarBackground = () => (
    <LinearGradient
      colors={['rgba(255,255,255,0.98)', 'rgba(255,255,255,0.95)']}
      style={StyleSheet.absoluteFill}
    />
  );

  const ActiveTabIndicator = ({ focused }: { focused: boolean }) => (
    <Animated.View
      style={[
        styles.activeIndicator,
        {
          opacity: focused ? fadeAnim : 0,
          transform: [
            { scale: focused ? slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.8, 1]
            }) : 0 }
          ]
        }
      ]}
    >
      <LinearGradient
        colors={['#FFFFFF', '#001F3F']}
        style={styles.indicatorGradient}
      />
    </Animated.View>
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#000814',
        tabBarInactiveTintColor: '#6C757D',
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: 85,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        },
        tabBarBackground: TabBarBackground,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.tabIconContainer}>
              <ActiveTabIndicator focused={focused} />
              <Home
                color={focused ? '#000814' : color}
                size={focused ? 26 : size}
                fill={focused ? '#000814' : 'transparent'}
              />
            </View>
          ),
          tabBarLabel: ({ focused, color }) => (
            <Animated.Text
              style={[
                styles.tabLabel,
                {
                  color: focused ? '#000814' : color,
                  opacity: fadeAnim,
                  transform: [{ translateY: focused ? slideAnim : 0 }]
                }
              ]}
            >
              Home
            </Animated.Text>
          ),
        }}
      />

      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.tabIconContainer}>
              <ActiveTabIndicator focused={focused} />
              <View style={[
                styles.scanIconContainer,
                focused && styles.scanIconContainerActive
              ]}>
                <LinearGradient
                  colors={focused ? ['#001F3F', '#000814'] : ['#6C757D', '#6C757D']}
                  style={styles.scanIconGradient}
                >
                  <Scan
                    color="white"
                    size={focused ? 24 : 22}
                    strokeWidth={2.5}
                  />
                </LinearGradient>
              </View>
            </View>
          ),
          tabBarLabel: ({ focused, color }) => (
            <Animated.Text
              style={[
                styles.tabLabel,
                styles.scanLabel,
                {
                  color: focused ? '#000814' : color,
                  opacity: fadeAnim,
                  transform: [{ translateY: focused ? slideAnim : 0 }]
                }
              ]}
            >
              Scan
            </Animated.Text>
          ),
        }}
      />

      <Tabs.Screen
        name="donations"
        options={{
          title: 'Donations',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.tabIconContainer}>
              <ActiveTabIndicator focused={focused} />
              <Heart
                color={focused ? '#000814' : color}
                size={focused ? 26 : size}
                fill={focused ? '#000814' : 'transparent'}
              />
            </View>
          ),
          tabBarLabel: ({ focused, color }) => (
            <Animated.Text
              style={[
                styles.tabLabel,
                {
                  color: focused ? '#000814' : color,
                  opacity: fadeAnim,
                  transform: [{ translateY: focused ? slideAnim : 0 }]
                }
              ]}
            >
              Donations
            </Animated.Text>
          ),
        }}
      />

      <Tabs.Screen
        name="clinics"
        options={{
          title: 'Clinics',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.tabIconContainer}>
              <ActiveTabIndicator focused={focused} />
              <Building2
                color={focused ? '#000814' : color}
                size={focused ? 26 : size}
                fill={focused ? '#000814' : 'transparent'}
              />
            </View>
          ),
          tabBarLabel: ({ focused, color }) => (
            <Animated.Text
              style={[
                styles.tabLabel,
                {
                  color: focused ? '#000814' : color,
                  opacity: fadeAnim,
                  transform: [{ translateY: focused ? slideAnim : 0 }]
                }
              ]}
            >
              Clinics
            </Animated.Text>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.tabIconContainer}>
              <ActiveTabIndicator focused={focused} />
              <User
                color={focused ? '#000814' : color}
                size={focused ? 26 : size}
                fill={focused ? '#000814' : 'transparent'}
              />
            </View>
          ),
          tabBarLabel: ({ focused, color }) => (
            <Animated.Text
              style={[
                styles.tabLabel,
                {
                  color: focused ? '#000814' : color,
                  opacity: fadeAnim,
                  transform: [{ translateY: focused ? slideAnim : 0 }]
                }
              ]}
            >
              Profile
            </Animated.Text>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    top: -8,
    width: 40,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  indicatorGradient: {
    width: '100%',
    height: '100%',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: -4,
    marginBottom: 8,
  },
  scanLabel: {
    fontWeight: '700',
  },
  scanIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000814',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  scanIconContainerActive: {
    shadowColor: '#000814',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    transform: [{ scale: 1.1 }],
  },
  scanIconGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// Additional style for the main container to handle safe areas
export const MainContainer = ({ children }: { children: React.ReactNode }) => (
  <View style={containerStyles.main}>
    {children}
    {/* Custom Tab Bar Background with Blur Effect */}
    <View style={containerStyles.tabBarBackground}>
      <LinearGradient
        colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.95)']}
        style={containerStyles.backgroundGradient}
      />
      {/* Border Top */}
      <View style={containerStyles.borderTop} />
    </View>
  </View>
);

const containerStyles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  tabBarBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 85,
  },
  backgroundGradient: {
    flex: 1,
  },
  borderTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
});
