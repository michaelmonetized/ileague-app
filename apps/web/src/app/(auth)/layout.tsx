import { Trophy } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary flex-col justify-between p-12 relative overflow-hidden">
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <span className="font-display text-2xl font-bold text-white">
              iLeague
            </span>
          </Link>
        </div>

        <div className="relative z-10 space-y-4">
          <h1 className="text-4xl font-display font-bold text-white">
            Join the League of Champions
          </h1>
          <p className="text-lg text-white/80 max-w-md">
            Connect with influencers, compete in leagues, and be part of
            something extraordinary.
          </p>
        </div>

        <div className="relative z-10 text-sm text-white/60">
          © {new Date().getFullYear()} iLeague. All rights reserved.
        </div>

        {/* Decorative circles */}
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-1/2" />
        <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2" />
      </div>

      {/* Right side - Auth form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="gradient-primary rounded-lg p-2">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <span className="font-display text-xl font-bold">iLeague</span>
            </Link>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
