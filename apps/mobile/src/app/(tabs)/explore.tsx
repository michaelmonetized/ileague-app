import { View, Text, ScrollView, TextInput, Pressable } from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { api } from "@ileague/convex/convex/_generated/api";

const CATEGORIES = [
  { id: "all", name: "All", icon: "apps" },
  { id: "gaming", name: "Gaming", icon: "game-controller" },
  { id: "sports", name: "Sports", icon: "football" },
  { id: "music", name: "Music", icon: "musical-notes" },
  { id: "fitness", name: "Fitness", icon: "fitness" },
  { id: "art", name: "Art", icon: "color-palette" },
  { id: "tech", name: "Tech", icon: "hardware-chip" },
];

export default function ExploreScreen() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const influencers = useQuery(api.users.getInfluencers, {
    category: selectedCategory === "all" ? undefined : selectedCategory,
    limit: 20,
  });

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="px-4 py-3">
        <Text className="text-2xl font-bold text-foreground">Explore</Text>
        <Text className="text-muted-foreground">
          Discover amazing creators
        </Text>
      </View>

      {/* Search Bar */}
      <View className="px-4 pb-3">
        <View className="flex-row items-center bg-muted rounded-xl px-4">
          <Ionicons name="search" size={20} color="#64748b" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search creators..."
            className="flex-1 py-3 ml-2 text-foreground"
            placeholderTextColor="#64748b"
          />
        </View>
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="px-4 gap-2 pb-3"
      >
        {CATEGORIES.map((category) => (
          <Pressable
            key={category.id}
            onPress={() => setSelectedCategory(category.id)}
            className={`flex-row items-center gap-2 px-4 py-2 rounded-full ${
              selectedCategory === category.id
                ? "bg-primary"
                : "bg-muted"
            }`}
          >
            <Ionicons
              name={category.icon as any}
              size={18}
              color={selectedCategory === category.id ? "#ffffff" : "#64748b"}
            />
            <Text
              className={`font-medium ${
                selectedCategory === category.id
                  ? "text-white"
                  : "text-foreground"
              }`}
            >
              {category.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView className="flex-1" contentContainerClassName="px-4 pb-8">
        {/* Featured Section */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-foreground mb-3">
            Featured Creators
          </Text>

          {influencers && influencers.length > 0 ? (
            <View className="gap-3">
              {influencers.map(({ user, profile }) => (
                <Pressable
                  key={user._id}
                  className="flex-row items-center gap-3 p-3 bg-card border border-border rounded-xl active:opacity-80"
                >
                  <View className="w-14 h-14 rounded-full bg-primary/10 items-center justify-center">
                    <Text className="text-primary font-bold text-lg">
                      {profile.displayName[0]}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center gap-1">
                      <Text className="font-semibold text-foreground">
                        {profile.displayName}
                      </Text>
                      {user.isVerified && (
                        <Ionicons
                          name="checkmark-circle"
                          size={16}
                          color="#7c3aed"
                        />
                      )}
                    </View>
                    <Text className="text-sm text-muted-foreground">
                      @{user.username}
                    </Text>
                    <Text className="text-xs text-muted-foreground mt-0.5">
                      {profile.category} •{" "}
                      {formatNumber(profile.followerCount)} followers
                    </Text>
                  </View>
                  <Pressable className="bg-primary px-4 py-2 rounded-lg active:opacity-80">
                    <Text className="text-white font-medium text-sm">
                      Follow
                    </Text>
                  </Pressable>
                </Pressable>
              ))}
            </View>
          ) : (
            <View className="bg-muted rounded-xl p-8 items-center">
              <Ionicons name="people-outline" size={48} color="#64748b" />
              <Text className="font-semibold text-foreground mt-4 mb-1">
                No Creators Found
              </Text>
              <Text className="text-muted-foreground text-center text-sm">
                {selectedCategory !== "all"
                  ? "No creators in this category yet"
                  : "Be the first to become a creator!"}
              </Text>
            </View>
          )}
        </View>

        {/* Categories Grid */}
        <View>
          <Text className="text-lg font-semibold text-foreground mb-3">
            Browse Categories
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {CATEGORIES.filter((c) => c.id !== "all").map((category) => (
              <Pressable
                key={category.id}
                onPress={() => setSelectedCategory(category.id)}
                className="w-[48%] bg-muted rounded-xl p-4 active:opacity-80"
              >
                <Ionicons
                  name={category.icon as any}
                  size={28}
                  color="#7c3aed"
                />
                <Text className="font-semibold text-foreground mt-2">
                  {category.name}
                </Text>
              </Pressable>
            ))}
          </View>
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
