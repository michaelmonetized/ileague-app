import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useQuery, useMutation, usePaginatedQuery } from "convex/react";
import { api } from "@ileague/convex/convex/_generated/api";
import { Id } from "@ileague/convex/convex/_generated/dataModel";

export default function LeaguesScreen() {
  const router = useRouter();
  const currentUser = useQuery(api.users.getCurrentUser);
  
  // Fetch featured leagues
  const featuredLeagues = useQuery(api.leagues.getFeaturedLeagues, { limit: 5 });
  
  // Fetch user's leagues
  const userLeagues = useQuery(
    api.leagues.getUserLeagues,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  );
  
  // Fetch all leagues with pagination
  const { results: allLeagues, status, loadMore } = usePaginatedQuery(
    api.leagues.getLeagues,
    { visibility: "public" },
    { initialNumItems: 10 }
  );

  const joinLeague = useMutation(api.leagues.joinLeague);

  const handleJoinLeague = async (leagueId: Id<"leagues">) => {
    try {
      await joinLeague({ leagueId });
    } catch (error) {
      console.error("Failed to join league:", error);
    }
  };

  const isLoading = featuredLeagues === undefined || currentUser === undefined;

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#7c3aed" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <View>
          <Text className="text-2xl font-bold text-foreground">Leagues</Text>
          <Text className="text-muted-foreground">Compete and win</Text>
        </View>
        {currentUser?.isInfluencer && (
          <Pressable 
            onPress={() => router.push("/create-league" as any)}
            className="bg-primary px-4 py-2 rounded-lg flex-row items-center gap-2 active:opacity-80"
          >
            <Ionicons name="add" size={20} color="white" />
            <Text className="text-white font-medium">Create</Text>
          </Pressable>
        )}
      </View>

      <ScrollView className="flex-1" contentContainerClassName="px-4 pb-8">
        {/* Featured Leagues */}
        {featuredLeagues && featuredLeagues.length > 0 && (
          <View className="mb-6">
            <Text className="text-lg font-semibold text-foreground mb-3">
              🔥 Featured Leagues
            </Text>

            {featuredLeagues.map((league) => (
              <LeagueCard
                key={league._id}
                league={league}
                onJoin={() => handleJoinLeague(league._id)}
                isMember={userLeagues?.some(ul => ul._id === league._id) ?? false}
              />
            ))}
          </View>
        )}

        {/* Your Leagues */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-foreground mb-3">
            Your Leagues
          </Text>

          {userLeagues && userLeagues.length > 0 ? (
            userLeagues.map((league) => (
              <LeagueCard
                key={league._id}
                league={league}
                isMember={true}
                showRole={true}
                role={league.role}
                score={league.score}
              />
            ))
          ) : (
            <View className="bg-muted rounded-xl p-8 items-center">
              <Ionicons name="trophy-outline" size={48} color="#64748b" />
              <Text className="font-semibold text-foreground mt-4 mb-1">
                No Leagues Yet
              </Text>
              <Text className="text-muted-foreground text-center text-sm mb-4">
                Join a league to start competing!
              </Text>
            </View>
          )}
        </View>

        {/* All Public Leagues */}
        {allLeagues && allLeagues.length > 0 && (
          <View className="mb-6">
            <Text className="text-lg font-semibold text-foreground mb-3">
              All Leagues
            </Text>

            {allLeagues.map((league) => (
              <LeagueCard
                key={league._id}
                league={league}
                onJoin={() => handleJoinLeague(league._id)}
                isMember={userLeagues?.some(ul => ul._id === league._id) ?? false}
              />
            ))}

            {status === "CanLoadMore" && (
              <Pressable
                onPress={() => loadMore(10)}
                className="bg-muted py-3 rounded-lg mt-2 active:opacity-80"
              >
                <Text className="text-center text-muted-foreground font-medium">
                  Load More
                </Text>
              </Pressable>
            )}
          </View>
        )}

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

interface LeagueCardProps {
  league: {
    _id: Id<"leagues">;
    name: string;
    description: string;
    category: string;
    type: "competition" | "community" | "challenge";
    memberCount: number;
    prizePool?: number;
    creator?: { firstName?: string; lastName?: string; username: string } | null;
  };
  onJoin?: () => void;
  isMember?: boolean;
  showRole?: boolean;
  role?: string;
  score?: number;
}

function LeagueCard({ league, onJoin, isMember, showRole, role, score }: LeagueCardProps) {
  const typeColors = {
    competition: { bg: "bg-error/10", text: "text-error" },
    challenge: { bg: "bg-warning/10", text: "text-warning" },
    community: { bg: "bg-primary/10", text: "text-primary" },
  };

  const colors = typeColors[league.type];

  return (
    <Pressable className="bg-card border border-border rounded-xl p-4 mb-3 active:opacity-80">
      <View className="flex-row items-center justify-between mb-2">
        <View className={`px-2 py-1 rounded ${colors.bg}`}>
          <Text className={`text-xs font-medium capitalize ${colors.text}`}>
            {league.type}
          </Text>
        </View>
        {league.prizePool && league.prizePool > 0 && (
          <View className="flex-row items-center gap-1 bg-success/10 px-2 py-1 rounded">
            <Ionicons name="trophy" size={12} color="#22c55e" />
            <Text className="text-xs font-medium text-success">
              ${formatNumber(league.prizePool)}
            </Text>
          </View>
        )}
        {showRole && role && (
          <View className="bg-primary/10 px-2 py-1 rounded">
            <Text className="text-xs font-medium text-primary capitalize">
              {role}
            </Text>
          </View>
        )}
      </View>

      <Text className="font-semibold text-lg text-foreground mb-1">
        {league.name}
      </Text>
      <Text className="text-sm text-muted-foreground mb-3" numberOfLines={2}>
        {league.category} • {formatNumber(league.memberCount)} members
        {score !== undefined && ` • Score: ${score}`}
      </Text>

      {!isMember && onJoin ? (
        <Pressable 
          onPress={onJoin}
          className="bg-primary py-2.5 rounded-lg active:opacity-80"
        >
          <Text className="text-white text-center font-medium">
            Join League
          </Text>
        </Pressable>
      ) : (
        <View className="bg-muted py-2.5 rounded-lg">
          <Text className="text-muted-foreground text-center font-medium">
            ✓ Joined
          </Text>
        </View>
      )}
    </Pressable>
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
