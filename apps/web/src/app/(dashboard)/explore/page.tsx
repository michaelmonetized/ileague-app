"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Filter,
  Users,
  Star,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { api } from "@ileague/convex/convex/_generated/api";
import { CATEGORIES, formatNumber, getInitials, cn } from "@/lib/utils";

export default function ExplorePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const influencers = useQuery(api.users.getInfluencers, {
    category: selectedCategory ?? undefined,
    limit: 20,
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">
            Explore Creators
          </h1>
          <p className="text-muted-foreground mt-1">
            Discover amazing influencers and join their communities.
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search creators..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Categories */}
      <div className="overflow-x-auto -mx-6 px-6 scrollbar-hide">
        <div className="flex gap-2 pb-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            className="shrink-0"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          {CATEGORIES.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              className="shrink-0 gap-2"
              onClick={() => setSelectedCategory(category.id)}
            >
              <span>{category.icon}</span>
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Featured Creators */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Trending Creators
          </h2>
          <Button variant="ghost" size="sm" className="gap-1">
            View All
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {influencers && influencers.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {influencers.map(({ user, profile }) => (
              <CreatorCard
                key={user._id}
                user={user}
                profile={profile}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">No Creators Found</h3>
              <p className="text-muted-foreground">
                {selectedCategory
                  ? "No creators in this category yet. Check back later!"
                  : "Be the first to become a creator on iLeague!"}
              </p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Categories Grid */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Browse by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={cn(
                "p-4 rounded-xl border text-center transition-all hover:border-primary hover:shadow-md",
                selectedCategory === category.id
                  ? "border-primary bg-primary/5"
                  : "border-border"
              )}
            >
              <div className="text-3xl mb-2">{category.icon}</div>
              <div className="text-sm font-medium">{category.name}</div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function CreatorCard({
  user,
  profile,
}: {
  user: any;
  profile: any;
}) {
  return (
    <Link href={`/@${user.username}`}>
      <Card className="overflow-hidden group hover:border-primary/50 transition-colors">
        {/* Cover Image */}
        <div className="h-24 relative bg-gradient-to-br from-primary/20 to-accent/20">
          {profile.coverImageUrl && (
            <Image
              src={profile.coverImageUrl}
              alt=""
              fill
              className="object-cover"
            />
          )}
        </div>

        <CardContent className="pt-0 -mt-8 relative">
          {/* Avatar */}
          <Avatar className="h-16 w-16 border-4 border-card">
            <AvatarImage src={user.imageUrl} alt={user.username} />
            <AvatarFallback className="text-lg">
              {getInitials(profile.displayName)}
            </AvatarFallback>
          </Avatar>

          {/* Info */}
          <div className="mt-3">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold truncate">{profile.displayName}</h3>
              {user.isVerified && (
                <Badge variant="secondary" className="h-5 px-1">
                  <Star className="h-3 w-3 fill-current" />
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">@{user.username}</p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-3 text-sm">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {formatNumber(profile.followerCount)}
              </span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {CATEGORIES.find((c) => c.id === profile.category)?.name ??
                profile.category}
            </Badge>
          </div>

          {/* Tagline */}
          {profile.tagline && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {profile.tagline}
            </p>
          )}

          {/* CTA */}
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-4 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-colors"
          >
            View Profile
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}
