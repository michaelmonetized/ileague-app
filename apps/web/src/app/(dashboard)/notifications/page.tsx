"use client";

import { useQuery, useMutation, usePaginatedQuery } from "convex/react";
import {
  Bell,
  Heart,
  MessageSquare,
  UserPlus,
  Trophy,
  Gift,
  Megaphone,
  CheckCheck,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api } from "@ileague/convex/convex/_generated/api";
import { formatRelativeTime, getInitials, cn } from "@/lib/utils";

const notificationIcons = {
  follow: UserPlus,
  like: Heart,
  comment: MessageSquare,
  mention: MessageSquare,
  subscription: Gift,
  tip: Gift,
  league_invite: Trophy,
  league_update: Trophy,
  achievement: Trophy,
  system: Megaphone,
};

const notificationColors = {
  follow: "bg-primary/10 text-primary",
  like: "bg-error/10 text-error",
  comment: "bg-accent/10 text-accent",
  mention: "bg-accent/10 text-accent",
  subscription: "bg-success/10 text-success",
  tip: "bg-success/10 text-success",
  league_invite: "bg-warning/10 text-warning",
  league_update: "bg-warning/10 text-warning",
  achievement: "bg-warning/10 text-warning",
  system: "bg-muted text-muted-foreground",
};

export default function NotificationsPage() {
  const { results, status, loadMore } = usePaginatedQuery(
    api.notifications.getNotifications,
    {},
    { initialNumItems: 20 }
  );

  const unreadCount = useQuery(api.notifications.getUnreadCount) ?? 0;
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);
  const markAsRead = useMutation(api.notifications.markAsRead);
  const deleteNotification = useMutation(api.notifications.deleteNotification);
  const clearAll = useMutation(api.notifications.clearAllNotifications);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground">
              You have {unreadCount} unread notification{unreadCount !== 1 && "s"}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => markAllAsRead()}
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </Button>
          )}
          {results && results.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground"
              onClick={() => clearAll()}
            >
              <Trash2 className="h-4 w-4" />
              Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <Card>
        {results && results.length > 0 ? (
          <div className="divide-y divide-border">
            {results.map((notification) => {
              const Icon = notificationIcons[notification.type];
              const colorClass = notificationColors[notification.type];

              return (
                <div
                  key={notification._id}
                  className={cn(
                    "flex items-start gap-4 p-4 transition-colors",
                    !notification.isRead && "bg-primary/5"
                  )}
                >
                  {/* Icon or Avatar */}
                  {notification.actor ? (
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={notification.actor.imageUrl}
                        alt={notification.actor.username}
                      />
                      <AvatarFallback>
                        {getInitials(
                          notification.actor.firstName ??
                            notification.actor.username
                        )}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div
                      className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center",
                        colorClass
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{notification.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatRelativeTime(notification._creationTime)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          markAsRead({ notificationId: notification._id })
                        }
                      >
                        <CheckCheck className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-error"
                      onClick={() =>
                        deleteNotification({ notificationId: notification._id })
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <CardContent className="py-12 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No Notifications</h3>
            <p className="text-muted-foreground">
              You&apos;re all caught up! Check back later for updates.
            </p>
          </CardContent>
        )}

        {/* Load More */}
        {status === "CanLoadMore" && (
          <div className="p-4 border-t border-border">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => loadMore(20)}
            >
              Load More
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
