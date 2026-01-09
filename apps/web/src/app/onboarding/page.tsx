"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { Trophy, User, Sparkles, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@ileague/convex/convex/_generated/api";
import { CATEGORIES, cn } from "@/lib/utils";

type Step = "role" | "profile" | "interests" | "complete";

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useUser();
  const currentUser = useQuery(api.users.getCurrentUser);
  const completeOnboarding = useMutation(api.users.completeOnboarding);

  const [step, setStep] = useState<Step>("role");
  const [isInfluencer, setIsInfluencer] = useState(false);
  const [username, setUsername] = useState(currentUser?.username ?? "");
  const [bio, setBio] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [tagline, setTagline] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await completeOnboarding({
        isInfluencer,
        username,
        bio,
        displayName: isInfluencer ? displayName : undefined,
        category: isInfluencer ? selectedCategory : undefined,
        subcategories: isInfluencer ? selectedSubcategories : undefined,
        tagline: isInfluencer ? tagline : undefined,
      });
      router.push("/dashboard");
    } catch (error) {
      console.error("Error completing onboarding:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex justify-center gap-2 mb-8">
          {["role", "profile", "interests", "complete"].map((s, i) => (
            <div
              key={s}
              className={cn(
                "h-2 w-12 rounded-full transition-colors",
                step === s || ["role", "profile", "interests", "complete"].indexOf(step) > i
                  ? "bg-primary"
                  : "bg-border"
              )}
            />
          ))}
        </div>

        <Card>
          <CardContent className="pt-8 pb-8">
            {/* Step 1: Role Selection */}
            {step === "role" && (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-2xl font-display font-bold mb-2">
                    Welcome to iLeague! 🎉
                  </h1>
                  <p className="text-muted-foreground">
                    How would you like to use iLeague?
                  </p>
                </div>

                <div className="grid gap-4">
                  <button
                    onClick={() => setIsInfluencer(true)}
                    className={cn(
                      "p-6 rounded-xl border-2 text-left transition-all",
                      isInfluencer
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center">
                        <Sparkles className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">I&apos;m a Creator</h3>
                        <p className="text-sm text-muted-foreground">
                          Create content, build a community, and monetize
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setIsInfluencer(false)}
                    className={cn(
                      "p-6 rounded-xl border-2 text-left transition-all",
                      !isInfluencer
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                        <User className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">I&apos;m a Fan</h3>
                        <p className="text-sm text-muted-foreground">
                          Follow creators, join leagues, and engage
                        </p>
                      </div>
                    </div>
                  </button>
                </div>

                <Button
                  variant="gradient"
                  className="w-full gap-2"
                  onClick={() => setStep("profile")}
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Step 2: Profile Setup */}
            {step === "profile" && (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-2xl font-display font-bold mb-2">
                    Set Up Your Profile
                  </h1>
                  <p className="text-muted-foreground">
                    Tell us a bit about yourself.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      Username
                    </label>
                    <div className="flex items-center">
                      <span className="text-muted-foreground mr-1">@</span>
                      <Input
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                        placeholder="username"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  {isInfluencer && (
                    <>
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">
                          Display Name
                        </label>
                        <Input
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Your creator name"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">
                          Tagline
                        </label>
                        <Input
                          value={tagline}
                          onChange={(e) => setTagline(e.target.value)}
                          placeholder="A short description of what you do"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      Bio (optional)
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself..."
                      className="flex min-h-24 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => setStep("role")}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    variant="gradient"
                    className="flex-1 gap-2"
                    onClick={() => setStep("interests")}
                    disabled={!username || (isInfluencer && !displayName)}
                  >
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Interests */}
            {step === "interests" && (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-2xl font-display font-bold mb-2">
                    {isInfluencer ? "Choose Your Category" : "Select Your Interests"}
                  </h1>
                  <p className="text-muted-foreground">
                    {isInfluencer
                      ? "What type of content do you create?"
                      : "What kind of content are you interested in?"}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {CATEGORIES.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        if (isInfluencer) {
                          setSelectedCategory(category.id);
                        } else {
                          setSelectedSubcategories((prev) =>
                            prev.includes(category.id)
                              ? prev.filter((c) => c !== category.id)
                              : [...prev, category.id]
                          );
                        }
                      }}
                      className={cn(
                        "p-4 rounded-xl border-2 text-center transition-all",
                        (isInfluencer && selectedCategory === category.id) ||
                          (!isInfluencer && selectedSubcategories.includes(category.id))
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className="text-2xl mb-1">{category.icon}</div>
                      <div className="text-xs font-medium">{category.name}</div>
                    </button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => setStep("profile")}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    variant="gradient"
                    className="flex-1 gap-2"
                    onClick={() => setStep("complete")}
                    disabled={isInfluencer && !selectedCategory}
                  >
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Complete */}
            {step === "complete" && (
              <div className="space-y-6 text-center">
                <div className="h-20 w-20 rounded-full gradient-primary flex items-center justify-center mx-auto">
                  <Check className="h-10 w-10 text-white" />
                </div>

                <div>
                  <h1 className="text-2xl font-display font-bold mb-2">
                    You&apos;re All Set! 🎉
                  </h1>
                  <p className="text-muted-foreground">
                    {isInfluencer
                      ? "Start creating content and building your community."
                      : "Start exploring and connecting with your favorite creators."}
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => setStep("interests")}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    variant="gradient"
                    className="flex-1 gap-2"
                    onClick={handleComplete}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Setting up..." : "Go to Dashboard"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
