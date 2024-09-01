import { View } from "react-native";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardFooter,
  CardContent,
} from "~/components/ui/card";
import { Text } from "~/components/ui/text";

export default function Home() {
  return (
    <View className="flex-1 items-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="font-glamourBold text-center text-4xl">
            Verse of The Day
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Text className="">
            For God so loved the world, that he gave his only begotten Son, that
            whosoever believeth in him should not perish, but have everlasting
            life.
          </Text>
        </CardContent>
        <CardFooter className="flex-row justify-between">
          <Text className="bg-accent p-2 rounded-lg">John 3:16</Text>
          <Button size="sm">
            <Text>Add To Collection</Text>
          </Button>
        </CardFooter>
      </Card>
    </View>
  );
}
