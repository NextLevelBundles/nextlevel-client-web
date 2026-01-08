import { NextRequest, NextResponse } from "next/server";
import { serverApiClient } from "@/lib/server-api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bundleId: string }> }
) {
  try {
    const { bundleId } = await params;

    // Fetch bundle by ID from the backend
    const bundle = await serverApiClient.getBundleById(bundleId);

    if (!bundle) {
      return NextResponse.json(
        { error: "Bundle not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(bundle);
  } catch (error) {
    console.error("Error fetching bundle:", error);
    return NextResponse.json(
      { error: "Failed to fetch bundle" },
      { status: 500 }
    );
  }
}
