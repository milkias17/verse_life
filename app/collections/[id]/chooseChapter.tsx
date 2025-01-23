import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { Stack, useLocalSearchParams } from "expo-router";
import { View, FlatList, TouchableOpacity, ScrollView } from "react-native";
import { Text } from "~/components/ui/text";
import { Link } from "expo-router";
import { db } from "~/lib/db";
import { bibleChapters } from "~/lib/db/schema";
import { getVerboseBookName } from "~/lib/utils";

export default function ChooseChapter() {
  const { id, bookdId, bookName } = useLocalSearchParams<{
    id: string;
    bookdId: string;
    bookName: string;
  }>();

  const { data } = useLiveQuery(
    db.query.bibleChapters.findMany({
      where: eq(bibleChapters.bookId, bookdId),
    }),
  );

  console.log({ bookName });
  return (
    <View className="flex-1 mt-5 px-2">
      {bookName && (
        <Stack.Screen options={{ title: getVerboseBookName(bookName) }} />
      )}
      <ScrollView>
        <View className="flex-row flex-wrap gap-4">
          {data.map((item) => (
            <Link
              href={`/collections/${id}/chooseVerse?bookdId=${bookdId}&bookName=${bookName}&chapterId=${item.id}&chapterNumber=${item.chapterNumber}`}
              asChild
              key={item.id}
            >
              <TouchableOpacity>
                <View className="p-4 bg-secondary rounded-lg">
                  <Text className="text-secondary-foreground text-lg font-bold">
                    {item.chapterNumber}
                  </Text>
                </View>
              </TouchableOpacity>
            </Link>
          ))}
        </View>
      </ScrollView>
      {/* <FlatList */}
      {/*   data={data} */}
      {/*   keyExtractor={(item) => item.id} */}
      {/*   renderItem={({ item }) => ( */}
      {/*     <Link */}
      {/*       href={`/collections/${id}/chooseVerse?bookdId=${bookdId}&chapterId=${item.id}`} */}
      {/*       asChild */}
      {/*     > */}
      {/*       <TouchableOpacity> */}
      {/*         <View className="p-4 m-2 bg-secondary rounded-lg"> */}
      {/*           <Text className="text-secondary-foreground text-lg font-bold"> */}
      {/*             {item.chapterNumber} */}
      {/*           </Text> */}
      {/*         </View> */}
      {/*       </TouchableOpacity> */}
      {/*     </Link> */}
      {/*   )} */}
      {/* /> */}
    </View>
  );
}
