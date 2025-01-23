import { useLocalSearchParams } from "expo-router";
import { Text } from "~/components/ui/text";

export default function AddVerse() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <Text>AddVerse {id}</Text>;
}
