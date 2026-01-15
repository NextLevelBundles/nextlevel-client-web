"use client";

import { useState, useEffect } from "react";
import { Button } from "@/app/(shared)/components/ui/button";
import { Input } from "@/app/(shared)/components/ui/input";
import { Label } from "@/app/(shared)/components/ui/label";
import {
  User,
  MapPin,
  Gamepad2,
  CheckCircle,
  Loader2,
  Check,
  X,
  Info,
  BookOpen,
} from "lucide-react";
import { Card } from "@/app/(shared)/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/(shared)/components/ui/tooltip";
import { cn } from "@/app/(shared)/utils/tailwind";
import SteamConnection from "./steam-connection";
import { useAuth } from "@/app/(shared)/providers/auth-provider";
import { fetchAuthSession } from "aws-amplify/auth";
import { AuthService } from "@/lib/auth/auth-service";
import { apiClient } from "@/lib/api/client-api";
import { useCountries } from "@/hooks/queries/useCountries";
import { Globe, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/app/(shared)/components/ui/alert";
import { CountrySelector } from "./country-selector";

interface FormData {
  name: string;
  handle: string;
  countryCode: string;
  steamId: string | null;
  steamUsername: string | null;
  steamCountry: string | null;
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
  steamUsername?: string;
  steamCountry?: string;
}

interface GeoLocation {
  ip_address: string;
  country: string;
  city: string;
  region: string | null;
  timezone: string;
  is_mobile: boolean;
  is_tablet: boolean;
  is_desktop: boolean;
}

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
  const { user } = useAuth();
  const { data: countries, isLoading: countriesLoading } = useCountries();

  const [currentSection, setCurrentSection] = useState(2);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [steamConnected, setSteamConnected] = useState(false);
  const [steamUserInfo, setSteamUserInfo] = useState<SteamUserInfo | null>(
    null
  );
  const [handleVerified, setHandleVerified] = useState(false);
  const [verifiedHandle, setVerifiedHandle] = useState("");
  const [isCheckingHandle, setIsCheckingHandle] = useState(false);
  const [handleCheckResult, setHandleCheckResult] = useState<boolean | null>(
    null
  );
  const [handleInput, setHandleInput] = useState("");
  const [interestedInSteam, setInterestedInSteam] = useState<boolean | null>(
    null
  );
  const [geoLocationLoading, setGeoLocationLoading] = useState(false);
  const [detectedCountryCode, setDetectedCountryCode] = useState<string | null>(
    null
  );
  const [formData, setFormData] = useState<FormData>({
    name: user?.name || "",
    handle: "",
    countryCode: "",
    steamId: null,
    steamUsername: null,
    steamCountry: null,
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
      name: user?.name || "",
      email: user?.email || "",
      phone: "",
      alternatePhone: null,
    },
  });

  const onSteamInfoReceived = (data: SteamUserInfo) => {
    console.log("[Onboarding Form] Steam info received callback triggered");
    console.log("[Onboarding Form] Steam data:", data);

    setSteamUserInfo(data);
    setSteamConnected(true);

    setFormData((prev) => ({
      ...prev,
      steamId: data.steamId,
      steamUsername: data.steamUsername || null,
      steamCountry: data.steamCountry || null,
    }));

    console.log("[Onboarding Form] Steam connection state updated");
    console.log("[Onboarding Form] steamConnected:", true);
    console.log(
      "[Onboarding Form] Form data updated with Steam ID:",
      data.steamId
    );
  };

  const handleHandleChange = (value: string) => {
    // Convert to lowercase and filter allowed characters
    // Allowed: lowercase letters, numbers, and .-_!@#$%^&*()=+
    const allowedChars = /[a-z0-9.\-_!@#$%^&*()=+]/g;
    const filtered = value
      .toLowerCase()
      .split("")
      .filter((char) => char.match(allowedChars))
      .join("");

    setHandleInput(filtered);
    // If the user changes the handle after verification, reset verification
    if (verifiedHandle && filtered !== verifiedHandle) {
      setHandleVerified(false);
      setVerifiedHandle("");
      setHandleCheckResult(null);
      // Clear the handle from form data until re-verified
      setFormData((prev) => ({
        ...prev,
        handle: "",
      }));
    }
  };

  // Debounced handle availability check
  useEffect(() => {
    if (!handleInput.trim()) {
      setHandleCheckResult(null);
      setIsCheckingHandle(false);
      return;
    }

    // If the current input matches the verified handle, no need to check again
    if (handleInput === verifiedHandle && handleVerified) {
      return;
    }

    setIsCheckingHandle(true);
    setHandleCheckResult(null);

    const timeoutId = setTimeout(async () => {
      try {
        const isAvailable = await apiClient.get<boolean>(
          `/customer/check-handle?handle=${encodeURIComponent(handleInput)}`
        );
        setHandleCheckResult(isAvailable);
        if (isAvailable) {
          setHandleVerified(true);
          setVerifiedHandle(handleInput);
          // Only set the form value if handle is available
          setFormData((prev) => ({
            ...prev,
            handle: handleInput,
          }));
        } else {
          setHandleVerified(false);
          setVerifiedHandle("");
          // Clear form data handle if not available
          setFormData((prev) => ({
            ...prev,
            handle: "",
          }));
        }
      } catch (error) {
        console.error("Error checking handle availability:", error);
        setHandleCheckResult(null);
        setHandleVerified(false);
        setVerifiedHandle("");
        setFormData((prev) => ({
          ...prev,
          handle: "",
        }));
      } finally {
        setIsCheckingHandle(false);
      }
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [handleInput, verifiedHandle, handleVerified]);

  // Fetch user's location based on IP address
  useEffect(() => {
    const fetchGeoLocation = async () => {
      if (!countries || formData.countryCode) return; // Don't fetch if already have a country selected

      setGeoLocationLoading(true);
      try {
        const response = await fetch("https://geo.digiphile.co");
        if (response.ok) {
          const geoData: GeoLocation = await response.json();

          // Find the country in our countries list that matches the geo country code
          const matchedCountry = countries.find(
            (c) => c.id === geoData.country
          );

          if (matchedCountry) {
            setDetectedCountryCode(matchedCountry.id);
            setFormData((prev) => ({
              ...prev,
              countryCode: matchedCountry.id,
              billingAddress: {
                ...prev.billingAddress,
                countryCode: matchedCountry.id,
                country: matchedCountry.name,
              },
            }));
          }
        }
      } catch (error) {
        console.error("Failed to fetch geo location:", error);
      } finally {
        setGeoLocationLoading(false);
      }
    };

    fetchGeoLocation();
  }, [countries]); // Only depend on countries being loaded

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
      await apiClient.post("/customer", formData);

      // Refresh auth tokens after onboarding
      await AuthService.refreshTokens();
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error submitting form:", error);
      // Error toast is already handled by the global error handler in apiClient
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
        console.log(
          handleVerified,
          verifiedHandle,
          handleInput,
          formData.handle,
          formData.steamId
        );
        // If not interested in Steam games, only handle is required
        // If interested in Steam games, both handle and Steam connection are required
        const handleValid =
          handleVerified &&
          verifiedHandle === handleInput &&
          formData.handle === verifiedHandle;
        const steamValid =
          interestedInSteam === false ||
          (interestedInSteam === true && formData.steamId !== null);
        const countryValid = formData.countryCode !== "";
        return handleValid && steamValid && countryValid;
      default:
        return true;
    }
  };

  if (isSubmitted) {
    return (
      <section className="py-12 flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(57,130,245,0.15),transparent_70%),radial-gradient(ellipse_at_bottom,rgba(249,113,20,0.1),transparent_70%)] opacity-30 dark:opacity-40" />
        <div className="container relative px-4 max-w-2xl mx-auto">
          <Card className="p-12 text-center bg-white/90 dark:bg-card/90 backdrop-blur-sm border border-white/20 dark:border-border shadow-xl">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 text-green-500">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h1 className="mb-4 text-3xl font-bold text-foreground">
              You&apos;re all set! 🎉
            </h1>
            <p className="text-muted-foreground mb-8">
              Your account has been successfully created and your profile is
              ready.
              <br />
              Start discovering incredible game and book collections, support
              meaningful causes, and enjoy exclusive deals tailored just for
              you.
            </p>
            <Button
              size="lg"
              className="bg-primary text-white hover:bg-primary/90"
              onClick={() => (window.location.href = "/collections")}
            >
              Explore Collections
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
          <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl text-foreground">
            Welcome to Digiphile!
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Your account has been created - now let’s set up your profile so you
            can start exploring amazing collections.
          </p>
        </div>

        {/* Progress Indicator */}
        {/* <div className="mb-8">
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
            <h2 className="text-xl font-bold text-foreground">
              {formSections[currentSection].title}
            </h2>
            <p className="text-sm text-muted-foreground">
              {formSections[currentSection].description}
            </p>
          </div>
        </div> */}

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
                    <Label
                      htmlFor="billing-country"
                      className="text-sm font-medium"
                    >
                      Country *
                    </Label>
                    <CountrySelector
                      countries={countries}
                      value={formData.billingAddress.countryCode}
                      onChange={(value) => {
                        const country = countries?.find((c) => c.id === value);
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
                      disabled={countriesLoading || geoLocationLoading}
                      placeholder={
                        countriesLoading
                          ? "Loading countries..."
                          : geoLocationLoading
                            ? "Detecting your location..."
                            : "Select your country"
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Gaming Details */}
            {currentSection === 2 && (
              <div className="space-y-6 animate-fade-up">
                <div className="grid gap-4">
                  {/* Interest Selection - Show only if not yet selected */}
                  {interestedInSteam === null && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">
                          What brings you to Digiphile?
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Let us know your interests so we can personalize your
                          experience.
                        </p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <button
                          onClick={() => setInterestedInSteam(true)}
                          className="cursor-pointer p-4 rounded-lg border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-left group"
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                              <Gamepad2 className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold mb-1">
                                Steam Game Collections
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                I'm interested in Steam games. I'll need to
                                connect my Steam account for key allocation.
                              </p>
                            </div>
                          </div>
                        </button>

                        <button
                          onClick={() => setInterestedInSteam(false)}
                          className="cursor-pointer p-4 rounded-lg border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-left group"
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                              <BookOpen className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold mb-1">
                                Book Collections Only
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                I'm only interested in eBook collections. No
                                Steam account needed.
                              </p>
                            </div>
                          </div>
                        </button>
                      </div>

                      <div className="p-3 rounded-lg bg-muted/50 border border-border">
                        <p className="text-xs text-muted-foreground">
                          <Info className="inline h-3 w-3 mr-1" />
                          You can always change this later in your account
                          settings.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Country Selection - Show only after interest selection */}
                  {interestedInSteam !== null && (
                    <div className="space-y-4">
                      <div className="border-2 border-primary/20 dark:border-primary/30 rounded-lg p-4 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 dark:from-primary/10 dark:to-primary/10">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
                            <Globe className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 space-y-3">
                            <div>
                              <h3 className="font-semibold text-base mb-1">
                                Choose Your Region
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {detectedCountryCode &&
                                formData.countryCode === detectedCountryCode ? (
                                  <>
                                    We've automatically detected your location.
                                    This helps us provide you with the best
                                    regional content and pricing.
                                  </>
                                ) : (
                                  <>
                                    Select your country to unlock
                                    region-specific content.
                                  </>
                                )}
                              </p>
                            </div>

                            <div className="space-y-2">
                              <Label
                                htmlFor="country"
                                className="text-sm font-medium flex items-center gap-2"
                              >
                                Country
                                {detectedCountryCode &&
                                  formData.countryCode ===
                                    detectedCountryCode && (
                                    <span className="text-xs text-green-600 dark:text-green-400 font-normal">
                                      ✓ Auto-detected
                                    </span>
                                  )}
                              </Label>
                              <CountrySelector
                                countries={countries}
                                value={formData.countryCode}
                                onChange={(value) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    countryCode: value,
                                  }))
                                }
                                disabled={
                                  countriesLoading || geoLocationLoading
                                }
                                placeholder={
                                  countriesLoading
                                    ? "Loading countries..."
                                    : geoLocationLoading
                                      ? "Detecting your location..."
                                      : "Select your country"
                                }
                              />
                            </div>

                            {/* Country selection warning - always visible */}
                            {detectedCountryCode &&
                            formData.countryCode &&
                            formData.countryCode !== detectedCountryCode ? (
                              <Alert className="border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/10">
                                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                <AlertDescription className="text-xs">
                                  <strong>Please verify your selection:</strong>
                                  {interestedInSteam ? (
                                    <span>
                                      {" "}
                                      Make sure this matches your Steam
                                      account's region. Steam keys are
                                      region-locked and will only work in the
                                      selected country.
                                    </span>
                                  ) : (
                                    <span>
                                      {" "}
                                      Some content may have different
                                      availability in the selected region.
                                    </span>
                                  )}
                                </AlertDescription>
                              </Alert>
                            ) : null}

                            {/* Always show region info */}
                            <div className="flex items-center gap-3 p-4 rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/10">
                              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                              <p className="text-xs text-amber-900 dark:text-amber-100">
                                {interestedInSteam ? (
                                  <>
                                    Your Steam keys will be allocated for this
                                    region. You can change your country once
                                    every 90 days.
                                  </>
                                ) : (
                                  <>
                                    Content availability is optimized for your
                                    region. You can change your country once
                                    every 90 days.
                                  </>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Show handle and Steam sections only after interest selection and country selection */}
                  {interestedInSteam !== null && formData.countryCode && (
                    <>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Label
                            htmlFor="handle"
                            className="text-sm font-medium"
                          >
                            Your preferred username *
                          </Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  type="button"
                                  className="inline-flex items-center justify-center"
                                  aria-label="Username requirements"
                                >
                                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <div className="space-y-2">
                                  <p className="font-medium">
                                    Allowed characters:
                                  </p>
                                  <ul className="text-sm space-y-1">
                                    <li>• Lowercase letters (a-z)</li>
                                    <li>• Numbers (0-9)</li>
                                    <li>
                                      • Special characters: . - _ ! @ # $ % ^ &
                                      * ( ) = +
                                    </li>
                                  </ul>
                                  <p className="text-xs text-muted-foreground mt-2">
                                    All uppercase letters will be automatically
                                    converted to lowercase
                                  </p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>

                        <div className="space-y-3">
                          <div className="relative">
                            <Input
                              id="handle"
                              value={handleInput}
                              onChange={(e) =>
                                handleHandleChange(e.target.value)
                              }
                              placeholder="Choose your username"
                              className="mt-1"
                            />
                            {isCheckingHandle && (
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                              </div>
                            )}
                          </div>

                          <p className="text-xs text-muted-foreground">
                            This will be displayed on your profile
                          </p>

                          {/* Checking indicator */}
                          {isCheckingHandle && (
                            <div className="flex items-center gap-2 text-sm p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>
                                Checking availability for &ldquo;{handleInput}
                                &rdquo;...
                              </span>
                            </div>
                          )}

                          {/* Verification Status Display */}
                          {handleCheckResult !== null && (
                            <div
                              className={cn(
                                "flex items-center gap-2 text-sm p-3 rounded-lg",
                                handleCheckResult
                                  ? "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                                  : "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
                              )}
                            >
                              {handleCheckResult ? (
                                <>
                                  <Check className="h-4 w-4" />
                                  <span>
                                    Handle &ldquo;{verifiedHandle}&rdquo; is
                                    available.
                                  </span>
                                </>
                              ) : (
                                <>
                                  <X className="h-4 w-4" />
                                  <span>
                                    Handle &ldquo;{handleInput}&rdquo; is
                                    already taken. Please try another one.
                                  </span>
                                </>
                              )}
                            </div>
                          )}

                          {verifiedHandle && verifiedHandle !== handleInput && (
                            <div className="flex items-center gap-2 text-sm p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800">
                              <X className="h-4 w-4" />
                              <span>
                                Handle has been modified. Please verify the new
                                handle to continue.
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Steam Integration Section - Only show if interested in Steam games */}
                      {interestedInSteam === true && (
                        <SteamConnection
                          steamConnected={steamConnected}
                          steamUserInfo={steamUserInfo}
                          onSteamInfoReceived={onSteamInfoReceived}
                        />
                      )}

                      {/* Show success message for book-only users */}
                      {interestedInSteam === false && (
                        <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                          <div className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
                            <div className="text-sm">
                              <p className="font-medium text-green-700 dark:text-green-300">
                                Great! You're all set for book collections.
                              </p>
                              <p className="text-green-600 dark:text-green-400">
                                You can start exploring our eBook collections
                                right away. If you decide to purchase Steam
                                games later, you can connect your Steam account
                                anytime from your account settings.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-border">
            {/* <Button
              variant="outline"
              onClick={prevSection}
              disabled={currentSection === 0}
              className="hover:bg-muted"
            >
              Previous
            </Button> */}

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
                      Creating Profile...
                    </>
                  ) : (
                    "Create Profile"
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
