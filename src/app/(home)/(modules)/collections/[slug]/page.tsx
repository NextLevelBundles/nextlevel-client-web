/* eslint-disable @typescript-eslint/no-explicit-any */
import { Navigation } from "@/home/components/navigation";
import { BundleDetail } from "@/home/components/collections/collection-detail";
import { BundleNotFound } from "@/home/components/collections/collection-not-found";
import { BundleError } from "@/home/components/collections/collection-error";
import { Footer } from "@/home/components/sections/footer";
import { serverApiClient } from "@/lib/server-api";
import { BundleStatus } from "@/app/(shared)/types/bundle";
import React from "react";
import type { Metadata } from "next";

// Use revalidation instead of force-dynamic to ensure metadata is in HTML
export const revalidate = 60; // Revalidate every 60 seconds

export async function generateMetadata({
  params,
}: {
  params: any;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const bundle = await serverApiClient.getBundleBySlug(slug);

    console.log("Bundle", bundle);

    if (!bundle || !bundle.seo) {
      return {
        title: bundle?.title || "Collection Not Found",
        description: bundle?.description || "Collection details",
      };
    }

    return {
      title: bundle.seo.title,
      description: bundle.seo.description,
      keywords: bundle.seo.keywords,
      openGraph: {
        title: bundle.seo.title,
        description: bundle.seo.description,
        url: `https://digiphile.co/collections/${slug}`,
        siteName: "Digiphile",
        images: bundle.seo.image?.url
          ? [
              {
                url: bundle.seo.image.url,
                width: bundle.seo.image.width,
                height: bundle.seo.image.height,
              },
            ]
          : undefined,
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: bundle.seo.title,
        description: bundle.seo.description,
        images: bundle.seo.image?.url ? [bundle.seo.image.url] : undefined,
      },
    };
  } catch {
    return {
      title: "Collection Not Found",
      description: "The collection you are looking for could not be found.",
    };
  }
}

export default async function BundleDetailPage({
  params,
  searchParams,
}: {
  params: any;
  searchParams: any;
}) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const isPreview = resolvedSearchParams?.preview === "1";

  let bundle = null;
  let error = null;

  try {
    bundle = await serverApiClient.getBundleBySlug(slug);
  } catch (err: any) {
    console.error("Error fetching bundle details:", err);
    if (err?.message?.includes("404") || err?.status === 404) {
      bundle = null;
    } else {
      error = err;
    }
  }

  // Determine if bundle should be shown:
  // 1. Bundle must exist
  // 2. Bundle status must be Active
  // 3. Bundle must have started OR the pre-sale must have started
  // Preview mode (?preview=1) overrides checks 2 and 3
  const shouldShowBundle = (() => {
    if (!bundle) return false;
    if (isPreview) return true;

    const isActive = bundle.status === BundleStatus.Active;
    if (!isActive) return false;

    const now = new Date();
    const bundleHasStarted = now >= new Date(bundle.startsAt);
    const saleHasStarted = bundle.sellFrom
      ? now >= new Date(bundle.sellFrom)
      : bundleHasStarted;

    return bundleHasStarted || saleHasStarted;
  })();

  return (
    <>
      <Navigation />
      <div className="pt-16">
        {error ? (
          <BundleError error={error} />
        ) : shouldShowBundle ? (
          <BundleDetail bundle={bundle!} isPreview={isPreview} />
        ) : (
          <BundleNotFound />
        )}
      </div>
      <Footer />
    </>
  );
}
