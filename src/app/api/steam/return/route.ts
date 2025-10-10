import { NextRequest, NextResponse } from "next/server";
import openid from "openid";

const baseUrl = process.env.AUTH_URL ?? "";
const returnUrl = `${process.env.AUTH_URL}/api/steam/return`;
const realmUrl = baseUrl;

const relyingParty = new openid.RelyingParty(
  returnUrl,
  realmUrl,
  true, // stateless
  false, // strict mode
  [] // extensions
);

// GET api/steam/return
export async function GET(req: NextRequest) {
  try {
    const steamId = await authenticateSteam(req.url);
    
    // Fetch Steam profile to get country and username
    let steamCountry = null;
    let steamUsername = null;
    try {
      const STEAM_API_KEY = process.env.STEAM_API_KEY;
      if (STEAM_API_KEY) {
        const apiUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_API_KEY}&steamids=${steamId}`;
        const profileRes = await fetch(apiUrl);
        const profileData = await profileRes.json();
        const player = profileData?.response?.players?.[0];
        if (player?.loccountrycode) {
          steamCountry = player.loccountrycode;
        }
        if (player?.personaname) {
          steamUsername = player.personaname;
        }
      }
    } catch (profileError) {
      console.error("Failed to fetch Steam profile for country and username:", profileError);
      // Continue without country/username - not critical
    }

    return new NextResponse(
      `<script>
      console.log("Steam authentication successful, Steam ID:", '${steamId}', "Username:", '${steamUsername || 'unknown'}', "Country:", '${steamCountry || 'unknown'}');
      window.opener?.postMessage({ type: 'STEAM_CONNECT_SUCCESS', steamId: '${steamId}', steamUsername: ${steamUsername ? `'${steamUsername.replace(/'/g, "\\'")}'` : 'null'}, steamCountry: ${steamCountry ? `'${steamCountry}'` : 'null'} }, '*');
      window.close();
    </script>`,
      {
        status: 200,
        headers: { "Content-Type": "text/html" },
      }
    );
  } catch (error) {
    console.error("Steam authentication error:", error);
    return new NextResponse(
      `<script>
        console.error("Steam authentication failed:", ${JSON.stringify(error)});
        window.opener?.postMessage({ type: 'STEAM_CONNECT_FAILURE' }, '*');
        window.close();
      </script>`,
      { status: 500, headers: { "Content-Type": "text/html" } }
    );
  }
}

function authenticateSteam(req: string): Promise<string> {
  return new Promise((resolve, reject) => {
    relyingParty.verifyAssertion(req, (err, result) => {
      if (err || !result?.authenticated) {
        console.log("Steam authentication error:", err);
        return reject("Authentication failed");
      }

      const claimedId = result.claimedIdentifier || "";
      const steamId = claimedId.split("/").pop();

      if (!steamId) {
        return reject("Invalid Steam ID");
      }

      resolve(steamId);
    });
  });
}
