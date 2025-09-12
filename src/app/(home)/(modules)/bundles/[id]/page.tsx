/* eslint-disable @typescript-eslint/no-explicit-any */
import { Navigation } from "@/home/components/navigation";
import { BundleDetail } from "@/home/components/bundles/bundle-detail";
import { BundleNotFound } from "@/home/components/bundles/bundle-not-found";
import { BundleError } from "@/home/components/bundles/bundle-error";
import { Footer } from "@/home/components/sections/footer";
import { serverApiClient } from "@/lib/server-api";
import React from "react";

export const dynamic = "force-dynamic";

export default async function BundleDetailPage({ params }: { params: any }) {
  const { id } = await params;

  let bundle = null;
  let error = null;
  let isNotFound = false;

  try {
    bundle = await serverApiClient.getBundleById(id);
    console.log(JSON.stringify(bundle));
    if (!bundle) {
      isNotFound = true;
    }
  } catch (err: any) {
    console.error("Error fetching bundle details:", err);
    // Check if it's a 404 error
    if (err?.message?.includes("404") || err?.status === 404) {
      isNotFound = true;
    } else {
      error = err;
    }
  }

  return (
    <>
      <Navigation />
      <div className="pt-16">
        {error ? (
          <BundleError error={error} />
        ) : isNotFound ? (
          <BundleNotFound />
        ) : (
          <BundleDetail bundle={bundle!} />
        )}
      </div>
      <Footer />
    </>
  );
}
