"use client";

import { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowLeft, 
  Gamepad2, 
  BookOpen, 
  Film, 
  Music, 
  Headphones,
  Monitor,
  Disc,
  Camera,
  Palette,
  Trophy,
  Tv,
  Smartphone
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useTheme } from "next-themes";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Animated Background */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-secondary dark:from-primary/20 dark:via-primary/10 dark:to-secondary/20">
        {/* Logo in top-left corner */}
        <Link href="/" className="absolute top-8 left-8 z-20 cursor-pointer">
          <Image
            src="/logo/digiphile-logo-rectangle-white.svg"
            alt="Digiphile"
            width={180}
            height={60}
            className="w-auto h-12 hover:opacity-90 transition-opacity"
            priority
          />
        </Link>

        {/* Animated shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-white/10 rounded-full mix-blend-overlay filter blur-xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-white/10 rounded-full mix-blend-overlay filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-white/10 rounded-full mix-blend-overlay filter blur-xl animate-blob animation-delay-4000"></div>
        </div>

        {/* Grid pattern overlay - visible in light mode */}
        <div
          className="absolute inset-0 opacity-10 dark:opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.5'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>

        {/* Floating Icons */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Games Icon - Top Left */}
          <div className="absolute top-[15%] left-[10%] animate-float group">
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl shadow-xl transition-all duration-300 hover:bg-white/20 hover:scale-110 hover:shadow-2xl hover:shadow-white/20 cursor-pointer">
              <Gamepad2 className="w-12 h-12 text-white/80 transition-all duration-300 group-hover:text-white group-hover:rotate-6" />
            </div>
          </div>

          {/* Book Icon - Top Right */}
          <div className="absolute top-[20%] right-[15%] animate-float-delayed-1 group">
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl shadow-xl transition-all duration-300 hover:bg-white/20 hover:scale-110 hover:shadow-2xl hover:shadow-white/20 cursor-pointer">
              <BookOpen className="w-10 h-10 text-white/70 transition-all duration-300 group-hover:text-white group-hover:-rotate-3" />
            </div>
          </div>

          {/* Film Icon - Middle Left */}
          <div className="absolute top-[40%] left-[20%] animate-float-delayed-2 group">
            <div className="p-3.5 bg-white/10 backdrop-blur-sm rounded-2xl shadow-xl transition-all duration-300 hover:bg-white/20 hover:scale-110 hover:shadow-2xl hover:shadow-white/20 cursor-pointer">
              <Film className="w-11 h-11 text-white/75 transition-all duration-300 group-hover:text-white group-hover:rotate-6" />
            </div>
          </div>

          {/* Music Icon - Middle Right */}
          <div className="absolute top-[35%] right-[25%] animate-float group">
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl shadow-xl transition-all duration-300 hover:bg-white/20 hover:scale-110 hover:shadow-2xl hover:shadow-white/20 cursor-pointer">
              <Music className="w-9 h-9 text-white/70 transition-all duration-300 group-hover:text-white group-hover:-rotate-6" />
            </div>
          </div>

          {/* Headphones Icon - Bottom Left */}
          <div className="absolute bottom-[30%] left-[15%] animate-float-delayed-1 group">
            <div className="p-3.5 bg-white/10 backdrop-blur-sm rounded-2xl shadow-xl transition-all duration-300 hover:bg-white/20 hover:scale-110 hover:shadow-2xl hover:shadow-white/20 cursor-pointer">
              <Headphones className="w-10 h-10 text-white/75 transition-all duration-300 group-hover:text-white group-hover:rotate-3" />
            </div>
          </div>

          {/* Monitor Icon - Bottom Center */}
          <div className="absolute bottom-[25%] left-[45%] animate-float-delayed-3 group">
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl shadow-xl transition-all duration-300 hover:bg-white/20 hover:scale-110 hover:shadow-2xl hover:shadow-white/20 cursor-pointer">
              <Monitor className="w-11 h-11 text-white/80 transition-all duration-300 group-hover:text-white group-hover:-rotate-3" />
            </div>
          </div>

          {/* Disc Icon - Bottom Right */}
          <div className="absolute bottom-[35%] right-[10%] animate-float-delayed-2 group">
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl shadow-xl transition-all duration-300 hover:bg-white/20 hover:scale-110 hover:shadow-2xl hover:shadow-white/20 cursor-pointer">
              <Disc className="w-10 h-10 text-white/70 transition-all duration-300 group-hover:text-white group-hover:rotate-180" />
            </div>
          </div>

          {/* Camera Icon - Top Center */}
          <div className="absolute top-[25%] left-[50%] animate-float-delayed-3 group">
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl shadow-xl transition-all duration-300 hover:bg-white/20 hover:scale-110 hover:shadow-2xl hover:shadow-white/20 cursor-pointer">
              <Camera className="w-9 h-9 text-white/65 transition-all duration-300 group-hover:text-white group-hover:rotate-6" />
            </div>
          </div>

          {/* Trophy Icon - Middle */}
          <div className="absolute top-[50%] right-[40%] animate-float group">
            <div className="p-3.5 bg-white/10 backdrop-blur-sm rounded-2xl shadow-xl transition-all duration-300 hover:bg-white/20 hover:scale-110 hover:shadow-2xl hover:shadow-white/20 cursor-pointer">
              <Trophy className="w-10 h-10 text-white/75 transition-all duration-300 group-hover:text-white group-hover:-rotate-6" />
            </div>
          </div>

          {/* TV Icon - Lower Left */}
          <div className="absolute bottom-[15%] left-[30%] animate-float-delayed-1 group">
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl shadow-xl transition-all duration-300 hover:bg-white/20 hover:scale-110 hover:shadow-2xl hover:shadow-white/20 cursor-pointer">
              <Tv className="w-9 h-9 text-white/70 transition-all duration-300 group-hover:text-white group-hover:rotate-3" />
            </div>
          </div>

          {/* Palette Icon - Upper Right */}
          <div className="absolute top-[10%] right-[35%] animate-float-delayed-2 group">
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl shadow-xl transition-all duration-300 hover:bg-white/20 hover:scale-110 hover:shadow-2xl hover:shadow-white/20 cursor-pointer">
              <Palette className="w-8 h-8 text-white/65 transition-all duration-300 group-hover:text-white group-hover:-rotate-12" />
            </div>
          </div>

          {/* Smartphone Icon - Lower Right */}
          <div className="absolute bottom-[20%] right-[20%] animate-float-delayed-3 group">
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl shadow-xl transition-all duration-300 hover:bg-white/20 hover:scale-110 hover:shadow-2xl hover:shadow-white/20 cursor-pointer">
              <Smartphone className="w-8 h-8 text-white/70 transition-all duration-300 group-hover:text-white group-hover:rotate-6" />
            </div>
          </div>
        </div>

      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 dark:bg-slate-950">
        <div className="w-full max-w-md space-y-8">
          {/* Logo for mobile */}
          <div className="flex justify-between items-center">
            <Link href="/" className="lg:hidden">
              <Image
                src={
                  theme === "dark"
                    ? "/logo/digiphile-logo-rectangle-white.svg"
                    : "/logo/digiphile-logo-rectangle-regular.svg"
                }
                alt="Digiphile"
                width={180}
                height={60}
                className="w-auto h-10"
                priority
              />
            </Link>
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to home
              </Button>
            </Link>
          </div>

          {/* Header */}
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              {title}
            </h2>
            <p className="text-muted-foreground text-sm">{subtitle}</p>
          </div>

          {/* Form content */}
          {children}
        </div>
      </div>
    </div>
  );
}
