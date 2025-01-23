import { StyleSheet } from "react-native";
import { Text } from "~/components/ui/text";

function trimHashAndSpaces(str: string) {
  return str.replace(/^[#\s]+|[#\s]+$/g, "");
}

type VerseProps = {
  verseText: string;
  className?: string;
};

const Verse: React.FC<VerseProps> = ({ verseText, className }) => {
  return <Text className={className}>{trimHashAndSpaces(verseText)}</Text>;
};

const styles = StyleSheet.create({
  italic: {
    fontStyle: "italic",
  },
});

export default Verse;
