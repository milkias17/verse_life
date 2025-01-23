import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs, useNavigation } from "expo-router";
import { useEffect } from "react";
import { useColorScheme } from "~/lib/useColorScheme";

export default function TabLayout() {
  const { colors } = useColorScheme();

  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "blue" }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="home" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="collections"
        options={{
          title: "Collections",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="folder" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
