import { NextRequest, NextResponse } from "next/server";

/**
 * Fetches Mailchimp API key from remote configuration endpoint
 * This is a security pattern to avoid storing API keys in environment variables
 */
async function getMailchimpApiKey(): Promise<string | null> {
  try {
    const response = await fetch("https://api.digiphile.co/api/mailchimp/config");
    if (!response.ok) {
      console.error("Failed to fetch Mailchimp API key");
      return null;
    }
    const data = await response.json();
    return data.apiKey || null;
  } catch (error) {
    console.error("Error fetching Mailchimp API key:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate email
    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    // Get configuration from environment variables
    const AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID;
    const SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX;

    if (!AUDIENCE_ID || !SERVER_PREFIX) {
      console.error("Missing Mailchimp configuration");
      return NextResponse.json(
        { error: "Newsletter service is not configured" },
        { status: 500 }
      );
    }

    // Fetch API key dynamically from remote endpoint
    const API_KEY = await getMailchimpApiKey();
    if (!API_KEY) {
      console.error("Failed to retrieve Mailchimp API key");
      return NextResponse.json(
        { error: "Newsletter service is temporarily unavailable" },
        { status: 500 }
      );
    }

    // Mailchimp API v3.0 endpoint
    const url = `https://${SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${AUDIENCE_ID}/members`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: email,
        status: "subscribed",
        tags: ["coming-soon", "early-access"],
        merge_fields: {
          SOURCE: "Coming Soon Page",
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle "Member Exists" error gracefully (return success)
      if (data.title === "Member Exists") {
        return NextResponse.json(
          { message: "You're already subscribed to our newsletter!" },
          { status: 200 }
        );
      }

      console.error("Mailchimp error:", data);
      return NextResponse.json(
        { error: data.detail || "Failed to subscribe. Please try again." },
        { status: response.status }
      );
    }

    return NextResponse.json(
      { message: "Successfully subscribed!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
