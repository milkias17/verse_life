import "~/global.css";

import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import migrations from "../drizzle/migrations";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DefaultTheme,
  ThemeProvider,
  type Theme,
} from "@react-navigation/native";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { Platform, View, Text, ActivityIndicator } from "react-native";
import { NAV_THEME } from "~/lib/constants";
import { useColorScheme } from "~/lib/useColorScheme";
import { PortalHost } from "@rn-primitives/portal";
import { ThemeToggle } from "~/components/ThemeToggle";
import { setAndroidNavigationBar } from "~/lib/android-navigation-bar";
import {
  useFonts,
  DancingScript_400Regular,
  DancingScript_500Medium,
  DancingScript_600SemiBold,
  DancingScript_700Bold,
} from "@expo-google-fonts/dancing-script";
import {
  Inter_100Thin,
  Inter_200ExtraLight,
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  Inter_900Black,
} from "@expo-google-fonts/inter";
import { db, expoDb } from "~/lib/db";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const LIGHT_THEME: Theme = {
  dark: false,
  colors: NAV_THEME.light,
  fonts: {
    ...DefaultTheme.fonts,
  },
};
const DARK_THEME: Theme = {
  dark: true,
  colors: NAV_THEME.dark,
  fonts: {
    ...DefaultTheme.fonts,
  },
};

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

// Prevent the splash screen from auto-hiding before getting the color scheme.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const { colorScheme, setColorScheme, isDarkColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);
  let [fontsLoaded] = useFonts({
    DancingScript_400Regular,
    DancingScript_500Medium,
    DancingScript_600SemiBold,
    DancingScript_700Bold,
    Inter_100Thin,
    Inter_200ExtraLight,
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
  });
  const [isCopyingDb, setIsCopyingDb] = React.useState(false);

  const { success, error } = useMigrations(db, migrations);

  useDrizzleStudio(expoDb);

  React.useEffect(() => {
    (async () => {
      const theme = await AsyncStorage.getItem("theme");
      if (Platform.OS === "web") {
        // Adds the background color to the html element to prevent white background on overscroll.
        document.documentElement.classList.add("bg-background");
      }
      if (!theme) {
        AsyncStorage.setItem("theme", colorScheme);
        setIsColorSchemeLoaded(true);
        return;
      }
      const colorTheme = theme === "dark" ? "dark" : "light";
      if (colorTheme !== colorScheme) {
        setColorScheme(colorTheme);
        setAndroidNavigationBar(colorTheme);
        setIsColorSchemeLoaded(true);
        return;
      }
      setAndroidNavigationBar(colorTheme);
      setIsColorSchemeLoaded(true);
    })().finally(() => {
      SplashScreen.hideAsync();
    });
  }, []);

  // React.useEffect(() => {
  //   setIsCopyingDb(true);
  //   copyDatabase()
  //     .catch((e) => console.error(e))
  //     .finally(() => setIsCopyingDb(false));
  // }, []);

  if (!isColorSchemeLoaded) {
    return null;
  }

  if (!fontsLoaded) {
    return null;
  }

  if (error) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Migration Error: {error.message}</Text>
      </View>
    );
  }

  if (!success) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Migration is in progress....</Text>
      </View>
    );
  }

  if (isCopyingDb) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          gap: 30,
        }}
      >
        <Text>Initializing App</Text>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    // <ThemeProvider value={colorScheme === "dark" ? LIGHT_THEME : DARK_THEME}>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={LIGHT_THEME}>
        <QueryClientProvider client={queryClient}></QueryClientProvider>
        <StatusBar style={isDarkColorScheme ? "dark" : "light"} />
        <Stack>
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
              // title: "Starter Base",
              // headerRight: () => <ThemeToggle />,
            }}
          />
          <Stack.Screen
            name="collections/[id]"
            options={{ title: "Review Collection", headerBackVisible: false }}
          />

          <Stack.Screen
            name="collections/[id]/chooseBook"
            options={{ title: "Choose Book of the Bible" }}
          />
          <Stack.Screen
            name="collections/[id]/chooseChapter"
            options={{ title: "Choose Chapter" }}
          />
          <Stack.Screen
            name="collections/[id]/chooseVerse"
            options={{ title: "Choose Verse" }}
          />

          <Stack.Screen
            name="addToCollection"
            options={{
              presentation: "modal",
              headerTitle: "Add To Collection",
            }}
          />
        </Stack>
        <PortalHost />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
