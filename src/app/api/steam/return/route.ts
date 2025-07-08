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

    return new NextResponse(
      `<script>
      console.log("Steam authentication successful, Steam ID:", '${steamId}');
      window.opener?.postMessage({ type: 'STEAM_CONNECT_SUCCESS', steamId: '${steamId}' }, '*');
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
      console.log("Steam authentication result:", result);

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
