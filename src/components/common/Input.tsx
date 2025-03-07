import React, { ReactNode, useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../../styles/colors';
import { spacing, borderRadius } from '../../styles';

// Input variants
export type InputVariant = 'outlined' | 'filled' | 'underlined';

// Input sizes
export type InputSize = 'small' | 'medium' | 'large';

// Input props interface
export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  variant?: InputVariant;
  size?: InputSize;
  fullWidth?: boolean;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  helperTextStyle?: TextStyle;
  errorTextStyle?: TextStyle;
  showPasswordToggle?: boolean;
}

// Input component
export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  variant = 'outlined',
  size = 'medium',
  fullWidth = false,
  containerStyle,
  inputStyle,
  labelStyle,
  helperTextStyle,
  errorTextStyle,
  secureTextEntry,
  showPasswordToggle = false,
  ...props
}) => {
  // State for password visibility toggle
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const actualSecureTextEntry = secureTextEntry && !isPasswordVisible;
  
  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };
  
  // Get container styles based on variant and size
  const getContainerStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      marginBottom: spacing.md,
      width: fullWidth ? '100%' : 'auto',
    };
    
    return baseStyle;
  };
  
  // Get input container styles based on variant, size, and error state
  const getInputContainerStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: borderRadius.md,
      borderColor: error ? colors.light.error : colors.light.divider,
    };
    
    // Size styles
    switch (size) {
      case 'small':
        baseStyle.minHeight = 40;
        break;
      case 'large':
        baseStyle.minHeight = 56;
        break;
      case 'medium':
      default:
        baseStyle.minHeight = 48;
        break;
    }
    
    // Variant styles
    switch (variant) {
      case 'filled':
        return {
          ...baseStyle,
          backgroundColor: error ? 'rgba(255, 59, 48, 0.05)' : colors.light.card,
          borderWidth: 0,
        };
      case 'underlined':
        return {
          ...baseStyle,
          borderWidth: 0,
          borderBottomWidth: 1,
          borderRadius: 0,
        };
      case 'outlined':
      default:
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
        };
    }
  };
  
  // Get input styles based on size and variant
  const getInputStyles = (): TextStyle => {
    const baseStyle: TextStyle = {
      flex: 1,
      color: colors.light.text.primary,
      fontSize: 14, // Using direct value instead of textStyle.body1.fontSize
    };
    
    // Padding based on variant and size
    switch (variant) {
      case 'filled':
      case 'outlined':
        switch (size) {
          case 'small':
            baseStyle.paddingVertical = spacing.xs;
            baseStyle.paddingHorizontal = spacing.sm;
            break;
          case 'large':
            baseStyle.paddingVertical = spacing.md;
            baseStyle.paddingHorizontal = spacing.base;
            break;
          case 'medium':
          default:
            baseStyle.paddingVertical = spacing.sm;
            baseStyle.paddingHorizontal = spacing.base;
            break;
        }
        break;
      case 'underlined':
        baseStyle.paddingVertical = spacing.sm;
        baseStyle.paddingHorizontal = 0;
        break;
    }
    
    // Adjust padding if there's a left icon
    if (leftIcon) {
      baseStyle.paddingLeft = spacing.xs;
    }
    
    // Adjust padding if there's a right icon or password toggle
    if (rightIcon || showPasswordToggle) {
      baseStyle.paddingRight = spacing.xs;
    }
    
    return baseStyle;
  };
  
  // Generate the password toggle icon - in a real app this would use an icon library
  const renderPasswordToggle = () => {
    if (!showPasswordToggle || !secureTextEntry) return null;
    
    return (
      <TouchableOpacity
        onPress={togglePasswordVisibility}
        style={styles.iconContainer}
      >
        <Text>{isPasswordVisible ? '👁️' : '👁️‍🗨️'}</Text>
      </TouchableOpacity>
    );
  };
  
  return (
    <View style={[getContainerStyles(), containerStyle]}>
      {label && (
        <Text style={[styles.label, labelStyle]}>{label}</Text>
      )}
      
      <View style={getInputContainerStyles()}>
        {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
        
        <TextInput
          style={[getInputStyles(), inputStyle]}
          placeholderTextColor={colors.light.text.inactive}
          secureTextEntry={actualSecureTextEntry}
          {...props}
        />
        
        {renderPasswordToggle()}
        {rightIcon && !showPasswordToggle && (
          <View style={styles.iconContainer}>{rightIcon}</View>
        )}
      </View>
      
      {(error || helperText) && (
        <Text 
          style={[
            styles.helperText,
            error ? styles.errorText : helperTextStyle,
            error ? errorTextStyle : null,
          ]}
        >
          {error || helperText}
        </Text>
      )}
    </View>
  );
};

// Component styles
const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: spacing.xs,
    color: colors.light.text.primary,
  },
  helperText: {
    fontSize: 12,
    marginTop: spacing.xs,
    color: colors.light.text.secondary,
  },
  errorText: {
    color: colors.light.error,
  },
  iconContainer: {
    paddingHorizontal: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Input;
