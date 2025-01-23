import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  TextInput,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { db } from "~/lib/db";
import { cards, collections } from "~/lib/db/schema";
import { Button } from "~/components/ui/button";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Card, CardHeader, CardTitle } from "~/components/ui/card";
import { useQueryClient } from "@tanstack/react-query";

type ModalProps = {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
};

function AddToColletionModal() {
  const { data: dbCollections } = useLiveQuery(db.query.collections.findMany());
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionModalVisible, setNewCollectionModalVisible] =
    useState(false);
  const { verseId, verseText } = useLocalSearchParams<{
    verseId: string;
    verseText: string;
  }>();
  const router = useRouter();
  const queryClient = useQueryClient();

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
    })
  }

  async function addToCollection(collectionId: string) {
    await db.insert(cards).values({
      collectionId: collectionId,
      verseId: verseId,
    });
    router.back();
  }

  return (
    <View className="flex-1">
      <View style={styles.container}>
        <View className="flex-1 gap-4">
          <Text className="font-bold text-2xl">Collections</Text>
          {dbCollections.length > 0 ? (
            <FlatList
              data={dbCollections}
              keyExtractor={(item) => item.id}
              ItemSeparatorComponent={() => <View className="h-2"></View>}
              renderItem={({ item }) => {
                return (
                  <TouchableOpacity
                    onPress={() => addToCollection(item.id)}
                    className="p-4 m-2 bg-secondary rounded-lg"
                  >
                    <Text className="text-secondary-foreground text-lg font-bold">
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          ) : (
            <Text>No Collections</Text>
          )}

          <Modal
            animationType="slide"
            transparent={false}
            visible={newCollectionModalVisible}
            onRequestClose={() => setNewCollectionModalVisible(false)}
          >
            <View className="flex-1 justify-center p-8 gap-4">
              <View className="w-full">
                <Label nativeID="collectionName">Collection Name</Label>
                <Input
                  placeholder="Enter Collection"
                  onChangeText={setNewCollectionName}
                  value={newCollectionName}
                />
              </View>
              <Button
                onPress={() => {
                  createCollection();

                }}
              >
                <Text>Create New Collection</Text>
              </Button>
            </View>
          </Modal>
        </View>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Text>Create New Collection</Text>
            </Button>
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
        {/* <Button onPress={() => setNewCollectionModalVisible(true)}> */}
        {/*   <Text>Create New Collection</Text> */}
        {/* </Button> */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    gap: 10,
  },
});

export default AddToColletionModal;
