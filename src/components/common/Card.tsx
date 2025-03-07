import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity, TouchableOpacityProps, DimensionValue } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius, shadows } from '../../styles';

// Card props interface
export interface CardProps extends TouchableOpacityProps {
  children: ReactNode;
  style?: ViewStyle;
  elevation?: 'none' | 'small' | 'medium' | 'large';
  pressable?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  padding?: number | DimensionValue;
}

// Card component
export const Card: React.FC<CardProps> = ({
  children,
  style,
  elevation = 'small',
  pressable = false,
  backgroundColor,
  borderColor,
  padding,
  ...props
}) => {
  // Use theme to get dark/light mode colors
  const { theme, isDarkMode } = useTheme();
  
  // Get shadow style based on elevation
  const getShadowStyle = (): ViewStyle => {
    switch (elevation) {
      case 'none':
        return shadows.none;
      case 'small':
        return shadows.sm;
      case 'medium':
        return shadows.md;
      case 'large':
        return shadows.lg;
      default:
        return shadows.sm;
    }
  };

  // Base card styles with theme-aware colors
  const cardStyle: ViewStyle = {
    borderRadius: borderRadius.md,
    backgroundColor: backgroundColor || theme.colors.card,
    padding: padding !== undefined ? padding : spacing.base,
    borderWidth: borderColor ? 1 : 0,
    borderColor: borderColor || (isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'),
    ...getShadowStyle(),
  };

  // If card is pressable, wrap in TouchableOpacity, otherwise use View
  if (pressable) {
    return (
      <TouchableOpacity
        style={[cardStyle, style]}
        activeOpacity={0.8}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[cardStyle, style]}>{children}</View>;
};

// Component styles
const styles = StyleSheet.create({
  // Additional styles can be added here if needed
});

export default Card;
