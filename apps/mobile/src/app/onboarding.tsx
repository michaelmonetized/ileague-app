import { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "convex/react";
import { api } from "@ileague/convex/convex/_generated/api";

const CATEGORIES = [
  { id: "gaming", name: "Gaming", icon: "game-controller" },
  { id: "sports", name: "Sports", icon: "football" },
  { id: "music", name: "Music", icon: "musical-notes" },
  { id: "fitness", name: "Fitness", icon: "fitness" },
  { id: "art", name: "Art", icon: "color-palette" },
  { id: "tech", name: "Tech", icon: "hardware-chip" },
  { id: "food", name: "Food", icon: "restaurant" },
  { id: "travel", name: "Travel", icon: "airplane" },
  { id: "fashion", name: "Fashion", icon: "shirt" },
  { id: "education", name: "Education", icon: "book" },
  { id: "entertainment", name: "Entertainment", icon: "film" },
  { id: "lifestyle", name: "Lifestyle", icon: "heart" },
];

type Step = 1 | 2 | 3 | 4;

export default function OnboardingScreen() {
  const router = useRouter();
  const completeOnboarding = useMutation(api.users.completeOnboarding);

  const [step, setStep] = useState<Step>(1);
  const [isInfluencer, setIsInfluencer] = useState(false);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [tagline, setTagline] = useState("");
  const [bio, setBio] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await completeOnboarding({
        isInfluencer,
        username,
        bio: bio || undefined,
        displayName: isInfluencer ? displayName : undefined,
        category: isInfluencer ? selectedCategory : undefined,
        tagline: isInfluencer ? tagline : undefined,
      });
      router.replace("/(tabs)/home");
    } catch (error) {
      console.error("Error completing onboarding:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Progress Bar */}
      <View className="flex-row px-4 pt-4 gap-2">
        {[1, 2, 3, 4].map((s) => (
          <View
            key={s}
            className={`flex-1 h-1.5 rounded-full ${
              s <= step ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 py-6"
        keyboardShouldPersistTaps="handled"
      >
        {/* Step 1: Role Selection */}
        {step === 1 && (
          <View>
            <Text className="text-2xl font-bold text-foreground mb-2">
              Welcome to iLeague! 🎉
            </Text>
            <Text className="text-muted-foreground mb-8">
              How would you like to use iLeague?
            </Text>

            <Pressable
              onPress={() => setIsInfluencer(true)}
              className={`p-5 rounded-xl border-2 mb-3 ${
                isInfluencer
                  ? "border-primary bg-primary/5"
                  : "border-border"
              }`}
            >
              <View className="flex-row items-center gap-4">
                <View className="w-14 h-14 rounded-xl bg-primary items-center justify-center">
                  <Ionicons name="sparkles" size={28} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-lg text-foreground">
                    I'm a Creator
                  </Text>
                  <Text className="text-muted-foreground text-sm">
                    Create content, build community, earn money
                  </Text>
                </View>
              </View>
            </Pressable>

            <Pressable
              onPress={() => setIsInfluencer(false)}
              className={`p-5 rounded-xl border-2 ${
                !isInfluencer
                  ? "border-primary bg-primary/5"
                  : "border-border"
              }`}
            >
              <View className="flex-row items-center gap-4">
                <View className="w-14 h-14 rounded-xl bg-muted items-center justify-center">
                  <Ionicons name="person" size={28} color="#64748b" />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-lg text-foreground">
                    I'm a Fan
                  </Text>
                  <Text className="text-muted-foreground text-sm">
                    Follow creators, join leagues, engage
                  </Text>
                </View>
              </View>
            </Pressable>
          </View>
        )}

        {/* Step 2: Profile Setup */}
        {step === 2 && (
          <View>
            <Text className="text-2xl font-bold text-foreground mb-2">
              Set Up Your Profile
            </Text>
            <Text className="text-muted-foreground mb-8">
              Tell us about yourself
            </Text>

            <View className="mb-4">
              <Text className="font-medium text-foreground mb-2">Username</Text>
              <View className="flex-row items-center border border-border rounded-xl px-4">
                <Text className="text-muted-foreground mr-1">@</Text>
                <TextInput
                  value={username}
                  onChangeText={(text) =>
                    setUsername(text.toLowerCase().replace(/[^a-z0-9_]/g, ""))
                  }
                  placeholder="username"
                  autoCapitalize="none"
                  className="flex-1 py-3.5 text-foreground"
                  placeholderTextColor="#64748b"
                />
              </View>
            </View>

            {isInfluencer && (
              <>
                <View className="mb-4">
                  <Text className="font-medium text-foreground mb-2">
                    Display Name
                  </Text>
                  <TextInput
                    value={displayName}
                    onChangeText={setDisplayName}
                    placeholder="Your creator name"
                    className="border border-border rounded-xl px-4 py-3.5 text-foreground"
                    placeholderTextColor="#64748b"
                  />
                </View>

                <View className="mb-4">
                  <Text className="font-medium text-foreground mb-2">
                    Tagline
                  </Text>
                  <TextInput
                    value={tagline}
                    onChangeText={setTagline}
                    placeholder="What do you do?"
                    className="border border-border rounded-xl px-4 py-3.5 text-foreground"
                    placeholderTextColor="#64748b"
                  />
                </View>
              </>
            )}

            <View>
              <Text className="font-medium text-foreground mb-2">
                Bio (optional)
              </Text>
              <TextInput
                value={bio}
                onChangeText={setBio}
                placeholder="Tell us about yourself..."
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                className="border border-border rounded-xl px-4 py-3 text-foreground min-h-[100px]"
                placeholderTextColor="#64748b"
              />
            </View>
          </View>
        )}

        {/* Step 3: Interests */}
        {step === 3 && (
          <View>
            <Text className="text-2xl font-bold text-foreground mb-2">
              {isInfluencer ? "Choose Your Category" : "Your Interests"}
            </Text>
            <Text className="text-muted-foreground mb-6">
              {isInfluencer
                ? "What type of content do you create?"
                : "What are you interested in?"}
            </Text>

            <View className="flex-row flex-wrap gap-3">
              {CATEGORIES.map((category) => (
                <Pressable
                  key={category.id}
                  onPress={() => setSelectedCategory(category.id)}
                  className={`w-[30%] p-4 rounded-xl border-2 items-center ${
                    selectedCategory === category.id
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  }`}
                >
                  <Ionicons
                    name={category.icon as any}
                    size={24}
                    color={
                      selectedCategory === category.id ? "#7c3aed" : "#64748b"
                    }
                  />
                  <Text
                    className={`text-xs font-medium mt-2 text-center ${
                      selectedCategory === category.id
                        ? "text-primary"
                        : "text-foreground"
                    }`}
                  >
                    {category.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Step 4: Complete */}
        {step === 4 && (
          <View className="items-center pt-12">
            <View className="w-24 h-24 rounded-full bg-primary items-center justify-center mb-6">
              <Ionicons name="checkmark" size={48} color="white" />
            </View>
            <Text className="text-2xl font-bold text-foreground mb-2">
              You're All Set! 🎉
            </Text>
            <Text className="text-muted-foreground text-center">
              {isInfluencer
                ? "Start creating content and building your community!"
                : "Start discovering creators and joining leagues!"}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Buttons */}
      <View className="px-4 pb-4 pt-2 flex-row gap-3">
        {step > 1 && (
          <Pressable
            onPress={() => setStep((step - 1) as Step)}
            className="flex-1 bg-muted py-4 rounded-xl active:opacity-80"
          >
            <Text className="text-foreground text-center font-semibold">
              Back
            </Text>
          </Pressable>
        )}
        <Pressable
          onPress={() => {
            if (step === 4) {
              handleComplete();
            } else {
              setStep((step + 1) as Step);
            }
          }}
          disabled={
            isSubmitting ||
            (step === 2 && (!username || (isInfluencer && !displayName))) ||
            (step === 3 && isInfluencer && !selectedCategory)
          }
          className={`flex-1 py-4 rounded-xl ${
            isSubmitting ||
            (step === 2 && (!username || (isInfluencer && !displayName))) ||
            (step === 3 && isInfluencer && !selectedCategory)
              ? "bg-primary/50"
              : "bg-primary active:opacity-80"
          }`}
        >
          <Text className="text-white text-center font-semibold">
            {step === 4
              ? isSubmitting
                ? "Setting up..."
                : "Go to Home"
              : "Continue"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
