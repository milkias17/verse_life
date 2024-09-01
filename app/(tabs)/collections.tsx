import { Animated, ScrollView, View } from "react-native";
import {
  FadeInUp,
  FadeOutDown,
  LayoutAnimationConfig,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { Text } from "~/components/ui/text";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { Info } from "~/lib/icons/Info";

export default function Collections() {
  return (
    <SafeAreaView className="flex-1 items-center">
      <ScrollView>
        <Card className="w-full max-w-sm p-6 rounded-2xl">
          <CardHeader className="items-center">
            <CardTitle className="pb-2 text-center">Love</CardTitle>
          </CardHeader>
          <CardContent>
            <View className="flex-row justify-around gap-3">
              <View className="items-center">
                <Text className="text-sm text-muted-foreground">Dimension</Text>
                <Text className="text-xl font-semibold">C-137</Text>
              </View>
              <View className="items-center">
                <Text className="text-sm text-muted-foreground">Age</Text>
                <Text className="text-xl font-semibold">70</Text>
              </View>
              <View className="items-center">
                <Text className="text-sm text-muted-foreground">Species</Text>
                <Text className="text-xl font-semibold">Human</Text>
              </View>
            </View>
          </CardContent>
          <CardFooter className="flex-col gap-3 pb-0">
            <View className="flex-row items-center overflow-hidden">
              <Text className="text-sm text-muted-foreground">
                Productivity:
              </Text>
              <LayoutAnimationConfig skipEntering>
                <Animated.View
                  key={5}
                  // entering={FadeInUp}
                  // exiting={FadeOutDown}
                  className="w-11 items-center"
                >
                  <Text className="text-sm font-bold text-sky-600">{5}%</Text>
                </Animated.View>
              </LayoutAnimationConfig>
            </View>
            <Progress
              value={5}
              className="h-2"
              indicatorClassName="bg-sky-600"
            />
            <View />
            <Button
              variant="outline"
              className="shadow shadow-foreground/5"
              onPress={() => console.log("update")}
            >
              <Text>Update</Text>
            </Button>
          </CardFooter>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
