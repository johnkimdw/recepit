import { Tabs } from "expo-router";
import React from "react";
import { Platform, View, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { HapticTab } from "@/components/HapticTab";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: undefined,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
            height: 80,
            backgroundColor: "white",
            borderTopWidth: 0,
            paddingBottom: 15,
          },
          default: {
            height: 80,
            backgroundColor: "white",
            borderTopWidth: 0,
            paddingBottom: 15,
          },
        }),
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 10,
          marginTop: -5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Cards",
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name="cards-outline"
                size={24}
                color={focused ? "#D98324" : "gray"}
              />
            </View>
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={{ color: focused ? "#D98324" : "gray", fontSize: 10 }}>
              Swipe
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="browse"
        options={{
          title: "Browse",
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <Ionicons
                name="grid-outline"
                size={22}
                color={focused ? "#D98324" : "gray"}
              />
            </View>
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={{ color: focused ? "#D98324" : "gray", fontSize: 10 }}>
              Browse
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: "Create",
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <View style={styles.addButtonContainer}>
                <Ionicons name="add" size={30} color="white" />
              </View>
            </View>
          ),
          tabBarLabel: () => null
        }}
      />
      <Tabs.Screen
        name="collections"
        options={{
          title: "Collections",
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <FontAwesome
                name="bookmark-o"
                size={24}
                color={focused ? "#D98324" : "gray"}
              />
            </View>
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={{ color: focused ? "#D98324" : "gray", fontSize: 10 }}>
              Collections
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <Ionicons
                name="person-outline"
                size={24}
                color={focused ? "#D98324" : "gray"}
              />
            </View>
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={{ color: focused ? "#D98324" : "gray", fontSize: 10 }}>
              Profile
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="grocery-list" 
        options={{
          title: "Grocery List",
          href: null,
          headerShown: false,
        }}
      />


    </Tabs>

    
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    marginTop: 5,
  },
  addButtonContainer: {
    backgroundColor: "#D98324",
    width: 44,
    height: 35,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#D98324",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    marginTop: 10,
  },
});
