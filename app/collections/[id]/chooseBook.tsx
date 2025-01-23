import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { FlatList, ScrollView, TouchableOpacity, View } from "react-native";
import { Link, useLocalSearchParams } from "expo-router";
import { Text } from "~/components/ui/text";
import { db } from "~/lib/db";

export default function ChooseBook() {
  const { data } = useLiveQuery(db.query.books.findMany());
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View className="flex-1 mt-5 px-2">
      <ScrollView>
        <View className="flex-row flex-wrap gap-4">
          {data.map((item) => (
            <Link
              href={`/collections/${id}/chooseChapter?bookdId=${item.id}&bookName=${item.name}`}
              asChild
              key={item.id}
            >
              <TouchableOpacity>
                <View className="p-4 bg-secondary rounded-lg">
                  <Text className="text-secondary-foreground text-lg font-bold">
                    {item.name}
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
      {/*   horizontal={true} */}
      {/*   numColumns={4} */}
      {/*   renderItem={({ item }) => ( */}
      {/*     <Link */}
      {/*       href={`/collections/${id}/chooseChapter?bookdId=${item.id}`} */}
      {/*       asChild */}
      {/*     > */}
      {/*       <TouchableOpacity> */}
      {/*         <View className="p-4 m-2 bg-secondary rounded-lg"> */}
      {/*           <Text className="text-secondary-foreground text-lg font-bold"> */}
      {/*             {getVerboseBookName(item.name)} */}
      {/*           </Text> */}
      {/*         </View> */}
      {/*       </TouchableOpacity> */}
      {/*     </Link> */}
      {/*   )} */}
      {/* /> */}
    </View>
  );
}
