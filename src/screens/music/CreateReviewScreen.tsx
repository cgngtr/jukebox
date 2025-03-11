import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../api/supabase';

import { ReviewForm } from '../../components/reviews';
import { createReview } from '../../api/reviews';
import { User } from '@supabase/supabase-js';
import { AppStackParamList } from '../../navigation/AppNavigator';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius } from '../../styles';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

type CreateReviewParams = {
  itemId: string;
  itemType: 'album' | 'track' | 'artist';
  itemName?: string;
  itemImage?: string;
};

type CreateReviewRouteProp = RouteProp<AppStackParamList, 'CreateReview'>;

export const CreateReviewScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<CreateReviewRouteProp>();
  const { itemId, itemType, itemName, itemImage } = route.params;
  const { theme } = useTheme();
  
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableTags, setAvailableTags] = useState<any[]>([]);
  
  // Fetch the current user and available tags
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        // Get common tags for this item type
        const { data: tags, error } = await supabase
          .from('common_tags')
          .select('id, name')
          .eq('item_type', itemType)
          .order('frequency', { ascending: false })
          .limit(10);
          
        if (!error) {
          setAvailableTags(tags || []);
        } else {
          console.error('Error fetching tags:', error);
          setAvailableTags([]);
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setAvailableTags([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInitialData();
  }, [itemType]);
  
  // Handle the review submission
  const handleSubmit = async (formData: { rating: number; content: string; tags: string[] }) => {
    if (!user) {
      Alert.alert(
        'Authentication Required',
        'Please log in to submit a review.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await createReview(
        user,
        itemId,
        itemType,
        formData.rating,
        formData.content,
        formData.tags
      );
      
      if (result) {
        // Success! Go back to the previous screen
        Alert.alert(
          'Review Submitted',
          'Your review has been successfully posted.',
          [
            { 
              text: 'OK', 
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        throw new Error('Failed to create review');
      }
    } catch (error) {
      console.error('Error creating review:', error);
      Alert.alert(
        'Error',
        'There was a problem posting your review. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.divider }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>Write a Review</Text>
        <View style={styles.placeholder} />
      </View>
      
      <View style={[styles.itemInfoContainer, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.divider }]}>
        {itemImage && (
          <View style={styles.imageContainer}>
            <View style={[styles.imageWrapper, { backgroundColor: `${theme.colors.primary}10` }]}>
              <Ionicons name="musical-notes" size={28} color={theme.colors.primary} />
            </View>
          </View>
        )}
        <View style={styles.textContainer}>
          <Text style={[styles.reviewingText, { color: theme.colors.text.secondary }]}>
            You're reviewing:
          </Text>
          <Text style={[styles.itemName, { color: theme.colors.text.primary }]}>
            {itemName || `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} (ID: ${itemId})`}
          </Text>
        </View>
      </View>
      
      <ReviewForm
        onSubmit={handleSubmit}
        onCancel={() => navigation.goBack()}
        availableTags={availableTags}
        isSubmitting={isSubmitting}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  itemInfoContainer: {
    flexDirection: 'row',
    padding: spacing.base,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  imageContainer: {
    marginRight: spacing.md,
  },
  imageWrapper: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  reviewingText: {
    fontSize: 14,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: spacing.xxs,
  },
});

export default CreateReviewScreen; 