import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQueryClient } from "@tanstack/react-query";
import { desc } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { Link, Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, View } from "react-native";
import Verse from "~/components/Verse";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import { db } from "~/lib/db";
import { cards } from "~/lib/db/schema";
import { pull, push } from "~/lib/sync";
import { getVerse } from "~/lib/utils";

type Verse = {
  verseText: string;
  verseId: string;
};
export default function Home() {
  const [verse, setVerse] = useState<Verse | null>(null);
  useEffect(() => {
    const verse = getVerse({
      language: "en",
      version: "KJV",
      book: "John",
      chapter: "3",
      verse: "16",
    })
      .then((v) => setVerse(v ?? null))
      .catch(console.error);
  }, []);

  const { data: recentVerse } = useLiveQuery(
    db.query.cards.findFirst({
      orderBy: [desc(cards.lastReviewDate)],
      with: {
        collection: true,
      },
    }),
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  async function handleLogout() {
    await AsyncStorage.setItem("session", "");
    router.replace("/auth/login");
  }

  async function handleSync() {
    setIsSyncing(true);
    push()
      .then((v) => {
        if (!v) {
          Alert.alert("Sync Failed");
          return;
        }
        pull().catch((e) => {
          console.error(e);
          Alert.alert("Sync Failed");
        });
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {
        setIsSyncing(false);
      });
    // pull()
    //   .then(() => {
    //     console.log("synced");
    //   })
    //   .catch((e) => console.error(e))
    //   .finally(() => {
    //     setIsSyncing(false);
    //   });
    queryClient.invalidateQueries();
  }

  return (
    <View className="flex-1 items-center">
      <Stack.Screen
        options={{
          headerRight: () => (
            <View className="mr-4 flex-row gap-2">
              <Button onPress={handleLogout} className="bg-red-400" size="sm">
                <Text>Logout</Text>
              </Button>

              {/* <Button onPress={handleSync} size="sm"> */}
              {/*   {isSyncing ? <ActivityIndicator /> : null} */}
              {/*   <Text>Sync</Text> */}
              {/* </Button> */}
            </View>
          ),
        }}
      />
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="font-glamourBold text-center text-4xl">
            Verse of The Day
          </CardTitle>
        </CardHeader>
        <CardContent>
          {verse !== null ? (
            <Verse verseText={verse.verseText} />
          ) : (
            <ActivityIndicator />
          )}
        </CardContent>
        <CardFooter className="flex-row justify-between">
          <Text className="bg-accent p-2 rounded-lg">John 3:16</Text>

          <Link
            href={{
              pathname: "/addToCollection",
              params: {
                verseId: verse?.verseId,
                verseText: verse?.verseText,
              },
            }}
            asChild
          >
            <Button size="sm">
              <Text>Add To Collection</Text>
            </Button>
          </Link>
        </CardFooter>
      </Card>
      {/* <Card className="w-full max-w-sm"> */}
      {/*   <CardHeader> */}
      {/*     <CardTitle className="text-center text-2xl"> */}
      {/*       Recent Collection */}
      {/*     </CardTitle> */}
      {/*     <CardContent> */}
      {/*       <Text className="font-glamourBold text-4xl"> */}
      {/*         {recentVerse?.collection.name} */}
      {/*       </Text> */}
      {/*       <View></View> */}
      {/*     </CardContent> */}
      {/*   </CardHeader> */}
      {/* </Card> */}
    </View>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    padding: 10,
    // justifyContent: "center",
    // alignItems: "center",
    borderWidth: 1,
    borderColor: "black",
    gap: 10,
  },
});
