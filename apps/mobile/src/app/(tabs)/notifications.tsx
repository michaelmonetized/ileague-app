import { View, Text, ScrollView, Pressable, RefreshControl } from "react-native";
import { useState, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { usePaginatedQuery, useMutation, useQuery } from "convex/react";
import { api } from "@ileague/convex/convex/_generated/api";

export default function NotificationsScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const { results, status, loadMore } = usePaginatedQuery(
    api.notifications.getNotifications,
    {},
    { initialNumItems: 20 }
  );

  const unreadCount = useQuery(api.notifications.getUnreadCount) ?? 0;
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const getIconForType = (type: string) => {
    switch (type) {
      case "follow":
        return { name: "person-add", color: "#7c3aed" };
      case "like":
        return { name: "heart", color: "#ef4444" };
      case "comment":
        return { name: "chatbubble", color: "#10b981" };
      case "subscription":
        return { name: "gift", color: "#22c55e" };
      case "tip":
        return { name: "cash", color: "#22c55e" };
      case "league_invite":
        return { name: "trophy", color: "#f59e0b" };
      default:
        return { name: "notifications", color: "#64748b" };
    }
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
        <View>
          <Text className="text-2xl font-bold text-foreground">
            Notifications
          </Text>
          {unreadCount > 0 && (
            <Text className="text-muted-foreground text-sm">
              {unreadCount} unread
            </Text>
          )}
        </View>
        {unreadCount > 0 && (
          <Pressable
            onPress={() => markAllAsRead()}
            className="flex-row items-center gap-1 active:opacity-70"
          >
            <Ionicons name="checkmark-done" size={18} color="#7c3aed" />
            <Text className="text-primary font-medium text-sm">
              Mark all read
            </Text>
          </Pressable>
        )}
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-8"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {results && results.length > 0 ? (
          <View>
            {results.map((notification) => {
              const icon = getIconForType(notification.type);
              return (
                <Pressable
                  key={notification._id}
                  className={`flex-row items-start gap-3 px-4 py-4 border-b border-border active:bg-muted ${
                    !notification.isRead ? "bg-primary/5" : ""
                  }`}
                >
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center"
                    style={{ backgroundColor: `${icon.color}15` }}
                  >
                    <Ionicons
                      name={icon.name as any}
                      size={20}
                      color={icon.color}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-foreground">
                      {notification.title}
                    </Text>
                    <Text className="text-muted-foreground text-sm">
                      {notification.message}
                    </Text>
                    <Text className="text-xs text-muted-foreground mt-1">
                      {formatTime(notification._creationTime)}
                    </Text>
                  </View>
                  {!notification.isRead && (
                    <View className="w-2 h-2 rounded-full bg-primary" />
                  )}
                </Pressable>
              );
            })}

            {status === "CanLoadMore" && (
              <Pressable
                onPress={() => loadMore(20)}
                className="py-4 active:opacity-70"
              >
                <Text className="text-primary text-center font-medium">
                  Load More
                </Text>
              </Pressable>
            )}
          </View>
        ) : (
          <View className="flex-1 items-center justify-center px-4 pt-20">
            <Ionicons name="notifications-outline" size={64} color="#64748b" />
            <Text className="font-semibold text-xl text-foreground mt-4 mb-2">
              No Notifications
            </Text>
            <Text className="text-muted-foreground text-center">
              You&apos;re all caught up! Check back later for updates.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
