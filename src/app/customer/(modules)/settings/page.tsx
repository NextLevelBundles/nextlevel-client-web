"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/(shared)/components/ui/card";
import { Button } from "@/app/(shared)/components/ui/button";
import { Alert, AlertDescription } from "@/app/(shared)/components/ui/alert";
import { useCustomer } from "@/hooks/queries/useCustomer";
import { useCountries } from "@/hooks/queries/useCountries";
import { userApi } from "@/lib/api";
import { toast } from "sonner";
import {
  Loader2,
  Info,
  Globe,
  Calendar,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { customerQueryKey } from "@/hooks/queries/useCustomer";
import { customerLocationQueryKey } from "@/hooks/queries/useCustomerLocation";
import { CountrySelector } from "@/app/onboarding/components/country-selector";
import { format, addDays, differenceInDays, isPast } from "date-fns";

export default function GeneralSettingsPage() {
  const { data: customer, isLoading: customerLoading } = useCustomer();
  const { data: countries, isLoading: countriesLoading } = useCountries();
  const queryClient = useQueryClient();
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showEditMode, setShowEditMode] = useState(false);

  // Calculate when the user can next change their country
  const getNextChangeDate = () => {
    if (!customer?.countryLastChangedAt) {
      return null; // Never changed, can change now
    }
    const lastChanged = new Date(customer.countryLastChangedAt);
    return addDays(lastChanged, 90);
  };

  const canChangeCountry = () => {
    const nextChangeDate = getNextChangeDate();
    if (!nextChangeDate) return true;
    return isPast(nextChangeDate);
  };

  const getDaysUntilChange = () => {
    const nextChangeDate = getNextChangeDate();
    if (!nextChangeDate) return 0;
    const days = differenceInDays(nextChangeDate, new Date());
    return Math.max(0, days);
  };

  const handleCountryUpdate = async () => {
    if (!selectedCountry || selectedCountry === customer?.countryCode) {
      toast.error("Please select a different country");
      return;
    }

    setIsUpdating(true);
    try {
      await userApi.updateCountry(selectedCountry);

      // Invalidate and refetch customer data and location data
      await queryClient.invalidateQueries({ queryKey: customerQueryKey });
      await queryClient.invalidateQueries({
        queryKey: customerLocationQueryKey,
      });

      toast.success("Country updated successfully!", {
        description:
          "Your region has been updated. This will affect future content and pricing.",
      });

      setShowEditMode(false);
      setSelectedCountry("");
    } catch (error) {
      console.error("Failed to update country:", error);
      toast.error("Failed to update country", {
        description:
          "Please try again or contact support if the issue persists.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const currentCountry = countries?.find((c) => c.id === customer?.countryCode);

  if (customerLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Country Settings
          </CardTitle>
          <CardDescription>
            Manage your regional preferences and content availability
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showEditMode ? (
            <>
              {/* Current Country Display */}
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        Current Country
                      </p>
                      <div className="flex items-center gap-2">
                        {currentCountry && (
                          <>
                            <span className="text-xl">
                              {currentCountry.flag}
                            </span>
                            <span className="text-lg font-medium">
                              {currentCountry.name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {customer?.countryLastChangedAt && (
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Last changed:{" "}
                          {format(
                            new Date(customer.countryLastChangedAt),
                            "MMMM d, yyyy"
                          )}
                        </p>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => {
                      setSelectedCountry(customer?.countryCode || "");
                      setShowEditMode(true);
                    }}
                    disabled={!canChangeCountry()}
                    variant={canChangeCountry() ? "outline" : "secondary"}
                  >
                    {canChangeCountry()
                      ? "Change Country"
                      : `Available in ${getDaysUntilChange()} days`}
                  </Button>
                </div>

                {/* Information Alerts */}
                {!canChangeCountry() && (
                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                      You can change your country again on{" "}
                      <strong>
                        {getNextChangeDate() &&
                          format(getNextChangeDate()!, "MMMM d, yyyy")}
                      </strong>{" "}
                      ({getDaysUntilChange()} days remaining).
                    </AlertDescription>
                  </Alert>
                )}

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Your country setting determines:
                    <ul className="mt-2 ml-4 list-disc text-xs space-y-1">
                      <li>Steam key region allocation for game bundles</li>
                      <li>Content availability</li>
                      <li>Regional offers and promotions</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>
            </>
          ) : (
            <>
              {/* Edit Mode */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Select New Country
                  </label>
                  <CountrySelector
                    countries={countries}
                    value={selectedCountry}
                    onChange={setSelectedCountry}
                    disabled={countriesLoading || isUpdating}
                    placeholder="Select a country"
                  />
                </div>

                {selectedCountry &&
                  selectedCountry !== customer?.countryCode && (
                    <Alert className="border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/10">
                      <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      <AlertDescription className="text-sm">
                        <strong>Important:</strong>
                        <ul className="mt-2 ml-4 list-disc space-y-1">
                          <li>This change will affect all future purchases</li>
                          <li>
                            Steam keys will be allocated for the new region
                          </li>
                          <li>
                            You can only change your country once every 90 days
                          </li>
                          <li>
                            Make sure this matches your actual location and
                            Steam account region
                          </li>
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                <div className="flex gap-2">
                  <Button
                    onClick={handleCountryUpdate}
                    disabled={
                      !selectedCountry ||
                      selectedCountry === customer?.countryCode ||
                      isUpdating
                    }
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Country"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowEditMode(false);
                      setSelectedCountry("");
                    }}
                    disabled={isUpdating}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
