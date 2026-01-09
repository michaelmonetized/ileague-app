"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import Image from "next/image";
import Link from "next/link";
import {
  Trophy,
  Users,
  Search,
  Filter,
  Plus,
  Star,
  Calendar,
  Award,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api } from "@ileague/convex/convex/_generated/api";
import { formatNumber, formatDate, getInitials, cn, CATEGORIES } from "@/lib/utils";

const leagueTypes = [
  { id: "all", label: "All Leagues" },
  { id: "competition", label: "Competitions" },
  { id: "community", label: "Communities" },
  { id: "challenge", label: "Challenges" },
] as const;

export default function LeaguesPage() {
  const [selectedType, setSelectedType] = useState<string>("all");
  const currentUser = useQuery(api.users.getCurrentUser);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">
            Leagues
          </h1>
          <p className="text-muted-foreground mt-1">
            Join leagues, compete, and climb the leaderboards.
          </p>
        </div>
        {currentUser?.isInfluencer && (
          <Button variant="gradient" className="gap-2">
            <Plus className="h-4 w-4" />
            Create League
          </Button>
        )}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search leagues..."
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Type Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {leagueTypes.map((type) => (
          <Button
            key={type.id}
            variant={selectedType === type.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedType(type.id)}
          >
            {type.label}
          </Button>
        ))}
      </div>

      {/* Featured Leagues */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Star className="h-5 w-5 text-warning fill-warning" />
            Featured Leagues
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FeaturedLeagueCard
            name="Ultimate Gaming Championship"
            creator="Alex Gaming"
            creatorImage="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
            category="Gaming"
            type="competition"
            memberCount={1234}
            prizePool={5000}
            endDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}
          />
          <FeaturedLeagueCard
            name="30-Day Fitness Challenge"
            creator="Sarah Fit"
            creatorImage="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
            category="Fitness"
            type="challenge"
            memberCount={567}
            endDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
          />
          <FeaturedLeagueCard
            name="Music Producers Community"
            creator="Marcus Music"
            creatorImage="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"
            category="Music"
            type="community"
            memberCount={2890}
          />
        </div>
      </section>

      {/* Your Leagues */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Your Leagues</h2>
          <Button variant="ghost" size="sm" className="gap-1">
            View All
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Card>
          <CardContent className="py-12 text-center">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No Leagues Yet</h3>
            <p className="text-muted-foreground mb-4">
              Join a league to compete with others and climb the leaderboards!
            </p>
            <Button variant="outline">Browse Leagues</Button>
          </CardContent>
        </Card>
      </section>

      {/* All Leagues */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">All Leagues</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Placeholder leagues */}
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <LeagueCard key={i} />
          ))}
        </div>
      </section>
    </div>
  );
}

function FeaturedLeagueCard({
  name,
  creator,
  creatorImage,
  category,
  type,
  memberCount,
  prizePool,
  endDate,
}: {
  name: string;
  creator: string;
  creatorImage: string;
  category: string;
  type: "competition" | "community" | "challenge";
  memberCount: number;
  prizePool?: number;
  endDate?: Date;
}) {
  const typeStyles = {
    competition: "bg-error/10 text-error border-error/20",
    community: "bg-primary/10 text-primary border-primary/20",
    challenge: "bg-warning/10 text-warning border-warning/20",
  };

  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <Badge className={cn("capitalize", typeStyles[type])}>{type}</Badge>
          {prizePool && (
            <Badge variant="secondary" className="gap-1">
              <Award className="h-3 w-3" />
              ${formatNumber(prizePool)}
            </Badge>
          )}
        </div>

        <h3 className="font-semibold text-lg mb-2">{name}</h3>

        <div className="flex items-center gap-2 mb-4">
          <Avatar className="h-6 w-6">
            <AvatarImage src={creatorImage} alt={creator} />
            <AvatarFallback>{getInitials(creator)}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">by {creator}</span>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {formatNumber(memberCount)} members
          </div>
          {endDate && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Ends {formatDate(endDate)}
            </div>
          )}
        </div>

        <Button variant="gradient" className="w-full">
          Join League
        </Button>
      </CardContent>
    </Card>
  );
}

function LeagueCard() {
  return (
    <Card className="group hover:border-primary/50 transition-colors">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4 mb-3">
          <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
            <Trophy className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold">Sample League</h3>
            <p className="text-sm text-muted-foreground">Gaming • Competition</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          Join this exciting league and compete with players from around the world!
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            {formatNumber(Math.floor(Math.random() * 1000))} members
          </div>
          <Button variant="outline" size="sm">
            View
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
