"use client";

import { useState, useEffect } from "react";
import { Button } from "@/app/(shared)/components/ui/button";
import { Input } from "@/app/(shared)/components/ui/input";
import { Label } from "@/app/(shared)/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/(shared)/components/ui/select";
import { User, MapPin, Gamepad2, CheckCircle, Loader2 } from "lucide-react";
import { Card } from "@/app/(shared)/components/ui/card";
import { cn } from "@/app/(shared)/utils/tailwind";
import Image from "next/image";

interface FormData {
  name: string;
  handle: string;
  steamId: string | null;
  billingAddress: {
    addressLine1: string;
    addressLine2: string;
    locality: string;
    state: string;
    postalCode: string;
    country: string;
    countryCode: string;
  };
  contact: {
    name: string;
    email: string;
    phone: string;
    alternatePhone: string | null;
  };
}

const countries = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "AU", name: "Australia" },
  { code: "JP", name: "Japan" },
  { code: "BR", name: "Brazil" },
  { code: "IN", name: "India" },
  { code: "MX", name: "Mexico" },
];

const formSections = [
  {
    id: "profile",
    title: "Profile & Contact",
    description:
      "Help us personalize your experience and get in touch if needed.",
    icon: User,
    color: "from-primary/20 to-primary/10",
  },
  {
    id: "billing",
    title: "Billing Address",
    description:
      "This is where we’ll send purchase receipts and any official communication.",
    icon: MapPin,
    color: "from-secondary/20 to-secondary/10",
  },
  {
    id: "gaming",
    title: "Gaming Details",
    description: "Connect your Steam account for a personalized experience",
    icon: Gamepad2,
    color: "from-primary/20 to-primary/10",
  },
];

