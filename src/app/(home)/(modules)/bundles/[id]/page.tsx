/* eslint-disable @typescript-eslint/no-explicit-any */
import { Navigation } from "@/home/components/navigation";
import { BundleDetail } from "@/home/components/bundles/bundle-detail";
import { BundleNotFound } from "@/home/components/bundles/bundle-not-found";
import { Footer } from "@/home/components/sections/footer";
import { serverApiClient } from "@/lib/server-api";
import React from "react";

export const dynamic = 'force-dynamic';

export default async function BundleDetailPage({ params }: { params: any }) {
  const { id } = await params;

  let bundle = null;
  let hasError = false;

  try {
    bundle = await serverApiClient.getBundleById(id);
  } catch (error) {
    console.error("Error fetching bundle details:", error);
    hasError = true;
  }

  return (
    <>
      <Navigation />
      <div className="pt-16">
        {(!bundle || hasError) ? (
          <BundleNotFound />
        ) : (
          <BundleDetail bundle={bundle} />
        )}
      </div>
      <Footer />
    </>
  );
}