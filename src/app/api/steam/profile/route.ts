import { NextRequest } from "next/server";

const STEAM_API_KEY = process.env.STEAM_API_KEY!;

// GET api/steam/profile
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const steamId = searchParams.get("steamid");

  if (!steamId) {
    return new Response("Missing steamid", { status: 400 });
  }
  const apiUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_API_KEY}&steamids=${steamId}`;

  const res = await fetch(apiUrl);

  const json = await res.json();
  console.log("Steam API response:", json);

  const player = json?.response?.players?.[0];
  if (!player) {
    return new Response("Player not found", { status: 404 });
  }

  return Response.json(player);
}
