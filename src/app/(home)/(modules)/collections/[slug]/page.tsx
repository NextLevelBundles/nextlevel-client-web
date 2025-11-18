/* eslint-disable @typescript-eslint/no-explicit-any */
import { Navigation } from "@/home/components/navigation";
import { BundleDetail } from "@/home/components/collections/collection-detail";
import { BundleNotFound } from "@/home/components/collections/collection-not-found";
import { BundleError } from "@/home/components/collections/collection-error";
import { Footer } from "@/home/components/sections/footer";
import { serverApiClient } from "@/lib/server-api";
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
}: {
  params: any;
}) {
  const { slug } = await params;

  let bundle = null;
  let error = null;
  let isNotFound = false;

  try {
    bundle = await serverApiClient.getBundleBySlug(slug);
    console.log("Fetched bundle:", bundle);
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
