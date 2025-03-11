import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Alert,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import RatingStars from './RatingStars';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius } from '../../styles';

interface Tag {
  id: string;
  name: string;
}

interface ReviewFormProps {
  initialRating?: number;
  initialContent?: string;
  initialTags?: string[];
  availableTags?: Tag[];
  onSubmit: (data: { rating: number; content: string; tags: string[] }) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  isEditing?: boolean;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  initialRating = 0,
  initialContent = '',
  initialTags = [],
  availableTags = [],
  onSubmit,
  onCancel,
  isSubmitting = false,
  isEditing = false,
}) => {
  const { theme } = useTheme();
  const [rating, setRating] = useState(initialRating);
  const [content, setContent] = useState(initialContent);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [customTag, setCustomTag] = useState('');
  const [errors, setErrors] = useState<{ rating?: string; content?: string }>({});
  
  // Bir referans kullanarak form durumunu kontrol edelim
  const isInitializedRef = useRef(false);
  const contentInputRef = useRef<TextInput>(null);

  // Form başlangıç değerlerini ayarla
  useEffect(() => {
    if (!isInitializedRef.current) {
      setRating(initialRating);
      setContent(initialContent);
      setTags([...initialTags]); // Yeni bir dizi oluştur
      isInitializedRef.current = true;
    }
  }, [initialRating, initialContent, initialTags]);

  // Rating değişikliğini işle
  const handleRatingChange = useCallback((newRating: number) => {
    setRating(newRating);
    // Rating seçildiğinde hata mesajını temizle
    if (newRating > 0 && errors.rating) {
      setErrors(prev => ({ ...prev, rating: undefined }));
    }
  }, [errors.rating]);

  // İçerik değişikliğini işle
  const handleContentChange = useCallback((text: string) => {
    setContent(text);
    // İçerik girildiğinde hata mesajını temizle
    if (text.trim().length >= 5 && errors.content) {
      setErrors(prev => ({ ...prev, content: undefined }));
    }
  }, [errors.content]);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: { rating?: string; content?: string } = {};
    
    if (rating === 0) {
      newErrors.rating = 'Please select a rating';
    }
    
    if (!content.trim()) {
      newErrors.content = 'Please write a review';
    } else if (content.trim().length < 5) {
      newErrors.content = 'Review is too short (minimum 5 characters)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        await onSubmit({
          rating,
          content: content.trim(),
          tags,
        });
        // Başarıyla gönderildikten sonra formu temizle
        if (!isEditing) {
          setRating(0);
          setContent('');
          setTags([]);
          setCustomTag('');
        }
      } catch (error) {
        Alert.alert(
          'Error',
          'There was a problem submitting your review. Please try again.',
        );
      }
    }
  };

  // Toggle tag selection
  const toggleTag = (tagName: string) => {
    setTags(prevTags => {
      if (prevTags.includes(tagName)) {
        return prevTags.filter(tag => tag !== tagName);
      } else {
        return [...prevTags, tagName];
      }
    });
  };

  // Add custom tag
  const addCustomTag = () => {
    const trimmedTag = customTag.trim();
    
    if (!trimmedTag) {
      return;
    }
    
    if (trimmedTag.length > 20) {
      Alert.alert('Error', 'Tag must be less than 20 characters');
      return;
    }
    
    if (!tags.includes(trimmedTag)) {
      setTags(prevTags => [...prevTags, trimmedTag]);
      setCustomTag('');
    } else {
      Alert.alert('Already Added', 'This tag is already in your review');
    }
  };

  // Render available tags section
  const renderAvailableTags = () => {
    return (
      <View style={styles.tagsContainer}>
        {availableTags.map((tag) => (
          <TouchableOpacity
            key={tag.id}
            style={[
              styles.tagChip,
              { 
                backgroundColor: tags.includes(tag.name) 
                  ? `${theme.colors.primary}20` 
                  : theme.colors.card,
                borderColor: theme.colors.divider
              }
            ]}
            onPress={() => toggleTag(tag.name)}
          >
            <Text
              style={[
                styles.tagText,
                { 
                  color: tags.includes(tag.name) 
                    ? theme.colors.primary 
                    : theme.colors.text.secondary 
                }
              ]}
            >
              {tag.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Render selected tags section
  const renderSelectedTags = () => {
    if (tags.length === 0) return null;
    
    return (
      <View style={styles.selectedTagsContainer}>
        <Text style={[styles.selectedTagsTitle, { color: theme.colors.text.primary }]}>
          Selected Tags:
        </Text>
        <View style={styles.tagsContainer}>
          {tags.map((tag, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.selectedTag, { backgroundColor: theme.colors.primary }]}
              onPress={() => toggleTag(tag)}
            >
              <Text style={styles.selectedTagText}>{tag}</Text>
              <Ionicons name="close" size={16} color="#fff" />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ScrollView 
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Rating Section */}
          <View style={[styles.section, { borderBottomColor: theme.colors.divider }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              Your Rating
            </Text>
            <View style={styles.ratingContainer}>
              <RatingStars
                rating={rating}
                editable={true}
                size={36}
                onRatingChange={handleRatingChange}
              />
            </View>
            {errors.rating && <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.rating}</Text>}
          </View>
          
          {/* Review Text Section */}
          <View style={[styles.section, { borderBottomColor: theme.colors.divider }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              Your Review
            </Text>
            <TextInput
              style={[
                styles.textInput, 
                { 
                  backgroundColor: theme.colors.card, 
                  color: theme.colors.text.primary,
                  borderColor: theme.colors.divider
                }
              ]}
              multiline
              placeholder="Share your thoughts about this music..."
              placeholderTextColor={theme.colors.text.inactive}
              value={content}
              onChangeText={handleContentChange}
              textAlignVertical="top"
              maxLength={1000}
              ref={contentInputRef}
            />
            <Text style={[styles.characterCount, { color: theme.colors.text.secondary }]}>
              {content.length}/1000 characters
            </Text>
            {errors.content && <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.content}</Text>}
          </View>
          
          {/* Tags Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              Tags
            </Text>
            <Text style={[styles.sectionSubtitle, { color: theme.colors.text.secondary }]}>
              Add tags to help others discover your review
            </Text>
            
            {/* Available Tags */}
            {renderAvailableTags()}
            
            {/* Custom Tag Input */}
            <View style={styles.customTagContainer}>
              <TextInput
                style={[
                  styles.customTagInput, 
                  { 
                    backgroundColor: theme.colors.card, 
                    color: theme.colors.text.primary,
                    borderColor: theme.colors.divider
                  }
                ]}
                placeholder="Add a custom tag..."
                placeholderTextColor={theme.colors.text.inactive}
                value={customTag}
                onChangeText={setCustomTag}
                maxLength={20}
              />
              <TouchableOpacity 
                style={[styles.addTagButton, { backgroundColor: theme.colors.primary }]}
                onPress={addCustomTag}
                disabled={!customTag.trim()}
              >
                <Ionicons name="add" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            
            {/* Selected Tags */}
            {renderSelectedTags()}
          </View>
        </ScrollView>
        
        {/* Action Buttons */}
        <View style={[styles.actionsContainer, { borderTopColor: theme.colors.divider }]}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
            disabled={isSubmitting}
          >
            <Text style={[styles.cancelButtonText, { color: theme.colors.text.secondary }]}>
              Cancel
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isEditing ? 'Update Review' : 'Post Review'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    padding: spacing.base,
  },
  section: {
    marginBottom: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: spacing.md,
  },
  ratingContainer: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  textInput: {
    height: 150,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 16,
    marginBottom: spacing.xs,
  },
  characterCount: {
    fontSize: 12,
    textAlign: 'right',
    marginBottom: spacing.xs,
  },
  errorText: {
    fontSize: 14,
    marginTop: spacing.xs,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  tagChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.pill,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 14,
  },
  customTagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  customTagInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    marginRight: spacing.sm,
  },
  addTagButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedTagsContainer: {
    marginBottom: spacing.md,
  },
  selectedTagsTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.pill,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  selectedTagText: {
    color: '#fff',
    fontSize: 14,
    marginRight: spacing.xs,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderTopWidth: 1,
  },
  cancelButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  submitButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReviewForm; 