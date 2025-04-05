import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface GroceryItemProps {
  item: {
    id: string;
    name: string;
    quantity: number;
    checked: boolean;
  };
  onUpdateQuantity: (change: number) => void;
  onToggleChecked: () => void;
  onDelete: () => void;
}

const GroceryItem: React.FC<GroceryItemProps> = ({ 
  item, 
  onUpdateQuantity, 
  onToggleChecked, 
  onDelete 
}) => {
  return (
    <View style={[styles.container, item.checked && styles.checkedContainer]}>
      {/* Checkbox */}
      <Pressable 
        style={styles.checkbox} 
        onPress={onToggleChecked}
        hitSlop={10}
      >
        {item.checked ? (
          <Ionicons name="checkbox" size={24} color="#D98324" />
        ) : (
          <Ionicons name="square-outline" size={24} color="#333" />
        )}
      </Pressable>
      
      {/* Item name */}
      <Text style={[
        styles.itemText, 
        item.checked && styles.checkedText
      ]}>
        {item.name}
      </Text>
      
      {/* Quantity controls */}
      <View style={styles.quantityContainer}>
        <Pressable 
          style={styles.quantityButton} 
          onPress={() => onUpdateQuantity(-1)}
        >
          <Text style={styles.quantityButtonText}>−</Text>
        </Pressable>
        
        <Text style={styles.quantityText}>{item.quantity}</Text>
        
        <Pressable 
          style={styles.quantityButton} 
          onPress={() => onUpdateQuantity(1)}
        >
          <Text style={styles.quantityButtonText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  checkedContainer: {
    backgroundColor: '#f9f9f9',
    opacity: 0.7,
  },
  checkbox: {
    marginRight: 12,
  },
  itemText: {
    flex: 1,
    fontSize: 16,
  },
  checkedText: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4ead5',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 18,
    color: '#D98324',
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 16,
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
});

export default GroceryItem;