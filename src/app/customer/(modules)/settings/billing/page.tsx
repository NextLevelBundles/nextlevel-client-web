"use client";

import { useState, useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/shared/utils/tailwind";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Loader2, CreditCardIcon, SaveIcon } from "lucide-react";
import { toast } from "sonner";
import {
  useCountries,
  useCustomer,
  useUpdateBillingAddress,
} from "@/hooks/queries";
import { ClientApiError } from "@/lib/api/client-appi";
import { BillingAddress } from "@/lib/api/types/user";
import { Country } from "@/lib/api/types/common";

export default function BillingAddressPage() {
  const [countryPopoverOpen, setCountryPopoverOpen] = useState(false);
  const [formData, setFormData] = useState<BillingAddress>({
    addressLine1: "",
    addressLine2: "",
    locality: "",
    state: "",
    postalCode: "",
    country: "",
    countryCode: "",
  });
  const [errors, setErrors] = useState<Partial<BillingAddress>>({});

  // Use TanStack Query hooks
  const {
    data: countries = [],
    isLoading: isLoadingCountries,
    error: countriesError,
  } = useCountries();

  const {
    data: customer,
    isLoading: isLoadingCustomer,
    error: customerError,
  } = useCustomer();

  const updateBillingAddressMutation = useUpdateBillingAddress();

  // Initialize form data when customer data is loaded
  useEffect(() => {
    if (customer?.billingAddress) {
      setFormData(customer.billingAddress);
    }
  }, [customer]);

  // Handle loading states
  const isLoading = isLoadingCountries || isLoadingCustomer;

  // Handle errors
  useEffect(() => {
    if (countriesError) {
      console.error("Error loading countries:", countriesError);
      if (countriesError instanceof ClientApiError) {
        toast.error(`Failed to load countries: ${countriesError.message}`);
      } else {
        toast.error("Failed to load countries. Please try again.");
      }
    }
  }, [countriesError]);

  useEffect(() => {
    if (customerError) {
      console.error("Error loading customer:", customerError);
      if (customerError instanceof ClientApiError) {
        toast.error(`Failed to load customer data: ${customerError.message}`);
      } else {
        toast.error("Failed to load customer data. Please try again.");
      }
    }
  }, [customerError]);

  const validateForm = (): boolean => {
    const newErrors: Partial<BillingAddress> = {};

    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = "Address line 1 is required";
    }

    if (!formData.locality.trim()) {
      newErrors.locality = "City is required";
    }

    if (!formData.postalCode.trim()) {
      newErrors.postalCode = "Postal code is required";
    }

    if (!formData.country.trim()) {
      newErrors.country = "Country is required";
    }

    if (!formData.countryCode.trim()) {
      newErrors.countryCode = "Country code is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the validation errors before submitting");
      return;
    }

    try {
      await updateBillingAddressMutation.mutateAsync(formData);
      toast.success("Billing address updated successfully");
    } catch (error) {
      console.error("Error updating billing address:", error);
      if (error instanceof ClientApiError) {
        toast.error(`Failed to update billing address: ${error.message}`);
      } else {
        toast.error("Failed to update billing address. Please try again.");
      }
    }
  };

  const updateFormData = (field: keyof BillingAddress, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when field is updated
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">
          Loading billing address...
        </p>
      </div>
    );
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCardIcon className="h-5 w-5" />
            Billing Address
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="addressLine1" className="text-sm font-medium">
                  Address Line 1 *
                </Label>
                <Input
                  id="addressLine1"
                  value={formData.addressLine1}
                  onChange={(e) =>
                    updateFormData("addressLine1", e.target.value)
                  }
                  placeholder="Street address"
                  className={`mt-1 ${errors.addressLine1 ? "border-red-500" : ""}`}
                />
                {errors.addressLine1 && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.addressLine1}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="addressLine2" className="text-sm font-medium">
                  Address Line 2
                </Label>
                <Input
                  id="addressLine2"
                  value={formData.addressLine2}
                  onChange={(e) =>
                    updateFormData("addressLine2", e.target.value)
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
                    value={formData.locality}
                    onChange={(e) => updateFormData("locality", e.target.value)}
                    placeholder="City"
                    className={`mt-1 ${errors.locality ? "border-red-500" : ""}`}
                  />
                  {errors.locality && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.locality}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="state" className="text-sm font-medium">
                    State/Province
                  </Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => updateFormData("state", e.target.value)}
                    placeholder="State"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="postalCode" className="text-sm font-medium">
                    Postal Code *
                  </Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) =>
                      updateFormData("postalCode", e.target.value)
                    }
                    placeholder="12345"
                    className={`mt-1 ${errors.postalCode ? "border-red-500" : ""}`}
                  />
                  {errors.postalCode && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.postalCode}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="country" className="text-sm font-medium">
                  Country *
                </Label>
                <Popover
                  open={countryPopoverOpen}
                  onOpenChange={setCountryPopoverOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={countryPopoverOpen}
                      className="w-full justify-between mt-1"
                    >
                      {formData.countryCode ? (
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {
                              countries.find(
                                (c: Country) => c.id === formData.countryCode
                              )?.flag
                            }
                          </span>
                          <span>{formData.country}</span>
                        </div>
                      ) : (
                        "Select your country"
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search countries..." />
                      <CommandList>
                        <CommandEmpty>No country found.</CommandEmpty>
                        <CommandGroup>
                          {countries.map((country: Country) => (
                            <CommandItem
                              key={country.id}
                              value={`${country.name} ${country.flag}`}
                              onSelect={() => {
                                updateFormData("countryCode", country.id);
                                updateFormData("country", country.name);
                                setCountryPopoverOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.countryCode === country.id
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{country.flag}</span>
                                <span>{country.name}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {errors.country && (
                  <p className="mt-1 text-sm text-red-600">{errors.country}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button
                type="submit"
                disabled={updateBillingAddressMutation.isPending}
                className="bg-primary text-white hover:bg-primary/90"
              >
                {updateBillingAddressMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <SaveIcon className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
