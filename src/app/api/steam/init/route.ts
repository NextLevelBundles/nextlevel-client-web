import { NextResponse } from "next/server";
import openid from "openid";

const baseUrl = process.env.AUTH_URL ?? "";
const returnUrl = `${baseUrl}/api/steam/return`;
const realmUrl = baseUrl;

const relyingParty = new openid.RelyingParty(
  returnUrl,
  realmUrl,
  true, // stateless
  false, // strict mode
  [] // extensions
);

// GET api/steam/init
export async function GET() {
  try {
    const steamOpenIdUrl = await authenticateSteam();
    return NextResponse.redirect(steamOpenIdUrl);
  } catch (error) {
    console.error("Steam authentication error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}

function authenticateSteam(): Promise<string> {
  return new Promise((resolve, reject) => {
    relyingParty.authenticate(
      "https://steamcommunity.com/openid",
      false,
      (err, authUrl) => {
        if (err || !authUrl) {
          reject(new Error("Authentication failed"));
        } else {
          resolve(authUrl);
        }
      }
    );
  });
}
