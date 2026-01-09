import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function LeaguesScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <View>
          <Text className="text-2xl font-bold text-foreground">Leagues</Text>
          <Text className="text-muted-foreground">Compete and win</Text>
        </View>
        <Pressable className="bg-primary px-4 py-2 rounded-lg flex-row items-center gap-2 active:opacity-80">
          <Ionicons name="add" size={20} color="white" />
          <Text className="text-white font-medium">Create</Text>
        </Pressable>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="px-4 pb-8">
        {/* Featured Leagues */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-foreground mb-3">
            🔥 Featured Leagues
          </Text>

          {[
            {
              name: "Ultimate Gaming Championship",
              category: "Gaming",
              members: 1234,
              prize: "$5,000",
              type: "competition",
            },
            {
              name: "30-Day Fitness Challenge",
              category: "Fitness",
              members: 567,
              type: "challenge",
            },
            {
              name: "Music Producers Community",
              category: "Music",
              members: 2890,
              type: "community",
            },
          ].map((league, index) => (
            <Pressable
              key={index}
              className="bg-card border border-border rounded-xl p-4 mb-3 active:opacity-80"
            >
              <View className="flex-row items-center justify-between mb-2">
                <View
                  className={`px-2 py-1 rounded ${
                    league.type === "competition"
                      ? "bg-error/10"
                      : league.type === "challenge"
                      ? "bg-warning/10"
                      : "bg-primary/10"
                  }`}
                >
                  <Text
                    className={`text-xs font-medium capitalize ${
                      league.type === "competition"
                        ? "text-error"
                        : league.type === "challenge"
                        ? "text-warning"
                        : "text-primary"
                    }`}
                  >
                    {league.type}
                  </Text>
                </View>
                {league.prize && (
                  <View className="flex-row items-center gap-1 bg-success/10 px-2 py-1 rounded">
                    <Ionicons name="trophy" size={12} color="#22c55e" />
                    <Text className="text-xs font-medium text-success">
                      {league.prize}
                    </Text>
                  </View>
                )}
              </View>

              <Text className="font-semibold text-lg text-foreground mb-1">
                {league.name}
              </Text>
              <Text className="text-sm text-muted-foreground mb-3">
                {league.category} • {formatNumber(league.members)} members
              </Text>

              <Pressable className="bg-primary py-2.5 rounded-lg active:opacity-80">
                <Text className="text-white text-center font-medium">
                  Join League
                </Text>
              </Pressable>
            </Pressable>
          ))}
        </View>

        {/* Your Leagues */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-foreground mb-3">
            Your Leagues
          </Text>

          <View className="bg-muted rounded-xl p-8 items-center">
            <Ionicons name="trophy-outline" size={48} color="#64748b" />
            <Text className="font-semibold text-foreground mt-4 mb-1">
              No Leagues Yet
            </Text>
            <Text className="text-muted-foreground text-center text-sm mb-4">
              Join a league to start competing!
            </Text>
          </View>
        </View>

        {/* Browse by Type */}
        <View>
          <Text className="text-lg font-semibold text-foreground mb-3">
            Browse by Type
          </Text>
          <View className="flex-row gap-3">
            <Pressable className="flex-1 bg-error/10 rounded-xl p-4 active:opacity-80">
              <Ionicons name="flash" size={24} color="#ef4444" />
              <Text className="font-semibold text-foreground mt-2">
                Competitions
              </Text>
              <Text className="text-xs text-muted-foreground">
                Compete to win
              </Text>
            </Pressable>
            <Pressable className="flex-1 bg-warning/10 rounded-xl p-4 active:opacity-80">
              <Ionicons name="fitness" size={24} color="#f59e0b" />
              <Text className="font-semibold text-foreground mt-2">
                Challenges
              </Text>
              <Text className="text-xs text-muted-foreground">
                Test yourself
              </Text>
            </Pressable>
          </View>
          <Pressable className="bg-primary/10 rounded-xl p-4 mt-3 active:opacity-80">
            <Ionicons name="people" size={24} color="#7c3aed" />
            <Text className="font-semibold text-foreground mt-2">
              Communities
            </Text>
            <Text className="text-xs text-muted-foreground">
              Connect with others
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toString();
}
