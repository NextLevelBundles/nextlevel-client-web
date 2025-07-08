/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { Navigation } from "@/home/components/navigation";
import { BundleDetail } from "@/home/components/bundles/bundle-detail";
import { Footer } from "@/home/components/sections/footer";
import { Bundle } from "@/app/(shared)/types/bundle";
import React from "react";

function NotFoundError() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
      <h2 className="text-2xl font-bold mb-2">Bundle Not Found</h2>
      <p className="text-muted-foreground">
        The bundle you are looking for does not exist.
      </p>
    </div>
  );
}

function GenericError() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
      <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
      <p className="text-muted-foreground">
        Unable to load bundle details. Please try again later.
      </p>
    </div>
  );
}

export default async function BundleDetailPage({ params }: { params: any }) {
  const { id } = await params;

  let bundleTyped: Bundle | null = null;
  let errorType: "notfound" | "generic" | null = null;

  try {
    const response = await fetch(
      `${process.env.API_URL}/customer/bundles/${id}`
    );
    console.log(response);
    if (response.status === 404) {
      errorType = "notfound";
    } else if (!response.ok) {
      errorType = "generic";
    } else {
      const bundle = await response.json();
      bundleTyped = bundle as Bundle;
    }
  } catch (e) {
    console.error("Error fetching bundle details:", e);
    errorType = "generic";
  }

  return (
    <>
      <Navigation />
      <div className="pt-16">
        {errorType === "notfound" && <NotFoundError />}
        {errorType === "generic" && <GenericError />}
        {!errorType && bundleTyped && <BundleDetail bundle={bundleTyped} />}
      </div>
      <Footer />
    </>
  );
}
