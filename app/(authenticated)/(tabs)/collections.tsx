import { useQuery, useQueryClient } from "@tanstack/react-query";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Stack } from "expo-router";
import { sql, eq, and } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Badge } from "~/components/ui/badge";
import { Card, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import { db } from "~/lib/db";
import { cards, collections } from "~/lib/db/schema";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";

export default function Collections() {
  // const { data: dbCollections } = useLiveQuery(
  //   db.query.collections.findMany({
  //     with: {
  //       cards: {
  //         where: sql`date(last_review_date / 1000, 'unixepoch', '+' || ${cards.interval} || ' days') <= date('now') `,
  //       },
  //     },
  //   }),
  // );

  const [newCollectionName, setNewCollectionName] = useState("");
  const queryClient = useQueryClient();

  const { data, isPending } = useQuery({
    queryKey: ["collections"],
    queryFn: async () => {
      return await db
        .select({
          id: collections.id,
          name: collections.name,
          totalCardsCount: db.$count(
            cards,
            eq(cards.collectionId, collections.id),
          ),
          todaysCardsCount: db.$count(
            cards,
            and(
              eq(cards.collectionId, collections.id),
              sql`unixepoch(date(last_review_date, 'unixepoch', '+' || ${cards.interval} || ' days')) - unixepoch(date('now')) <= 0`,
            ),
          ),
        })
        .from(collections);
    },
  });

  async function createCollection() {
    if (newCollectionName === "") {
      Alert.alert("Error", "Collection name cannot be empty");
      return;
    }
    await db.insert(collections).values({
      name: newCollectionName,
    });
    setNewCollectionName("");
    await queryClient.invalidateQueries({
      queryKey: ["collections"],
    });
  }

  if (isPending) {
    return (
      <SafeAreaView className="flex-1 items-center">
        <ActivityIndicator size="large" color="#fff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 items-center">
      <Stack.Screen
        options={{
          headerRight: () => (
            <View className="mr-4 border-red-400">
              <Dialog>
                <DialogTrigger asChild>
                  <TouchableOpacity>
                    <AntDesign name="plus" size={24} color="#000" />
                  </TouchableOpacity>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Create New Collection</DialogTitle>
                  </DialogHeader>
                  <View className="gap-4">
                    <View>
                      <Label nativeID="collectionName">Collection Name</Label>
                      <Input
                        placeholder="Collection Name"
                        onChangeText={setNewCollectionName}
                        value={newCollectionName}
                      />
                    </View>
                  </View>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button
                        onPress={() => {
                          createCollection();
                        }}
                      >
                        <Text>Create</Text>
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </View>
          ),
        }}
      />
      <FlatList
        data={data}
        ItemSeparatorComponent={() => <View className="h-3" />}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Link href={`/collections/${item.id}`} asChild>
            <TouchableOpacity>
              <Card className="w-full max-w-sm">
                <CardHeader>
                  <CardTitle className="font-glamourBold text-center text-4xl">
                    {item.name}
                  </CardTitle>
                </CardHeader>
                <CardFooter className="flex-row justify-between">
                  <View>
                    <Text className="text-sm">Total Verses</Text>
                    <Badge variant="secondary">
                      <Text>{item.totalCardsCount}</Text>
                    </Badge>
                  </View>

                  <View>
                    <Text className="text-sm">Today's Verses</Text>
                    <Badge variant="default">
                      <Text>{item.todaysCardsCount}</Text>
                    </Badge>
                  </View>
                </CardFooter>
              </Card>
            </TouchableOpacity>
          </Link>
        )}
      />
    </SafeAreaView>
  );
}
