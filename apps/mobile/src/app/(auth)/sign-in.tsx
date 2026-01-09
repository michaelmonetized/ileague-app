import { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useSignIn } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";

export default function SignInScreen() {
  const router = useRouter();
  const { signIn, setActive, isLoaded } = useSignIn();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = useCallback(async () => {
    if (!isLoaded) return;

    setIsLoading(true);
    setError("");

    try {
      const signInAttempt = await signIn.create({
        identifier: email,
        password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/(tabs)/home");
      } else {
        setError("Sign in failed. Please try again.");
      }
    } catch (err: any) {
      console.error("Error signing in:", err);
      setError(err.errors?.[0]?.message ?? "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, email, password, signIn, setActive, router]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 pt-16 pb-8">
          {/* Back Button */}
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-muted items-center justify-center mb-8"
          >
            <Ionicons name="arrow-back" size={20} color="#0f172a" />
          </Pressable>

          {/* Header */}
          <View className="mb-8">
            <Text className="text-3xl font-bold text-foreground mb-2">
              Welcome Back
            </Text>
            <Text className="text-muted-foreground">
              Sign in to continue to iLeague
            </Text>
          </View>

          {/* Error Message */}
          {error ? (
            <View className="bg-error/10 border border-error/20 rounded-xl p-4 mb-6">
              <Text className="text-error text-center">{error}</Text>
            </View>
          ) : null}

          {/* Form */}
          <View className="space-y-4 mb-6">
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">
                Email
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                className="border border-border rounded-xl px-4 py-3.5 text-foreground bg-white"
                placeholderTextColor="#64748b"
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-foreground mb-2">
                Password
              </Text>
              <View className="relative">
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  className="border border-border rounded-xl px-4 py-3.5 text-foreground bg-white pr-12"
                  placeholderTextColor="#64748b"
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5"
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color="#64748b"
                  />
                </Pressable>
              </View>
            </View>
          </View>

          {/* Sign In Button */}
          <Pressable
            onPress={handleSignIn}
            disabled={isLoading || !email || !password}
            className={`py-4 rounded-xl mb-4 ${
              isLoading || !email || !password
                ? "bg-primary/50"
                : "bg-primary active:bg-primary/90"
            }`}
          >
            <Text className="text-white text-center font-semibold text-lg">
              {isLoading ? "Signing In..." : "Sign In"}
            </Text>
          </Pressable>

          {/* Forgot Password */}
          <Pressable className="mb-8">
            <Text className="text-primary text-center font-medium">
              Forgot Password?
            </Text>
          </Pressable>

          {/* Divider */}
          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-px bg-border" />
            <Text className="px-4 text-muted-foreground text-sm">or</Text>
            <View className="flex-1 h-px bg-border" />
          </View>

          {/* Social Buttons */}
          <View className="space-y-3">
            <Pressable className="flex-row items-center justify-center py-3.5 border border-border rounded-xl active:bg-muted">
              <Ionicons name="logo-google" size={20} color="#0f172a" />
              <Text className="ml-3 font-medium text-foreground">
                Continue with Google
              </Text>
            </Pressable>

            <Pressable className="flex-row items-center justify-center py-3.5 border border-border rounded-xl active:bg-muted">
              <Ionicons name="logo-apple" size={20} color="#0f172a" />
              <Text className="ml-3 font-medium text-foreground">
                Continue with Apple
              </Text>
            </Pressable>
          </View>

          {/* Sign Up Link */}
          <View className="flex-1 justify-end pt-8">
            <Pressable onPress={() => router.replace("/(auth)/sign-up")}>
              <Text className="text-muted-foreground text-center">
                Don&apos;t have an account?{" "}
                <Text className="text-primary font-semibold">Sign Up</Text>
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
