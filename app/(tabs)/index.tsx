import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
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

  return (
    <View className="flex-1 items-center">
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
