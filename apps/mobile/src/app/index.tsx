import { useEffect } from "react";
import { View, Text, Pressable, Image } from "react-native";
import { useRouter } from "expo-router";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { api } from "@ileague/convex/convex/_generated/api";
import { LinearGradient } from "expo-linear-gradient";

export default function LandingScreen() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const currentUser = useQuery(api.users.getCurrentUser);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      if (currentUser && !currentUser.onboardingCompleted) {
        router.replace("/onboarding");
      } else if (currentUser?.onboardingCompleted) {
        router.replace("/(tabs)/home");
      }
    }
  }, [isLoaded, isSignedIn, currentUser, router]);

  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-muted-foreground">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Hero Section */}
      <LinearGradient
        colors={["#7c3aed", "#a855f7"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="flex-1 pt-20 px-6"
      >
        <View className="flex-1 justify-center items-center">
          {/* Logo */}
          <View className="w-20 h-20 bg-white/20 rounded-2xl items-center justify-center mb-8">
            <Text className="text-4xl">🏆</Text>
          </View>

          {/* Title */}
          <Text className="text-4xl font-bold text-white text-center mb-4">
            iLeague
          </Text>
          <Text className="text-lg text-white/80 text-center max-w-xs mb-12">
            Connect with influencers, join leagues, and be part of something
            amazing.
          </Text>
        </View>
      </LinearGradient>

      {/* Bottom Section */}
      <View className="p-6 pb-12 bg-white">
        {/* Get Started Button */}
        <Pressable
          onPress={() => router.push("/(auth)/sign-up")}
          className="bg-primary py-4 rounded-xl mb-3 active:opacity-80"
        >
          <Text className="text-white text-center font-semibold text-lg">
            Get Started
          </Text>
        </Pressable>

        {/* Sign In Link */}
        <Pressable
          onPress={() => router.push("/(auth)/sign-in")}
          className="py-4 active:opacity-70"
        >
          <Text className="text-muted-foreground text-center">
            Already have an account?{" "}
            <Text className="text-primary font-semibold">Sign In</Text>
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
