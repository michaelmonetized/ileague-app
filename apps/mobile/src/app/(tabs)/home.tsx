import { View, Text, ScrollView, Pressable, RefreshControl } from "react-native";
import { useState, useCallback } from "react";
import { useUser } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { api } from "@ileague/convex/convex/_generated/api";

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useUser();
  const currentUser = useQuery(api.users.getCurrentUser);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const greeting = getGreeting();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
        <View>
          <Text className="text-muted-foreground text-sm">{greeting}</Text>
          <Text className="text-xl font-bold text-foreground">
            {currentUser?.firstName ?? user?.firstName ?? "Welcome"}
          </Text>
        </View>
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={() => router.push("/(tabs)/notifications")}
            className="w-10 h-10 rounded-full bg-muted items-center justify-center"
          >
            <Ionicons name="notifications-outline" size={22} color="#0f172a" />
          </Pressable>
          <Pressable
            onPress={() => router.push("/(tabs)/profile")}
            className="w-10 h-10 rounded-full bg-primary items-center justify-center overflow-hidden"
          >
            {currentUser?.imageUrl ? (
              <Image
                source={{ uri: currentUser.imageUrl }}
                className="w-full h-full"
                contentFit="cover"
              />
            ) : (
              <Text className="text-white font-semibold">
                {(currentUser?.firstName?.[0] ?? "U").toUpperCase()}
              </Text>
            )}
          </Pressable>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-8"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Onboarding Card */}
        {!currentUser?.onboardingCompleted && (
          <Pressable
            onPress={() => router.push("/onboarding")}
            className="mx-4 mt-4 p-4 bg-primary/10 border border-primary/20 rounded-xl"
          >
            <View className="flex-row items-center gap-3">
              <View className="w-12 h-12 rounded-xl bg-primary items-center justify-center">
                <Ionicons name="sparkles" size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-foreground">
                  Complete Your Profile
                </Text>
                <Text className="text-sm text-muted-foreground">
                  Set up your profile to unlock all features
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#7c3aed" />
            </View>
          </Pressable>
        )}

        {/* Quick Actions */}
        <View className="px-4 mt-6">
          <Text className="text-lg font-semibold text-foreground mb-3">
            Quick Actions
          </Text>
          <View className="flex-row gap-3">
            <Pressable
              onPress={() => router.push("/(tabs)/explore")}
              className="flex-1 bg-muted rounded-xl p-4 active:opacity-80"
            >
              <Ionicons name="compass" size={28} color="#7c3aed" />
              <Text className="font-medium text-foreground mt-2">
                Discover
              </Text>
              <Text className="text-xs text-muted-foreground">
                Find creators
              </Text>
            </Pressable>
            <Pressable
              onPress={() => router.push("/(tabs)/leagues")}
              className="flex-1 bg-muted rounded-xl p-4 active:opacity-80"
            >
              <Ionicons name="trophy" size={28} color="#f59e0b" />
              <Text className="font-medium text-foreground mt-2">Leagues</Text>
              <Text className="text-xs text-muted-foreground">
                Join & compete
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Your Feed */}
        <View className="mt-8 px-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-semibold text-foreground">
              Your Feed
            </Text>
            <Pressable>
              <Text className="text-primary font-medium text-sm">See All</Text>
            </Pressable>
          </View>

          {/* Empty State */}
          <View className="bg-muted rounded-xl p-8 items-center">
            <Ionicons name="newspaper-outline" size={48} color="#64748b" />
            <Text className="font-semibold text-foreground mt-4 mb-1">
              No Posts Yet
            </Text>
            <Text className="text-muted-foreground text-center text-sm mb-4">
              Follow creators to see their posts in your feed
            </Text>
            <Pressable
              onPress={() => router.push("/(tabs)/explore")}
              className="bg-primary px-6 py-2.5 rounded-lg active:opacity-80"
            >
              <Text className="text-white font-medium">Discover Creators</Text>
            </Pressable>
          </View>
        </View>

        {/* Suggested Creators */}
        <View className="mt-8 px-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-semibold text-foreground">
              Suggested For You
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-3"
          >
            {[
              { name: "Alex Gaming", category: "Gaming", followers: "125K" },
              { name: "Sarah Fit", category: "Fitness", followers: "89K" },
              { name: "Marcus Music", category: "Music", followers: "201K" },
            ].map((creator, index) => (
              <View
                key={index}
                className="w-40 bg-card border border-border rounded-xl p-4"
              >
                <View className="w-14 h-14 rounded-full bg-primary/10 items-center justify-center mb-3">
                  <Text className="text-primary font-bold text-xl">
                    {creator.name[0]}
                  </Text>
                </View>
                <Text className="font-semibold text-foreground" numberOfLines={1}>
                  {creator.name}
                </Text>
                <Text className="text-xs text-muted-foreground">
                  {creator.category} • {creator.followers}
                </Text>
                <Pressable className="mt-3 bg-primary py-2 rounded-lg active:opacity-80">
                  <Text className="text-white text-center font-medium text-sm">
                    Follow
                  </Text>
                </Pressable>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
