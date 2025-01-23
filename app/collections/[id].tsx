import { useQuery, useQueryClient } from "@tanstack/react-query";
import AntDesign from '@expo/vector-icons/AntDesign';
import { Link, useRouter } from "expo-router";
import { sql, eq, type InferSelectModel } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useLocalSearchParams, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { db } from "~/lib/db";
import { cards, collections } from "~/lib/db/schema";
import Verse from "~/components/Verse";

type Card = InferSelectModel<typeof cards>;
type ReviewProp = {
  cards: Card[];
};
function useReview(dbCollection: ReviewProp | null, onReviewEnd: () => void) {
  const [allCards, setAllCards] = useState<Card[]>(dbCollection?.cards ?? []);
  const [secondPhaseCards, setSecondPhaseCards] = useState<Card[]>([]);
  const [currentCard, setCurrentCard] = useState<number>(0);
  const [currentVerse, setCurrentVerse] = useState<string>("");
  const [isSecondPhase, setIsSecondPhase] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (dbCollection == null) {
      return;
    }

    setAllCards(dbCollection.cards);
  }, [dbCollection]);

  useEffect(() => {
    if (!isSecondPhase) {
      setCurrentVerse(allCards[currentCard]?.verseId ?? null);
    } else {
      setCurrentVerse(secondPhaseCards[currentCard]?.verseId ?? null);
    }
  }, [currentCard, allCards, secondPhaseCards, isSecondPhase]);

  useEffect(() => {
    if (isSecondPhase && secondPhaseCards.length == 0) {
      setIsSecondPhase(false);
      (async () => handleReviewEnd())();
    }
  }, [isSecondPhase, secondPhaseCards]);

  function updateCard(quality: number) {
    if (quality <= 3) {
      setSecondPhaseCards((cards) => [...cards, allCards[currentCard]]);
    }

    if (quality < 3) {
      setAllCards((cards) => {
        return cards.map((card) => {
          if (card.id !== cards[currentCard].id) {
            return card;
          }
          return {
            ...card,
            repetitionNumber: 0,
            interval: 1,
          };
        });
      });
      return;
    }

    const tmpCurCard = allCards[currentCard];
    if (tmpCurCard.repetitionNumber === 0) {
      tmpCurCard.interval = 1;
    } else if (tmpCurCard.repetitionNumber === 1) {
      tmpCurCard.interval = 6;
    } else {
      tmpCurCard.interval = Math.round(
        tmpCurCard.interval * tmpCurCard.easeFactor,
      );
    }
    tmpCurCard.repetitionNumber += 1;
    tmpCurCard.easeFactor += 0.1 - 5 * quality * (0.08 + (5 - quality) * 0.02);
    if (tmpCurCard.easeFactor < 1.3) {
      tmpCurCard.easeFactor = 1.3;
    }

    setAllCards((cards) => {
      return cards.map((card) => {
        if (card.id != tmpCurCard.id) {
          return card;
        }
        return tmpCurCard;
      });
    });
  }

  function handleSecondPhaseUpdate(quality: number) {
    if (quality < 0 || quality > 5) {
      throw new Error("Quality must be between 0 and 5");
    }

    if (quality >= 4) {
      setSecondPhaseCards((cards) => {
        return cards.filter(
          (card) => card.id != secondPhaseCards[currentCard].id,
        );
      });
    }
  }

  async function handleReviewEnd() {
    const promises = [];
    const now = new Date();
    for (const card of allCards) {
      promises.push(
        db
          .update(cards)
          .set({
            repetitionNumber: card.repetitionNumber,
            interval: card.interval,
            easeFactor: card.easeFactor,
            lastReviewDate: now,
          })
          .where(eq(cards.id, card.id)),
      );
    }
    try {
      await Promise.all(promises);
      await queryClient.invalidateQueries({
        queryKey: ["collections"],
      });
    } catch (e) {
      console.error(e);
    }
    console.log("Cards updated: ", JSON.stringify(allCards, null, 2));
    onReviewEnd();
  }

  return {
    nextCard: async (quality: number) => {
      if (quality < 0 || quality > 5) {
        throw new Error("Quality must be between 0 and 5");
      }

      if (!isSecondPhase) {
        updateCard(quality);
        if (currentCard === allCards.length - 1) {
          if (secondPhaseCards.length === 0) {
            await handleReviewEnd();
            return;
          }

          setIsSecondPhase(true);
          setCurrentCard(0);
        } else {
          setCurrentCard((currentCard) => currentCard + 1);
        }
        return;
      }

      handleSecondPhaseUpdate(quality);
      if (secondPhaseCards.length == 0) {
        setIsSecondPhase(false);
        await handleReviewEnd();
      }
    },
    currentVerse,
  };
}

