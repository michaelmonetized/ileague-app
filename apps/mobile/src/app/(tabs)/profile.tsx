import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useUser, useClerk } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { Image } from "expo-image";
import { api } from "@ileague/convex/convex/_generated/api";

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useClerk();
  const currentUser = useQuery(api.users.getCurrentUser);

  const handleSignOut = async () => {
    await signOut();
    router.replace("/");
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScrollView className="flex-1" contentContainerClassName="pb-8">
        {/* Profile Header */}
        <View className="items-center pt-6 pb-8 border-b border-border">
          <View className="w-24 h-24 rounded-full bg-primary items-center justify-center overflow-hidden mb-4">
            {currentUser?.imageUrl ? (
              <Image
                source={{ uri: currentUser.imageUrl }}
                className="w-full h-full"
                contentFit="cover"
              />
            ) : (
              <Text className="text-white font-bold text-3xl">
                {(currentUser?.firstName?.[0] ?? user?.firstName?.[0] ?? "U").toUpperCase()}
              </Text>
            )}
          </View>
          <Text className="text-xl font-bold text-foreground">
            {currentUser?.firstName ?? user?.firstName}{" "}
            {currentUser?.lastName ?? user?.lastName}
          </Text>
          <Text className="text-muted-foreground">
            @{currentUser?.username ?? "username"}
          </Text>
          {currentUser?.isInfluencer && (
            <View className="flex-row items-center gap-1 mt-2 bg-primary/10 px-3 py-1 rounded-full">
              <Ionicons name="star" size={14} color="#7c3aed" />
              <Text className="text-primary font-medium text-sm">Creator</Text>
            </View>
          )}
        </View>

        {/* Stats */}
        <View className="flex-row py-4 border-b border-border">
          <Pressable className="flex-1 items-center">
            <Text className="text-xl font-bold text-foreground">0</Text>
            <Text className="text-muted-foreground text-sm">Following</Text>
          </Pressable>
          <View className="w-px bg-border" />
          <Pressable className="flex-1 items-center">
            <Text className="text-xl font-bold text-foreground">0</Text>
            <Text className="text-muted-foreground text-sm">Followers</Text>
          </Pressable>
          <View className="w-px bg-border" />
          <Pressable className="flex-1 items-center">
            <Text className="text-xl font-bold text-foreground">0</Text>
            <Text className="text-muted-foreground text-sm">Leagues</Text>
          </Pressable>
        </View>

        {/* Bio */}
        {currentUser?.bio && (
          <View className="px-4 py-4 border-b border-border">
            <Text className="text-foreground">{currentUser.bio}</Text>
          </View>
        )}

        {/* Menu Items */}
        <View className="px-4 pt-4">
          <MenuItem
            icon="person-outline"
            label="Edit Profile"
            onPress={() => {}}
          />
          <MenuItem
            icon="wallet-outline"
            label="Wallet & Payments"
            onPress={() => {}}
          />
          <MenuItem
            icon="heart-outline"
            label="My Subscriptions"
            onPress={() => {}}
          />
          <MenuItem
            icon="bookmark-outline"
            label="Saved Posts"
            onPress={() => {}}
          />
          <MenuItem
            icon="settings-outline"
            label="Settings"
            onPress={() => {}}
          />
          <MenuItem
            icon="help-circle-outline"
            label="Help & Support"
            onPress={() => {}}
          />
          <MenuItem
            icon="information-circle-outline"
            label="About iLeague"
            onPress={() => {}}
          />

          {/* Sign Out */}
          <Pressable
            onPress={handleSignOut}
            className="flex-row items-center py-4 mt-4 active:opacity-70"
          >
            <View className="w-10 h-10 rounded-full bg-error/10 items-center justify-center mr-3">
              <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            </View>
            <Text className="text-error font-medium">Sign Out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between py-4 border-b border-border active:opacity-70"
    >
      <View className="flex-row items-center">
        <View className="w-10 h-10 rounded-full bg-muted items-center justify-center mr-3">
          <Ionicons name={icon as any} size={20} color="#64748b" />
        </View>
        <Text className="text-foreground font-medium">{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#64748b" />
    </Pressable>
  );
}
