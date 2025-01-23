import { eq, and } from "drizzle-orm";
import { Text } from "~/components/ui/text";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Alert,
  FlatList,
  ToastAndroid,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { db } from "~/lib/db";
import { bibleVerses, cards } from "~/lib/db/schema";
import { useQueryClient } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { getVerboseBookName, getVerse } from "~/lib/utils";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";

export default function ChooseVerse() {
  const { id, bookName, chapterId, chapterNumber } = useLocalSearchParams<{
    id: string;
    bookdId: string;
    bookName: string;
    chapterId: string;
    chapterNumber: string;
  }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data } = useLiveQuery(
    db.query.bibleVerses.findMany({
      where: eq(bibleVerses.bibleChapterId, chapterId),
    }),
  );

  async function addVerse(verseId: string) {
    const card = await db.query.cards.findMany({
      columns: {
        id: true,
      },
      where: and(eq(cards.verseId, verseId), eq(cards.collectionId, id)),
    });
    if (card.length > 0) {
      Alert.alert("Error", "Card already exists");
      return;
    }

    try {
      await db.insert(cards).values({
        collectionId: id,
        verseId: verseId,
      });
      await queryClient.invalidateQueries({
        queryKey: ["collections"],
      });
      ToastAndroid.show("Added to collection", ToastAndroid.SHORT);
      router.dismissTo(`/collections/${id}`);
    } catch (e) {
      console.error("Error adding card", e);
      Alert.alert("Error", "Error adding card");
    }
  }

  return (
    <View className="flex-1 mt-5 px-2">
      {bookName && chapterNumber && (
        <Stack.Screen
          options={{
            title: `${getVerboseBookName(bookName)} ${chapterNumber}`,
          }}
        />
      )}
      <ScrollView>
        <View className="flex-row flex-wrap gap-4">
          {data.map((item) => (
            <AlertDialog key={item.id}>
              <AlertDialogTrigger>
                <View className="p-4 m-2 bg-secondary rounded-lg">
                  <Text className="text-secondary-foreground text-lg font-bold">
                    {item.verseNumber}
                  </Text>
                </View>
                {/* </TouchableOpacity> */}
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Are you sure you want to add this verse?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {bookName} {chapterNumber}:{item.verseNumber}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    onPress={() => router.push("/collections")}
                  >
                    <Text>Cancel</Text>
                  </AlertDialogCancel>
                  <AlertDialogAction onPress={() => addVerse(item.id)}>
                    <Text>Continue</Text>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
