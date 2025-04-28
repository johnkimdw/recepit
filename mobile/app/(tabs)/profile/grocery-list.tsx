import React from 'react';
import { StatusBar } from 'expo-status-bar';
import GroceryListScreen from '@/components/GroceryListScreen';

export default function GroceryList() {
  return (
    <>
      <StatusBar style="dark" />
      <GroceryListScreen />
    </>
  );
}