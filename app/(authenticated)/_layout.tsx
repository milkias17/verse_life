import { ActivityIndicator, Text, View } from "react-native";
import { Redirect, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { getUser } from "~/lib/utils";

export default function AppLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    getUser().then((user) => {
      console.log({ user });
      setUser(user);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  }

  // Only require authentication within the (app) group's layout as users
  // need to be able to access the (auth) group and sign in again.
  if (!user) {
    // On web, static rendering will stop here as the user is not authenticated
    // in the headless Node process that the pages are rendered in.
    return <Redirect href="/auth/login" />;
  }

  // This layout can be deferred because it's not the root layout.
  return <Stack />;
}
