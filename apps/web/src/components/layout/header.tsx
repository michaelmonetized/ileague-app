"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import {
  Home,
  Compass,
  Trophy,
  Bell,
  Search,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { api } from "@ileague/convex/convex/_generated/api";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/leagues", label: "Leagues", icon: Trophy },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border glass">
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="gradient-primary rounded-lg p-2">
            <Trophy className="h-5 w-5 text-white" />
          </div>
          <span className="font-display text-xl font-bold">iLeague</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <SignedIn>
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    className={cn(
                      "gap-2",
                      isActive && "bg-primary/10 text-primary"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </SignedIn>
        </nav>

        {/* Search Bar (Desktop) */}
        <div className="hidden lg:flex flex-1 max-w-md">
          <SignedIn>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search influencers, leagues..."
                className="pl-10 w-full"
              />
            </div>
          </SignedIn>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Mobile Search Toggle */}
          <SignedIn>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Notifications */}
            <NotificationButton />
          </SignedIn>

          {/* Auth Buttons */}
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button variant="gradient" size="sm">
                Get Started
              </Button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9",
                },
              }}
            />
          </SignedIn>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Search */}
      {searchOpen && (
        <div className="border-t border-border p-4 lg:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search influencers, leagues..."
              className="pl-10 w-full"
              autoFocus
            />
          </div>
        </div>
      )}

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="border-t border-border p-4 md:hidden">
          <SignedIn>
            <div className="flex flex-col gap-2">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-3",
                        isActive && "bg-primary/10 text-primary"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </SignedIn>
        </nav>
      )}
    </header>
  );
}

function NotificationButton() {
  const unreadCount = useQuery(api.notifications.getUnreadCount) ?? 0;

  return (
    <Link href="/notifications">
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-error text-[10px] font-bold text-white flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>
    </Link>
  );
}
