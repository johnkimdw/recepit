import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SuggestionItemProps {
  item: {
    id: string;
    name: string;
  };
  onAdd: () => void;
}

const SuggestionItem: React.FC<SuggestionItemProps> = ({ item, onAdd }) => {
  return (
    <Pressable 
      style={styles.container}
      onPress={onAdd}
    >
      <Text style={styles.itemText}>{item.name}</Text>
      <Ionicons name="add-circle-outline" size={24} color="#D98324" />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  itemText: {
    fontSize: 16,
  },
});

export default SuggestionItem;