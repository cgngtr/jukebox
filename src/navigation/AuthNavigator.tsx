import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components';

// Placeholder for auth screens - will be replaced with actual screens later
const AuthPlaceholder = ({ 
  title, 
  navigateTo, 
  navigateLabel,
  navigation
}: { 
  title: string; 
  navigateTo: string;
  navigateLabel: string;
  navigation: any;
}) => {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text.primary }]}>
        {title}
      </Text>
      
      <Button 
        title="Continue"
        variant="primary"
        style={styles.button}
      />
      
      <TouchableOpacity
        style={styles.linkContainer}
        onPress={() => navigation.navigate(navigateTo)}
      >
        <Text style={[styles.link, { color: theme.colors.primary }]}>
          {navigateLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// Auth stack navigator types
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

// Placeholder screens - will be replaced with actual screens
const LoginScreen = ({ navigation }: any) => (
  <AuthPlaceholder 
    title="Login to Jukebox" 
    navigateTo="Register"
    navigateLabel="Don't have an account? Sign up"
    navigation={navigation}
  />
);

const RegisterScreen = ({ navigation }: any) => (
  <AuthPlaceholder 
    title="Create a Jukebox Account" 
    navigateTo="Login"
    navigateLabel="Already have an account? Sign in"
    navigation={navigation}
  />
);

const ForgotPasswordScreen = ({ navigation }: any) => (
  <AuthPlaceholder 
    title="Reset Password" 
    navigateTo="Login"
    navigateLabel="Back to Login"
    navigation={navigation}
  />
);

// Auth navigation stack
const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
      initialRouteName="Login"
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    marginVertical: 20,
  },
  linkContainer: {
    marginTop: 20,
    padding: 10,
  },
  link: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default AuthNavigator;
