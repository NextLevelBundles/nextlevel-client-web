"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/(shared)/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function BlockedCountryPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Service Unavailable
          </CardTitle>
          <CardDescription className="text-base mt-2">
            We&apos;re sorry, but our service is not available in your region.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Due to regulatory restrictions, we are unable to provide our
            services in certain countries.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            We apologize for any inconvenience this may cause.
          </p>
          <div className="pt-4 border-t">
            <p className="text-xs text-gray-500 dark:text-gray-500">
              If you believe you&apos;re seeing this message in error, please
              contact our support team.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
