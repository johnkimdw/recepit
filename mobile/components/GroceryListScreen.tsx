import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Pressable,
  Alert,
  Share,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import GroceryItem from './GroceryItem';
import SuggestionItem from './SuggestionItem';

// Define types
interface GroceryItemType {
  id: string;
  name: string;
  quantity: number;
  checked: boolean;
}

interface SuggestionItemType {
  id: string;
  name: string;
}

// Mock data for ingredient suggestions, fetch from API after backend is made
const MOCK_INGREDIENT_SUGGESTIONS: SuggestionItemType[] = [
  { id: '1', name: 'Almond milk' },
  { id: '2', name: 'Apple cider vinegar' },
  { id: '3', name: 'Avocado' },
  { id: '4', name: 'Banana' },
  { id: '5', name: 'Brown rice' },
  { id: '6', name: 'Cashew milk' },
  { id: '7', name: 'Chia seeds' },
];

const GroceryListScreen: React.FC = () => {
  // State management
  const [groceryItems, setGroceryItems] = useState<GroceryItemType[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [suggestions, setSuggestions] = useState<SuggestionItemType[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  
  const router = useRouter();

  // Load saved grocery list on component mount
  useEffect(() => {
    loadGroceryList();
  }, []);

  // Save grocery list when it changes
  useEffect(() => {
    saveGroceryList();
  }, [groceryItems]);

  // Filter suggestions based on search query
  useEffect(() => {
    if (searchQuery.length > 1) {
      // In a real app, you'd call an API here
      const filteredSuggestions = MOCK_INGREDIENT_SUGGESTIONS.filter(
        item => item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  // Load grocery list from AsyncStorage
  const loadGroceryList = async (): Promise<void> => {
    try {
      const jsonValue = await AsyncStorage.getItem('@grocery_list');
      if (jsonValue != null) {
        setGroceryItems(JSON.parse(jsonValue));
      }
    } catch (error) {
      console.error('Error loading grocery list:', error);
    }
  };

  // Save grocery list to AsyncStorage
  const saveGroceryList = async (): Promise<void> => {
    try {
      const jsonValue = JSON.stringify(groceryItems);
      await AsyncStorage.setItem('@grocery_list', jsonValue);
    } catch (error) {
      console.error('Error saving grocery list:', error);
    }
  };

  // Add a new item to the grocery list
  const addItem = (item: { name: string }): void => {
    // Check if item already exists
    const existingItemIndex = groceryItems.findIndex(
      existing => existing.name.toLowerCase() === item.name.toLowerCase()
    );

    if (existingItemIndex !== -1) {
      // Update quantity if item exists
      updateItemQuantity(existingItemIndex, 1);
      setSearchQuery('');
      setShowSuggestions(false);
    } else {
      // Add new item
      const newItem: GroceryItemType = {
        id: Date.now().toString(),
        name: item.name,
        quantity: 1,
        checked: false,
      };
      setGroceryItems(prevItems => [...prevItems, newItem]);
      setSearchQuery('');
      setShowSuggestions(false);
    }
  };

  // Update item quantity
  const updateItemQuantity = (index: number, change: number): void => {
    setGroceryItems(prevItems => {
      return prevItems.map((item, i) => {
        if (i === index) {
          const newQuantity = Math.max(0, item.quantity + change);
          // If quantity becomes 0, remove item in a separate step
          if (newQuantity === 0) {
            return null;
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(Boolean) as GroceryItemType[]; // Remove null items (when quantity becomes 0)
    });
  };

  // Toggle item checked status
  const toggleItemChecked = (index: number): void => {
    setGroceryItems(prevItems => {
      // Create new array with updated checked status
      const updatedItems = [...prevItems];
      updatedItems[index] = {
        ...updatedItems[index],
        checked: !updatedItems[index].checked,
      };
      
      // Sort items: unchecked first, checked items at the end
      return [
        ...updatedItems.filter(item => !item.checked),
        ...updatedItems.filter(item => item.checked),
      ];
    });
  };

  // Delete an item
  const deleteItem = (index: number): void => {
    setGroceryItems(prevItems => 
      prevItems.filter((_, i) => i !== index)
    );
  };

  // Export to Notes app
  const exportToNotes = async (): Promise<void> => {
    try {
      const formattedList = groceryItems
        .map(item => `☐ ${item.quantity}x ${item.name}`)
        .join('\n');
      
      await Share.share({
        title: 'Grocery List',
        message: formattedList,
      });
    } catch (error) {
      console.error('Error exporting list:', error);
      Alert.alert('Export Failed', 'Could not export your grocery list.');
    }
  };

  // Checkout to Instacart
  const checkoutToInstacart = (): void => {
    // Add deep linking or URL scheme for Instacart
    const instacartUrl = 'https://www.instacart.com';
    Linking.openURL(instacartUrl).catch(err => {
      Alert.alert('Error', 'Could not open Instacart. Please install the app or visit their website.');
    });
  };

  // Render grocery item
  const renderGroceryItem = ({ item, index }: { item: GroceryItemType; index: number }) => (
    <GroceryItem
      item={item}
      onUpdateQuantity={(change: number) => updateItemQuantity(index, change)}
      onToggleChecked={() => toggleItemChecked(index)}
      onDelete={() => deleteItem(index)}
    />
  );

  // Render suggestion item
  const renderSuggestionItem = ({ item }: { item: SuggestionItemType }) => (
    <SuggestionItem item={item} onAdd={() => addItem(item)} />
  );

  // Filter existing grocery items based on search query
  const filteredGroceryItems = searchQuery
    ? groceryItems.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : groceryItems;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable 
            style={styles.backButton} 
            onPress={() => router.navigate('/(tabs)/profile')}
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
            <Text style={styles.backText}>Profile</Text>
          </Pressable>
          <Text style={styles.title}>Grocery List</Text>
        </View>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setShowSuggestions(true)}
          />
          <Pressable style={styles.addButton} onPress={() => {
            if (searchQuery.trim()) {
              addItem({ name: searchQuery.trim() });
            }
          }}>
            <Ionicons name="add" size={24} color="#fff" />
          </Pressable>
        </View>
        
        {/* Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.sectionTitle}>Suggestions</Text>
            <FlatList
              data={suggestions}
              renderItem={renderSuggestionItem}
              keyExtractor={item => item.id}
              style={styles.suggestionsList}
            />
          </View>
        )}
        
        {/* Grocery Items List */}
        <FlatList
          data={filteredGroceryItems}
          renderItem={renderGroceryItem}
          keyExtractor={item => item.id}
          style={styles.groceryList}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              Your grocery list is empty. Start by searching for items to add.
            </Text>
          }
        />
        
        {/* Bottom Buttons */}
        <View style={styles.bottomButtons}>
          <Pressable 
            style={[styles.button, styles.exportButton]} 
            onPress={exportToNotes}
          >
            <Text style={styles.buttonText}>Export</Text>
            <Ionicons name="share-outline" size={20} color="#D98324" />
          </Pressable>
          
          <Pressable 
            style={[styles.button, styles.checkoutButton]} 
            onPress={checkoutToInstacart}
          >
            <Text style={styles.checkoutButtonText}>Checkout</Text>
            <Ionicons name="cart-outline" size={20} color="#fff" />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9f5eb',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#D98324',
    marginLeft: 30,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#D98324',
    borderRadius: 8,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionsContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  suggestionsList: {
    maxHeight: 150,
  },
  groceryList: {
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#888',
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  exportButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D98324',
    flex: 1,
    marginRight: 10,
  },
  checkoutButton: {
    backgroundColor: '#D98324',
    flex: 1,
    marginLeft: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#D98324',
    marginRight: 8,
  },
  checkoutButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginRight: 8,
  },
});

export default GroceryListScreen;