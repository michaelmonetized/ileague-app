"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import Link from "next/link";
import {
  Trophy,
  Users,
  TrendingUp,
  Heart,
  MessageSquare,
  Eye,
  Plus,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { api } from "@ileague/convex/convex/_generated/api";
import { getInitials, formatNumber } from "@/lib/utils";

export default function DashboardPage() {
  const { user } = useUser();
  const currentUser = useQuery(api.users.getCurrentUser);

  const greeting = getGreeting();

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">
            {greeting}, {currentUser?.firstName ?? user?.firstName ?? "there"}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s what&apos;s happening in your world today.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/explore">
            <Button variant="outline" className="gap-2">
              <Users className="h-4 w-4" />
              Explore
            </Button>
          </Link>
          {currentUser?.isInfluencer && (
            <Button variant="gradient" className="gap-2">
              <Plus className="h-4 w-4" />
              Create Post
            </Button>
          )}
        </div>
      </section>

      {/* Quick Stats for Influencers */}
      {currentUser?.isInfluencer && (
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Followers"
            value={formatNumber(0)}
            change="+12%"
            icon={Users}
          />
          <StatCard
            title="Subscribers"
            value={formatNumber(0)}
            change="+8%"
            icon={Heart}
          />
          <StatCard
            title="Profile Views"
            value={formatNumber(0)}
            change="+23%"
            icon={Eye}
          />
          <StatCard
            title="Engagement"
            value="0%"
            change="+5%"
            icon={TrendingUp}
          />
        </section>
      )}

      {/* Onboarding Card (if not completed) */}
      {!currentUser?.onboardingCompleted && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="py-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Complete Your Profile</h3>
                <p className="text-muted-foreground">
                  Tell us a bit about yourself to unlock all features and get
                  personalized recommendations.
                </p>
              </div>
              <Link href="/onboarding">
                <Button variant="gradient" className="gap-2">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Feed Preview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
            <Link href="/feed">
              <Button variant="ghost" size="sm" className="gap-1">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">No Posts Yet</h3>
              <p className="text-muted-foreground mb-4">
                Follow some creators or create your first post to see activity
                here.
              </p>
              <Link href="/explore">
                <Button variant="outline">Discover Creators</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Your Leagues */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Your Leagues</CardTitle>
                <Link href="/leagues">
                  <Button variant="ghost" size="sm">
                    See All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <Trophy className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-3">
                  You haven&apos;t joined any leagues yet.
                </p>
                <Link href="/leagues">
                  <Button variant="outline" size="sm">
                    Browse Leagues
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Suggested Creators */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Suggested For You</CardTitle>
                <Link href="/explore">
                  <Button variant="ghost" size="sm">
                    See All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <SuggestedCreator
                name="Alex Gaming"
                category="Gaming"
                followers="125K"
                imageUrl="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
              />
              <SuggestedCreator
                name="Sarah Fit"
                category="Fitness"
                followers="89K"
                imageUrl="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
              />
              <SuggestedCreator
                name="Marcus Music"
                category="Music"
                followers="201K"
                imageUrl="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function StatCard({
  title,
  value,
  change,
  icon: Icon,
}: {
  title: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const isPositive = change.startsWith("+");

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">{title}</span>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="text-2xl font-bold">{value}</div>
        <div
          className={`text-xs font-medium ${
            isPositive ? "text-success" : "text-error"
          }`}
        >
          {change} from last month
        </div>
      </CardContent>
    </Card>
  );
}

function SuggestedCreator({
  name,
  category,
  followers,
  imageUrl,
}: {
  name: string;
  category: string;
  followers: string;
  imageUrl: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <Avatar>
        <AvatarImage src={imageUrl} alt={name} />
        <AvatarFallback>{getInitials(name)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate">{name}</div>
        <div className="text-xs text-muted-foreground">
          {category} • {followers} followers
        </div>
      </div>
      <Button variant="outline" size="sm">
        Follow
      </Button>
    </div>
  );
}
