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
  
  // Use hoveredRating if available, otherwise use the actual rating
  const displayRating = hoveredRating !== null ? hoveredRating : rating;
  
  // Handle star press
  const handlePress = (selectedRating: number) => {
    if (editable && onRatingChange) {
      // If the user clicks the same star again, clear the rating
      const newRating = selectedRating === rating ? 0 : selectedRating;
      onRatingChange(newRating);
    }
  };

  // Generate stars based on maxRating
  const renderStars = () => {
    const stars = [];
    
    for (let i = 1; i <= maxRating; i++) {
      const filled = i <= displayRating;
      
      stars.push(
        <TouchableOpacity
          key={i}
          activeOpacity={editable ? 0.7 : 1}
          disabled={!editable}
          onPress={() => handlePress(i)}
          onPressIn={() => editable && setHoveredRating(i)}
          onPressOut={() => editable && setHoveredRating(null)}
          style={styles.starButton}
        >
          <Ionicons
            name={filled ? 'star' : 'star-outline'}
            size={size}
            color={filled ? activeColor : inactiveColor}
            style={styles.star}
          />
        </TouchableOpacity>
      );
    }
    
    return stars;
  };

  return (
    <View style={styles.container}>
      {renderStars()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starButton: {
    padding: 4, // Larger touch area
  },
  star: {
    marginHorizontal: 2,
  },
});

export default RatingStars; 