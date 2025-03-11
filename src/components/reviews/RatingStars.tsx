import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: number;
  editable?: boolean;
  activeColor?: string;
  inactiveColor?: string;
  onRatingChange?: (rating: number) => void;
}

const AnimatedIcon = Animated.createAnimatedComponent(Ionicons);

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  maxRating = 5,
  size = 24,
  editable = false,
  activeColor = '#FFD700', // Gold color for stars
  inactiveColor = '#D3D3D3', // Light gray for inactive stars
  onRatingChange,
}) => {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const displayRating = hoveredRating !== null ? hoveredRating : rating;

  // Generate array of stars based on maxRating
  const stars = Array.from({ length: maxRating }, (_, index) => index + 1);

  // Handle star press
  const handlePress = (selectedRating: number) => {
    if (editable && onRatingChange) {
      // If the user clicks the same star again, clear the rating
      const newRating = selectedRating === rating ? 0 : selectedRating;
      onRatingChange(newRating);
    }
  };

  return (
    <View style={styles.container}>
      {stars.map((star) => {
        // Determine if star should be filled or not
        const filled = star <= displayRating;
        
        // Create animated style for hover effect
        const animatedStyle = useAnimatedStyle(() => {
          return {
            transform: [
              { 
                scale: withTiming(filled ? 1.1 : 1, { 
                  duration: 150 
                }) 
              }
            ],
          };
        });

        return (
          <TouchableOpacity
            key={star}
            activeOpacity={editable ? 0.7 : 1}
            disabled={!editable}
            onPress={() => handlePress(star)}
            onPressIn={() => editable && setHoveredRating(star)}
            onPressOut={() => editable && setHoveredRating(null)}
          >
            <AnimatedIcon
              name={filled ? 'star' : 'star-outline'}
              size={size}
              color={filled ? activeColor : inactiveColor}
              style={[styles.star, animatedStyle]}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginHorizontal: 2,
  },
});

export default RatingStars; 