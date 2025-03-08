import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Alert
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius } from '../../styles';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, CommonActions } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const LoginScreen: React.FC = () => {
  const { login, isLoading, isAuthenticated, user } = useAuth();
  const { theme, isDarkMode } = useTheme();
  const navigation = useNavigation();

  // Kullanıcı girişi yapıldığında Main ekranına yönlendir
  useEffect(() => {
    console.log('LoginScreen useEffect - isAuthenticated:', isAuthenticated);
    console.log('LoginScreen useEffect - user:', user?.display_name);
    
    if (isAuthenticated && user) {
      console.log('Navigating to Main screen...');
      // @ts-ignore - NavigationProp tipini belirtmediğimiz için
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        })
      );
    }
  }, [isAuthenticated, user, navigation]);

  const handleLogin = async () => {
    try {
      console.log('Attempting to login...');
      await login();
      
      // Login başarılı olduğunda useEffect tarafından yönlendirme yapılacak
      console.log('Login function completed, waiting for auth state update...');
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(
        'Giriş Hatası',
        'Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.',
        [{ text: 'Tamam', style: 'cancel' }]
      );
    }
  };

  // Tam ekran yükleme göstergesi
  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text.primary }]}>
          Spotify ile bağlantı kuruluyor...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      <LinearGradient
        colors={[
          isDarkMode ? 'rgba(18, 18, 18, 0.6)' : 'rgba(255, 255, 255, 0.6)',
          theme.colors.background
        ]}
        style={styles.gradientOverlay}
      />
      
      {/* Background Circles */}
      <View style={[styles.circle, styles.circle1, { backgroundColor: `${theme.colors.primary}30` }]} />
      <View style={[styles.circle, styles.circle2, { backgroundColor: `${theme.colors.secondary}20` }]} />
      <View style={[styles.circle, styles.circle3, { backgroundColor: `${theme.colors.primary}15` }]} />
      
      <SafeAreaView style={styles.content}>
        {/* Logo and Branding */}
        <View style={styles.logoContainer}>
          <View style={[styles.logoBackground, { backgroundColor: `${theme.colors.primary}30` }]}>
            <Ionicons name="musical-notes" size={64} color={theme.colors.primary} />
          </View>
          <Text style={[styles.appName, { color: theme.colors.text.primary }]}>
            Jukebox
          </Text>
          <Text style={[styles.tagline, { color: theme.colors.text.secondary }]}>
            Müziği Keşfet, Paylaş, Bağlan
          </Text>
        </View>
        
        {/* Features Highlight */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: `${theme.colors.primary}20` }]}>
              <Ionicons name="musical-notes" size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={[styles.featureTitle, { color: theme.colors.text.primary }]}>
                Spotify Bağlantısı
              </Text>
              <Text style={[styles.featureDescription, { color: theme.colors.text.secondary }]}>
                Sevdiğiniz tüm müziklere ve çalma listelerine erişin
              </Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: `${theme.colors.primary}20` }]}>
              <Ionicons name="people" size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={[styles.featureTitle, { color: theme.colors.text.primary }]}>
                Grup Dinleme
              </Text>
              <Text style={[styles.featureDescription, { color: theme.colors.text.secondary }]}>
                Arkadaşlarınızla aynı anda müzik keyfi
              </Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: `${theme.colors.primary}20` }]}>
              <Ionicons name="stats-chart" size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={[styles.featureTitle, { color: theme.colors.text.primary }]}>
                Müzik İstatistikleri
              </Text>
              <Text style={[styles.featureDescription, { color: theme.colors.text.secondary }]}>
                Dinleme alışkanlıklarınızı keşfedin
              </Text>
            </View>
          </View>
        </View>
        
        {/* Login Button */}
        <View style={styles.loginContainer}>
          <TouchableOpacity
            style={[
              styles.loginButton,
              { backgroundColor: isLoading ? theme.colors.card : theme.colors.primary }
            ]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={theme.colors.text.primary} size="small" />
            ) : (
              <>
                <Ionicons name="musical-note" size={24} color="white" style={styles.buttonIcon} />
                <Text style={styles.loginButtonText}>
                  Spotify ile Giriş Yap
                </Text>
              </>
            )}
          </TouchableOpacity>
          
          <Text style={[styles.disclaimer, { color: theme.colors.text.secondary }]}>
            Giriş yaparak <Text style={{ color: theme.colors.primary }}>Kullanım Koşulları</Text>'nı
            ve <Text style={{ color: theme.colors.primary }}>Gizlilik Politikası</Text>'nı kabul etmiş olursunuz.
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientOverlay: {
    position: 'absolute',
    width: width,
    height: height,
    zIndex: 0,
  },
  circle: {
    position: 'absolute',
    borderRadius: 1000,
    zIndex: -1,
  },
  circle1: {
    width: width * 0.8,
    height: width * 0.8,
    top: -width * 0.2,
    right: -width * 0.2,
  },
  circle2: {
    width: width * 0.7,
    height: width * 0.7,
    bottom: height * 0.2,
    left: -width * 0.3,
  },
  circle3: {
    width: width * 0.4,
    height: width * 0.4,
    bottom: -width * 0.1,
    right: width * 0.1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'space-between',
    paddingVertical: spacing.xl * 2,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  logoBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  tagline: {
    fontSize: 16,
  },
  featuresContainer: {
    marginVertical: spacing.xxl,
    paddingHorizontal: spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingLeft: spacing.md,
  },
  featureIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.lg,
    marginLeft: spacing.sm,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.xs / 2,
  },
  featureDescription: {
    fontSize: 14,
  },
  loginContainer: {
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.pill,
    marginBottom: spacing.lg,
    marginHorizontal: spacing.xl,
  },
  buttonIcon: {
    marginRight: spacing.sm,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disclaimer: {
    textAlign: 'center',
    fontSize: 12,
    paddingHorizontal: spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.base,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
