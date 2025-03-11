import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Switch,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { spacing } from '../../styles';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { CommonActions } from '@react-navigation/native';

const SettingsScreen: React.FC = () => {
  const { theme, toggleTheme, isDarkMode } = useTheme();
  const navigation = useNavigation();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      Alert.alert(
        'Sign Out',
        'Are you sure you want to sign out?',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Sign Out',
            style: 'destructive',
            onPress: async () => {
              try {
                console.log('Logging out user...');
                // Perform logout
                const logoutSuccess = await logout();
                
                if (logoutSuccess) {
                  console.log('Logout successful, navigating to Auth screen...');
                  // Navigate to Auth screen using reset to clear navigation history
                  navigation.dispatch(
                    CommonActions.reset({
                      index: 0,
                      routes: [{ name: 'Auth' }],
                    })
                  );
                } else {
                  console.error('Logout returned false, showing error');
                  Alert.alert(
                    'Error',
                    'Failed to sign out. Please try again.'
                  );
                }
              } catch (error) {
                console.error('Error during logout process:', error);
                Alert.alert(
                  'Error',
                  'Failed to complete sign out process. Please try again.'
                );
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error showing logout confirmation:', error);
      Alert.alert(
        'Error',
        'An error occurred while signing out. Please try again.'
      );
    }
  };

  // Render a settings item with icon
  const SettingsItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress,
    hasSwitch = false,
    switchValue = false,
    onSwitchChange
  }: { 
    icon: string; 
    title: string; 
    subtitle?: string;
    onPress?: () => void;
    hasSwitch?: boolean;
    switchValue?: boolean;
    onSwitchChange?: (value: boolean) => void;
  }) => (
    <TouchableOpacity 
      style={styles.settingsItem}
      onPress={onPress}
      disabled={hasSwitch}
    >
      <View style={[styles.iconContainer, { backgroundColor: theme.colors.card }]}>
        <Ionicons name={icon as any} size={22} color={theme.colors.primary} />
      </View>
      <View style={styles.settingsTextContent}>
        <Text style={[styles.settingsTitle, { color: theme.colors.text.primary }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.settingsSubtitle, { color: theme.colors.text.secondary }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {hasSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: '#767577', true: `${theme.colors.primary}80` }}
          thumbColor={switchValue ? theme.colors.primary : '#f4f3f4'}
        />
      ) : (
        <Ionicons name="chevron-forward" size={20} color={theme.colors.text.secondary} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
          Settings
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.secondary }]}>
            ACCOUNT
          </Text>
          
          <SettingsItem 
            icon="person" 
            title="Profile" 
            subtitle="Edit your profile information"
            onPress={() => {}}
          />
          
          <SettingsItem 
            icon="notifications" 
            title="Notifications" 
            subtitle="Manage notification preferences"
            onPress={() => {}}
          />
          
          <SettingsItem 
            icon="lock-closed" 
            title="Privacy" 
            subtitle="Control your privacy settings"
            onPress={() => {}}
          />
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.secondary }]}>
            PREFERENCES
          </Text>
          
          <SettingsItem 
            icon="moon" 
            title="Dark Mode" 
            hasSwitch={true}
            switchValue={isDarkMode}
            onSwitchChange={toggleTheme}
          />
          
          <SettingsItem 
            icon="musical-notes" 
            title="Audio Quality" 
            subtitle="Manage streaming and download quality"
            onPress={() => {
              // @ts-ignore
              navigation.navigate('SpotifyTest');
            }}
          />
          
          <SettingsItem 
            icon="save" 
            title="Storage" 
            subtitle="Manage cache and downloaded content"
            onPress={() => {}}
          />
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.secondary }]}>
            ABOUT
          </Text>
          
          <SettingsItem 
            icon="information-circle" 
            title="About Jukebox" 
            subtitle="Version 1.0.0"
            onPress={() => {}}
          />
          
          <SettingsItem 
            icon="help-circle" 
            title="Help & Support" 
            onPress={() => {}}
          />
          
          <SettingsItem 
            icon="document-text" 
            title="Terms & Privacy Policy" 
            onPress={() => {}}
          />
        </View>
        
        <TouchableOpacity 
          style={[styles.logoutButton, { backgroundColor: theme.colors.error + '20' }]}
          onPress={handleLogout}
        >
          <Text style={[styles.logoutText, { color: theme.colors.error }]}>
            Sign Out
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerRight: {
    width: 44,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    marginTop: spacing.base,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.lg,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  settingsTextContent: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingsSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  logoutButton: {
    marginTop: spacing.lg,
    marginHorizontal: spacing.lg,
    borderRadius: 8,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  logoutText: {
    fontWeight: '500',
    fontSize: 16,
  }
});

export default SettingsScreen; 