async function resetCollection(collectionId: string) {
  const x = await db
    .update(cards)
    .set({
      easeFactor: 2.5,
      interval: 0,
      repetitionNumber: 0,
      lastReviewDate: new Date(),
    })
    .where(eq(cards.collectionId, collectionId));
  console.log("DONE: ", x);
}

export default function CollectionReview() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [showAnswer, setShowAnswer] = useState(false);
  const router = useRouter();
  const [reviewEnd, setReviewEnd] = useState(false);
  const queryClient = useQueryClient();

  const { data: cardCount } = useLiveQuery(
    db.query.cards.findMany({
      columns: {
        id: true,
      },
      where: eq(cards.collectionId, id),
    }),
  );
  const { data, isLoading, isSuccess, refetch } = useQuery({
    queryKey: ["collections", id],
    queryFn: async () => {
      const res = await db.query.collections.findFirst({
        where: eq(collections.id, id),
        with: {
          cards: {
            where: sql`unixepoch(date(last_review_date, 'unixepoch', '+' || ${cards.interval} || ' days')) - unixepoch(date('now')) <= 0`,
            with: {
              verse: {
                with: {
                  translations: true,
                  chapter: {
                    with: {
                      book: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
      return res;
    },
    refetchOnMount: true,
  });

  const { nextCard, currentVerse } = useReview(
    isSuccess && data != null ? data : null,
    () => setReviewEnd(true),
  );

  function getVerseRef(verseId: string) {
    const card = data?.cards.find((card) => card.verseId === verseId);
    if (!card) {
      return "";
    }
    return `${card.verse.chapter.book.name} ${card.verse.chapter.chapterNumber}:${card.verse.verseNumber}`;
  }

  function getVerseText(verseId: string) {
    const card = data?.cards.find((card) => card.verseId === verseId);
    if (!card) {
      throw new Error("Verse not found");
    }
    return card.verse.translations[0].text;
  }

  if (isLoading) {
    return (
      <View className="flex-1">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (data?.cards.length === 0 && cardCount.length === 0) {
    return (
      <View className="flex-1 items-center justify-center gap-4">
        <Text className="font-bold text-2xl">No cards in this collection</Text>
        <Link
          className="bg-green-400 p-3 rounded-md"
          href={`/collections/${data?.id}/chooseBook`}
        >
          <Text className="text-black">Add To Collection</Text>
        </Link>
      </View>
    );
  }

  if (reviewEnd || data?.cards.length == 0) {
    return (
      <View className="flex-1 items-center justify-center gap-4">
        <Text className="font-bold text-2xl">Review Complete</Text>
        <Button
          onPress={async () => {
            await resetCollection(id);
            refetch();
            await queryClient.invalidateQueries({
              queryKey: ["collections"],
            });
          }}
        >
          <Text>Reset Collection</Text>
        </Button>
        <Link href="/collections" className="bg-green-400 p-4 rounded-md">
          <Text className="text-white">End Review</Text>
        </Link>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <Stack.Screen
        options={{
          headerRight: () => (
            <TouchableOpacity
              onPressIn={() => {
                router.push(`/collections/${data?.id}/chooseBook`);
              }}
            >
              <AntDesign name="plus" size={24} color="black" />
            </TouchableOpacity>
          ),
        }}
      />
      <View className="flex-1 justify-center items-center p-8 gap-2">
        <Text className="text-4xl text-center">
          {getVerseRef(currentVerse)}
        </Text>
        {showAnswer && (
          <Verse
            className="text-center"
            verseText={getVerseText(currentVerse)}
          />
        )}
      </View>

      {!showAnswer && (
        <Button onPress={() => setShowAnswer(true)}>
          <Text>Show Answer</Text>
        </Button>
      )}
      {showAnswer && (
        <View className="flex-row gap-1 p-4">
          {[0, 1, 2, 3, 4, 5].map((quality) => (
            <Button
              className="flex-1 rounded-none"
              variant="secondary"
              key={quality}
              onPress={async () => {
                setShowAnswer(false);
                await nextCard(quality);
              }}
            >
              <Text>{quality}</Text>
            </Button>
          ))}
        </View>
      )}
    </View>
  );
}
