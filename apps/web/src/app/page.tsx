import Link from "next/link";
import Image from "next/image";
import { SignedIn, SignedOut, SignUpButton } from "@clerk/nextjs";
import {
  Trophy,
  Users,
  Zap,
  Heart,
  Star,
  ArrowRight,
  CheckCircle,
  Sparkles,
  TrendingUp,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const features = [
  {
    icon: Trophy,
    title: "Join Leagues",
    description:
      "Compete in exclusive leagues and challenges created by your favorite influencers.",
  },
  {
    icon: Users,
    title: "Build Community",
    description:
      "Connect with like-minded fans and creators in vibrant communities.",
  },
  {
    icon: Zap,
    title: "Exclusive Content",
    description:
      "Get access to subscriber-only posts, live streams, and behind-the-scenes content.",
  },
  {
    icon: Heart,
    title: "Support Creators",
    description:
      "Subscribe, tip, and directly support the creators you love.",
  },
];

const testimonials = [
  {
    name: "Alex Chen",
    role: "Gaming Creator",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
    content:
      "iLeague transformed how I connect with my community. The league feature is a game-changer!",
  },
  {
    name: "Sarah Williams",
    role: "Fitness Influencer",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    content:
      "Finally a platform that puts creators first. My engagement has never been higher.",
  },
  {
    name: "Marcus Johnson",
    role: "Music Producer",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    content:
      "The subscription model is fair and transparent. Love the direct connection with fans.",
  },
];

const stats = [
  { value: "50K+", label: "Active Creators" },
  { value: "2M+", label: "Community Members" },
  { value: "10K+", label: "Leagues Created" },
  { value: "$5M+", label: "Paid to Creators" },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 lg:py-32">
          {/* Background Gradient */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
          </div>

          <div className="container">
            <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
              <Badge variant="secondary" className="mb-6 gap-2">
                <Sparkles className="h-3 w-3" />
                New: League Competitions are here!
              </Badge>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight mb-6">
                Where{" "}
                <span className="gradient-text">Influencers</span> and{" "}
                <span className="gradient-text">Fans</span> Unite
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8">
                Create leagues, build communities, and monetize your passion.
                iLeague is the ultimate platform for creators and their most
                dedicated fans.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <SignedOut>
                  <SignUpButton mode="modal">
                    <Button variant="gradient" size="xl" className="gap-2">
                      Get Started Free
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </SignUpButton>
                  <Link href="/explore">
                    <Button variant="outline" size="xl">
                      Explore Creators
                    </Button>
                  </Link>
                </SignedOut>
                <SignedIn>
                  <Link href="/dashboard">
                    <Button variant="gradient" size="xl" className="gap-2">
                      Go to Dashboard
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                </SignedIn>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 border-y border-border bg-muted/30">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl md:text-4xl font-display font-bold gradient-text">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 lg:py-32">
          <div className="container">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                Everything You Need to Thrive
              </h2>
              <p className="text-lg text-muted-foreground">
                Powerful features designed for creators and fans alike.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature) => (
                <Card key={feature.title} className="group hover:border-primary/50">
                  <CardContent className="pt-6">
                    <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* For Influencers & Fans Section */}
        <section className="py-20 bg-muted/30">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* For Influencers */}
              <div className="space-y-6">
                <Badge variant="default" className="gap-2">
                  <TrendingUp className="h-3 w-3" />
                  For Creators
                </Badge>
                <h2 className="text-3xl md:text-4xl font-display font-bold">
                  Turn Your Passion Into a Business
                </h2>
                <p className="text-lg text-muted-foreground">
                  Monetize your content, build loyal communities, and create
                  engaging experiences for your fans.
                </p>
                <ul className="space-y-3">
                  {[
                    "Set your own subscription prices",
                    "Keep 90% of your earnings",
                    "Create exclusive leagues and competitions",
                    "Real-time analytics and insights",
                    "Direct messaging with superfans",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-success shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/influencers">
                  <Button variant="gradient" size="lg" className="gap-2">
                    Start Creating
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              {/* For Fans */}
              <div className="space-y-6">
                <Badge variant="secondary" className="gap-2">
                  <Heart className="h-3 w-3" />
                  For Fans
                </Badge>
                <h2 className="text-3xl md:text-4xl font-display font-bold">
                  Get Closer to Your Favorites
                </h2>
                <p className="text-lg text-muted-foreground">
                  Support creators you love, access exclusive content, and
                  compete in exciting leagues.
                </p>
                <ul className="space-y-3">
                  {[
                    "Exclusive subscriber-only content",
                    "Join leagues and win prizes",
                    "Direct interaction with creators",
                    "Early access to new releases",
                    "Community events and meetups",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-success shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/explore">
                  <Button variant="outline" size="lg" className="gap-2">
                    Discover Creators
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 lg:py-32">
          <div className="container">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                Loved by Creators & Fans
              </h2>
              <p className="text-lg text-muted-foreground">
                See what our community has to say about iLeague.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.name} className="relative">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4 mb-4">
                      <Image
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        width={48}
                        height={48}
                        className="rounded-full object-cover"
                      />
                      <div>
                        <div className="font-semibold">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {testimonial.role}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-warning text-warning"
                        />
                      ))}
                    </div>
                    <p className="text-muted-foreground">
                      &ldquo;{testimonial.content}&rdquo;
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-16 border-y border-border bg-muted/30">
          <div className="container">
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Shield className="h-5 w-5" />
                <span className="text-sm font-medium">Secure Payments</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Verified Creators</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Zap className="h-5 w-5" />
                <span className="text-sm font-medium">Instant Payouts</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Heart className="h-5 w-5" />
                <span className="text-sm font-medium">24/7 Support</span>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 lg:py-32">
          <div className="container">
            <div className="relative overflow-hidden rounded-3xl gradient-primary p-8 md:p-16 text-center">
              <div className="relative z-10 max-w-2xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                  Ready to Join the League?
                </h2>
                <p className="text-lg text-white/80 mb-8">
                  Start for free and unlock the full potential of your community.
                </p>
                <SignedOut>
                  <SignUpButton mode="modal">
                    <Button
                      size="xl"
                      className="bg-white text-primary hover:bg-white/90 gap-2"
                    >
                      Create Your Account
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <Link href="/dashboard">
                    <Button
                      size="xl"
                      className="bg-white text-primary hover:bg-white/90 gap-2"
                    >
                      Go to Dashboard
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                </SignedIn>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3" />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