export function OnboardingForm() {
  const [currentSection, setCurrentSection] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [steamConnected, setSteamConnected] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [steamUserInfo, setSteamUserInfo] = useState<any>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    handle: "",
    steamId: null,
    billingAddress: {
      addressLine1: "",
      addressLine2: "",
      locality: "",
      state: "",
      postalCode: "",
      country: "",
      countryCode: "",
    },
    contact: {
      name: "",
      email: "",
      phone: "",
      alternatePhone: null,
    },
  });

  // Listen for Steam authentication messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "STEAM_AUTH_SUCCESS") {
        setSteamConnected(true);
        setSteamUserInfo(event.data.userInfo);
        setFormData((prev) => ({
          ...prev,
          steamId: event.data.steamId,
        }));
      } else if (event.data.type === "STEAM_AUTH_ERROR") {
        console.error("Steam auth error:", event.data.error);
        // You could show an error message here
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const updateFormData = (
    section: keyof FormData,
    field: string,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]:
        typeof prev[section] === "object"
          ? { ...prev[section], [field]: value }
          : value,
    }));
  };

  const updateNestedFormData = (
    section: "billingAddress" | "contact",
    field: string,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  // Auto-sync contact name with full name
  const updateName = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      name: value,
      contact: {
        ...prev.contact,
        name: value,
      },
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const submitData = {
        ...formData,
        steamId: formData.steamId, // Now includes actual Steam ID if connected
        contact: {
          ...formData.contact,
          alternatePhone: null, // Always null as requested
        },
      };

      const response = await fetch(
        "https://api.nextlevelbundle.com/api/customer",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(submitData),
        }
      );

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        throw new Error("Failed to submit form");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      // Handle error (you might want to show an error message)
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextSection = () => {
    if (currentSection < formSections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const isCurrentSectionValid = () => {
    switch (currentSection) {
      case 0: // Profile & Contact
        return (
          formData.name.trim() !== "" && formData.contact.email.trim() !== ""
        );
      case 1: // Billing
        return (
          formData.billingAddress.addressLine1.trim() !== "" &&
          formData.billingAddress.locality.trim() !== "" &&
          formData.billingAddress.country.trim() !== ""
        );
      case 2: // Gaming
        return formData.handle.trim() !== "";
      default:
        return true;
    }
  };

  if (isSubmitted) {
    return (
      <section className="relative py-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(57,130,245,0.15),transparent_70%),radial-gradient(ellipse_at_bottom,rgba(249,113,20,0.1),transparent_70%)] opacity-30 dark:opacity-40" />
        <div className="container relative px-4 max-w-2xl mx-auto">
          <Card className="p-12 text-center bg-white/90 dark:bg-card/90 backdrop-blur-sm border border-white/20 dark:border-border shadow-xl">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 text-green-500">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h1 className="font-orbitron mb-4 text-3xl font-bold text-foreground">
              Welcome to Digiphile!
            </h1>
            <p className="text-muted-foreground mb-8">
              Your account has been successfully created. You can now start
              exploring our amazing game bundles and supporting great causes.
            </p>
            <Button
              size="lg"
              className="bg-primary text-white hover:bg-primary/90"
              onClick={() => (window.location.href = "/bundles")}
            >
              Explore Bundles
            </Button>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-12">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(57,130,245,0.15),transparent_70%),radial-gradient(ellipse_at_bottom,rgba(249,113,20,0.1),transparent_70%)] opacity-30 dark:opacity-40" />
      <div className="container relative px-4 max-w-4xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="font-orbitron mb-4 text-3xl font-bold tracking-tight md:text-4xl text-foreground">
            Welcome to Digiphile!
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Your account has been created — now let’s set up your profile so you
            can start exploring amazing game bundles.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {formSections.map((section, index) => (
              <div key={section.id} className="flex items-center">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all",
                    index <= currentSection
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-background text-muted-foreground"
                  )}
                >
                  <section.icon className="h-5 w-5" />
                </div>
                {index < formSections.length - 1 && (
                  <div
                    className={cn(
                      "h-0.5 w-24 mx-2 transition-all",
                      index < currentSection ? "bg-primary" : "bg-border"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h2 className="font-rajdhani text-xl font-bold text-foreground">
              {formSections[currentSection].title}
            </h2>
            <p className="text-sm text-muted-foreground">
              {formSections[currentSection].description}
            </p>
          </div>
        </div>

        <Card className="p-8 bg-white/90 dark:bg-card/90 backdrop-blur-sm border border-white/20 dark:border-border shadow-xl">
          <div className="space-y-6">
            {/* Profile & Contact Information */}
            {currentSection === 0 && (
              <div className="space-y-6 animate-fade-up">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium">
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => updateName(e.target.value)}
                      placeholder="Enter your full name"
                      className="mt-1"
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email Address *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.contact.email}
                        onChange={(e) =>
                          updateNestedFormData(
                            "contact",
                            "email",
                            e.target.value
                          )
                        }
                        placeholder="your@email.com"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-sm font-medium">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.contact.phone}
                        onChange={(e) =>
                          updateNestedFormData(
                            "contact",
                            "phone",
                            e.target.value
                          )
                        }
                        placeholder="+1 (555) 123-4567"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Billing Address */}
            {currentSection === 1 && (
              <div className="space-y-6 animate-fade-up">
                <div className="grid gap-4">
                  <div>
                    <Label
                      htmlFor="addressLine1"
                      className="text-sm font-medium"
                    >
                      Address Line 1 *
                    </Label>
                    <Input
                      id="addressLine1"
                      value={formData.billingAddress.addressLine1}
                      onChange={(e) =>
                        updateNestedFormData(
                          "billingAddress",
                          "addressLine1",
                          e.target.value
                        )
                      }
                      placeholder="Street address"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="addressLine2"
                      className="text-sm font-medium"
                    >
                      Address Line 2
                    </Label>
                    <Input
                      id="addressLine2"
                      value={formData.billingAddress.addressLine2}
                      onChange={(e) =>
                        updateNestedFormData(
                          "billingAddress",
                          "addressLine2",
                          e.target.value
                        )
                      }
                      placeholder="Apartment, suite, etc."
                      className="mt-1"
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <Label htmlFor="locality" className="text-sm font-medium">
                        City *
                      </Label>
                      <Input
                        id="locality"
                        value={formData.billingAddress.locality}
                        onChange={(e) =>
                          updateNestedFormData(
                            "billingAddress",
                            "locality",
                            e.target.value
                          )
                        }
                        placeholder="City"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state" className="text-sm font-medium">
                        State/Province
                      </Label>
                      <Input
                        id="state"
                        value={formData.billingAddress.state}
                        onChange={(e) =>
                          updateNestedFormData(
                            "billingAddress",
                            "state",
                            e.target.value
                          )
                        }
                        placeholder="State"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="postalCode"
                        className="text-sm font-medium"
                      >
                        Postal Code
                      </Label>
                      <Input
                        id="postalCode"
                        value={formData.billingAddress.postalCode}
                        onChange={(e) =>
                          updateNestedFormData(
                            "billingAddress",
                            "postalCode",
                            e.target.value
                          )
                        }
                        placeholder="12345"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="country" className="text-sm font-medium">
                      Country *
                    </Label>
                    <Select
                      value={formData.billingAddress.countryCode}
                      onValueChange={(value) => {
                        const country = countries.find((c) => c.code === value);
                        if (country) {
                          updateNestedFormData(
                            "billingAddress",
                            "countryCode",
                            value
                          );
                          updateNestedFormData(
                            "billingAddress",
                            "country",
                            country.name
                          );
                        }
                      }}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Gaming Details */}
            {currentSection === 2 && (
              <div className="space-y-6 animate-fade-up">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="handle" className="text-sm font-medium">
                      Gaming Handle *
                    </Label>
                    <Input
                      id="handle"
                      value={formData.handle}
                      onChange={(e) =>
                        updateFormData("handle", "", e.target.value)
                      }
                      placeholder="Your preferred gaming username"
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      This will be displayed on your profile and leaderboards
                    </p>
                  </div>

                  {/* Steam Integration Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Gamepad2 className="h-5 w-5 text-primary" />
                      <Label className="text-base font-medium">
                        Steam Account Integration
                      </Label>
                    </div>

                    <div
                      className="group relative p-6 bg-gradient-to-br from-primary/5 to-secondary/5 dark:from-primary/10 dark:to-secondary/10 rounded-xl border border-primary/20 dark:border-primary/30 hover:border-primary/40 dark:hover:border-primary/50 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-primary/20 dark:hover:shadow-primary/30"
                      onClick={() => {
                        if (!steamConnected) {
                          // Initiate the Steam OpenID flow
                          window.open(
                            "/auth/steam",
                            "_blank",
                            "width=800,height=600,scrollbars=yes,resizable=yes"
                          );
                        }
                      }}
                    >
                      {steamConnected ? (
                        // Connected State
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-xl bg-green-500/20 text-green-500">
                            <svg
                              className="h-8 w-8"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-rajdhani text-lg font-bold text-green-600 dark:text-green-400 mb-2">
                              Steam Account Connected!
                            </h3>
                            {steamUserInfo && (
                              <div className="flex items-center gap-3 mb-3">
                                <Image
                                  src={steamUserInfo.avatar}
                                  alt="Steam Avatar"
                                  width={32}
                                  height={32}
                                  className="w-8 h-8 rounded-full"
                                />
                                <span className="font-medium text-foreground">
                                  {steamUserInfo.personaname}
                                </span>
                              </div>
                            )}
                            <p className="text-sm text-muted-foreground">
                              Your Steam account is now linked and ready for
                              automatic game delivery.
                            </p>
                          </div>
                          <div className="flex flex-col items-center gap-2">
                            <div className="p-2 rounded-lg bg-green-500/20">
                              <svg
                                className="h-6 w-6 text-green-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                            <span className="text-xs font-medium text-green-500">
                              Connected
                            </span>
                          </div>
                        </div>
                      ) : (
                        // Not Connected State
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary group-hover:scale-110 transition-transform duration-300">
                            <svg
                              className="h-8 w-8"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.19 0 2.34-.21 3.41-.6.3-.11.49-.4.49-.72 0-.43-.35-.78-.78-.78-.15 0-.29.04-.42.11-.86.31-1.79.47-2.7.47-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8c0 .91-.16 1.84-.47 2.7-.07.13-.11.27-.11.42 0 .43.35.78.78.78.32 0 .61-.19.72-.49.39-1.07.6-2.22.6-3.41 0-5.52-4.48-10-10-10zm0 6c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-rajdhani text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                              Connect Your Steam Account
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                              Link your Steam account to automatically receive
                              game keys, sync your library, and get personalized
                              recommendations based on your gaming preferences.
                            </p>

                            <div className="space-y-3">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                <span>
                                  Automatic game key delivery to your Steam
                                  library
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                <span>Personalized bundle recommendations</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                <span>
                                  Track your gaming achievements and stats
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-center gap-2">
                            <div className="p-2 rounded-lg bg-white/50 dark:bg-muted/50 group-hover:bg-white/70 dark:group-hover:bg-muted/70 transition-colors">
                              <svg
                                className="h-6 w-6 text-primary"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                                />
                              </svg>
                            </div>
                            <span className="text-xs font-medium text-primary">
                              Click to Connect
                            </span>
                          </div>
                        </div>
                      )}

                      <div
                        className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-xl ${
                          steamConnected
                            ? "from-green-500/50 via-green-400/50 to-green-500/50"
                            : "from-primary/50 via-secondary/50 to-primary/50"
                        }`}
                      />
                    </div>

                    {!steamConnected && (
                      <>
                        <div className="bg-muted/30 dark:bg-muted/20 rounded-lg p-4 border border-border/50">
                          <div className="flex items-start gap-3">
                            <div className="p-1.5 rounded-full bg-blue-500/20 text-blue-500 mt-0.5">
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-foreground mb-1">
                                How Steam Integration Works
                              </h4>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                We use Steam&apos;s secure OpenID authentication
                                system. You&apos;ll be redirected to
                                Steam&apos;s official login page where you can
                                safely authorize our app. We only access your
                                public profile information and game library - we
                                never see your Steam password or personal
                                details.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">
                            Steam integration is optional but recommended for
                            the best experience
                          </p>
                        </div>
                      </>
                    )}

                    {steamConnected && (
                      <div className="text-center">
                        <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                          ✅ Steam account successfully connected and ready for
                          game delivery
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={prevSection}
              disabled={currentSection === 0}
              className="hover:bg-muted"
            >
              Previous
            </Button>

            <div className="flex gap-2">
              {currentSection < formSections.length - 1 ? (
                <Button
                  onClick={nextSection}
                  disabled={!isCurrentSectionValid()}
                  className="bg-primary text-white hover:bg-primary/90"
                >
                  Continue
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!isCurrentSectionValid() || isSubmitting}
                  className="bg-primary text-white hover:bg-primary/90"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
