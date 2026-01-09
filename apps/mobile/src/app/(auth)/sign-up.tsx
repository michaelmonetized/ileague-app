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
import { useSignUp } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp, setActive, isLoaded } = useSignUp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignUp = useCallback(async () => {
    if (!isLoaded) return;

    setIsLoading(true);
    setError("");

    try {
      await signUp.create({
        emailAddress: email,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err: any) {
      console.error("Error signing up:", err);
      setError(err.errors?.[0]?.message ?? "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, email, password, signUp]);

  const handleVerify = useCallback(async () => {
    if (!isLoaded) return;

    setIsLoading(true);
    setError("");

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace("/onboarding");
      } else {
        setError("Verification failed. Please try again.");
      }
    } catch (err: any) {
      console.error("Error verifying:", err);
      setError(err.errors?.[0]?.message ?? "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, code, signUp, setActive, router]);

  if (pendingVerification) {
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
              onPress={() => setPendingVerification(false)}
              className="w-10 h-10 rounded-full bg-muted items-center justify-center mb-8"
            >
              <Ionicons name="arrow-back" size={20} color="#0f172a" />
            </Pressable>

            {/* Header */}
            <View className="mb-8">
              <Text className="text-3xl font-bold text-foreground mb-2">
                Verify Email
              </Text>
              <Text className="text-muted-foreground">
                We sent a verification code to {email}
              </Text>
            </View>

            {/* Error Message */}
            {error ? (
              <View className="bg-error/10 border border-error/20 rounded-xl p-4 mb-6">
                <Text className="text-error text-center">{error}</Text>
              </View>
            ) : null}

            {/* Verification Code Input */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-foreground mb-2">
                Verification Code
              </Text>
              <TextInput
                value={code}
                onChangeText={setCode}
                placeholder="Enter verification code"
                keyboardType="number-pad"
                className="border border-border rounded-xl px-4 py-3.5 text-foreground bg-white text-center text-2xl tracking-widest"
                placeholderTextColor="#64748b"
                maxLength={6}
              />
            </View>

            {/* Verify Button */}
            <Pressable
              onPress={handleVerify}
              disabled={isLoading || !code}
              className={`py-4 rounded-xl mb-4 ${
                isLoading || !code
                  ? "bg-primary/50"
                  : "bg-primary active:bg-primary/90"
              }`}
            >
              <Text className="text-white text-center font-semibold text-lg">
                {isLoading ? "Verifying..." : "Verify Email"}
              </Text>
            </Pressable>

            {/* Resend Code */}
            <Pressable className="py-4">
              <Text className="text-primary text-center font-medium">
                Resend Code
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

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
              Create Account
            </Text>
            <Text className="text-muted-foreground">
              Sign up to get started with iLeague
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
                  placeholder="Create a password"
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
              <Text className="text-xs text-muted-foreground mt-1">
                Must be at least 8 characters
              </Text>
            </View>
          </View>

          {/* Sign Up Button */}
          <Pressable
            onPress={handleSignUp}
            disabled={isLoading || !email || !password}
            className={`py-4 rounded-xl mb-4 ${
              isLoading || !email || !password
                ? "bg-primary/50"
                : "bg-primary active:bg-primary/90"
            }`}
          >
            <Text className="text-white text-center font-semibold text-lg">
              {isLoading ? "Creating Account..." : "Create Account"}
            </Text>
          </Pressable>

          {/* Terms */}
          <Text className="text-xs text-muted-foreground text-center mb-8">
            By signing up, you agree to our{" "}
            <Text className="text-primary">Terms of Service</Text> and{" "}
            <Text className="text-primary">Privacy Policy</Text>
          </Text>

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

          {/* Sign In Link */}
          <View className="flex-1 justify-end pt-8">
            <Pressable onPress={() => router.replace("/(auth)/sign-in")}>
              <Text className="text-muted-foreground text-center">
                Already have an account?{" "}
                <Text className="text-primary font-semibold">Sign In</Text>
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
