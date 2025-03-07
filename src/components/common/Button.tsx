import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors } from '../../styles/colors';
import { spacing, borderRadius } from '../../styles';

// Button variants
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

// Button sizes
export type ButtonSize = 'small' | 'medium' | 'large';

// Button props interface
export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

// Button component
export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  style,
  textStyle: customTextStyle,
  ...props
}) => {
  // Determine button styles based on variant and size
  const getButtonStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      opacity: disabled ? 0.6 : 1,
    };
    
    // Width style
    if (fullWidth) {
      baseStyle.width = '100%';
    }
    
    // Size styles
    switch (size) {
      case 'small':
        baseStyle.paddingVertical = spacing.xs;
        baseStyle.paddingHorizontal = spacing.sm;
        baseStyle.minHeight = 32;
        break;
      case 'large':
        baseStyle.paddingVertical = spacing.md;
        baseStyle.paddingHorizontal = spacing.lg;
        baseStyle.minHeight = 56;
        break;
      case 'medium':
      default:
        baseStyle.paddingVertical = spacing.sm;
        baseStyle.paddingHorizontal = spacing.md;
        baseStyle.minHeight = 48;
        break;
    }
    
    // Variant styles
    switch (variant) {
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: colors.light.secondary,
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.light.primary,
        };
      case 'ghost':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
        };
      case 'primary':
      default:
        return {
          ...baseStyle,
          backgroundColor: colors.light.primary,
        };
    }
  };
  
  // Determine text styles based on variant and size
  const getTextStyles = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: '600',
      textAlign: 'center',
    };
    
    // Size styles
    switch (size) {
      case 'small':
        baseStyle.fontSize = 12;
        break;
      case 'large':
        baseStyle.fontSize = 16;
        break;
      case 'medium':
      default:
        baseStyle.fontSize = 14;
        break;
    }
    
    // Variant styles
    switch (variant) {
      case 'secondary':
        baseStyle.color = '#FFFFFF';
        break;
      case 'outline':
      case 'ghost':
        baseStyle.color = colors.light.primary;
        break;
      case 'primary':
      default:
        baseStyle.color = '#FFFFFF';
        break;
    }
    
    return baseStyle;
  };
  
  return (
    <TouchableOpacity
      style={[getButtonStyles(), style]}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <View style={styles.contentContainer}>
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          <Text style={[getTextStyles(), customTextStyle]}>{title}</Text>
          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

// Component styles
const styles = StyleSheet.create({
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: spacing.xs,
  },
  iconRight: {
    marginLeft: spacing.xs,
  },
});

export default Button;
