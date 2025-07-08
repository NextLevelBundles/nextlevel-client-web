"use client";

import { useState } from "react";
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
import SteamConnection from "./steam-connection";

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

export interface SteamUserInfo {
  steamId: string;
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
    description: "Set your Digiphile handle and connect your Steam account.",
    icon: Gamepad2,
    color: "from-primary/20 to-primary/10",
  },
];

export function OnboardingForm() {
  const [currentSection, setCurrentSection] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [steamConnected, setSteamConnected] = useState(false);
  const [steamUserInfo, setSteamUserInfo] = useState<SteamUserInfo | null>(
    null
  );
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

  const onSteamInfoReceived = (data: SteamUserInfo) => {
    setSteamUserInfo(data);
    setSteamConnected(true);

    setFormData((prev) => ({
      ...prev,
      steamId: data.steamId,
    }));
  };

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
                  <SteamConnection
                    steamConnected={steamConnected}
                    steamUserInfo={steamUserInfo}
                    onSteamInfoReceived={onSteamInfoReceived}
                  />
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
