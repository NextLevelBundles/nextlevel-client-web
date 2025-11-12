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
      `<!DOCTYPE html>
      <html>
      <head>
        <title>Steam Authentication</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .container {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            max-width: 500px;
            text-align: center;
          }
          .success {
            color: #10b981;
            font-size: 3rem;
            margin-bottom: 1rem;
          }
          .error {
            color: #ef4444;
            font-size: 3rem;
            margin-bottom: 1rem;
          }
          .waiting {
            color: #3b82f6;
            font-size: 3rem;
            margin-bottom: 1rem;
            animation: pulse 2s ease-in-out infinite;
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          h1 {
            margin: 0 0 0.5rem 0;
            color: #1f2937;
            font-size: 1.5rem;
          }
          p {
            color: #6b7280;
            margin: 0.5rem 0;
            line-height: 1.5;
          }
          .details {
            background: #f3f4f6;
            padding: 1rem;
            border-radius: 8px;
            margin: 1rem 0;
            text-align: left;
            font-size: 0.875rem;
          }
          .details strong {
            color: #1f2937;
          }
          button {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 6px;
            font-size: 1rem;
            cursor: pointer;
            margin-top: 1rem;
            transition: background 0.2s;
          }
          button:hover {
            background: #2563eb;
          }
          .countdown {
            color: #6b7280;
            font-size: 0.875rem;
            margin-top: 1rem;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div id="status-icon" class="waiting">⏳</div>
          <h1 id="status-title">Connecting to Digiphile...</h1>
          <p id="status-message">Please wait while we connect your Steam account.</p>
          <div id="details" class="details" style="display: none;"></div>
          <button id="close-btn" style="display: none;" onclick="window.close()">Close Window</button>
          <div id="countdown" class="countdown" style="display: none;"></div>
        </div>

        <script>
        (function() {
          const steamData = {
            type: 'STEAM_CONNECT_SUCCESS',
            steamId: '${steamId}',
            steamUsername: ${steamUsername ? `'${steamUsername.replace(/'/g, "\\'")}'` : 'null'},
            steamCountry: ${steamCountry ? `'${steamCountry}'` : 'null'}
          };

          let acknowledged = false;
          let timeoutHandle = null;

          console.log("[Steam Auth] Authentication successful");
          console.log("[Steam Auth] Steam ID:", steamData.steamId);
          console.log("[Steam Auth] Username:", steamData.steamUsername || 'unknown');
          console.log("[Steam Auth] Country:", steamData.steamCountry || 'unknown');
          console.log("[Steam Auth] Window opener exists:", !!window.opener);
          console.log("[Steam Auth] Current origin:", window.location.origin);

          // Update UI with Steam details
          document.getElementById('details').innerHTML =
            '<strong>Steam ID:</strong> ' + steamData.steamId + '<br>' +
            '<strong>Username:</strong> ' + (steamData.steamUsername || 'Unknown') + '<br>' +
            '<strong>Country:</strong> ' + (steamData.steamCountry || 'Unknown');
          document.getElementById('details').style.display = 'block';

          // Store in localStorage as fallback
          try {
            localStorage.setItem('steam_auth_result', JSON.stringify(steamData));
            console.log("[Steam Auth] Data saved to localStorage");
          } catch (e) {
            console.error("[Steam Auth] Failed to save to localStorage:", e);
          }

          // Listen for acknowledgment from parent
          function handleAcknowledgment(event) {
            console.log("[Steam Auth] Received message from parent:", event.data);

            if (event.data && event.data.type === 'STEAM_CONNECT_ACK') {
              acknowledged = true;
              console.log("[Steam Auth] Parent acknowledged receipt!");

              // Show success and auto-close
              document.getElementById('status-icon').className = 'success';
              document.getElementById('status-icon').textContent = '✓';
              document.getElementById('status-title').textContent = 'Successfully Connected!';
              document.getElementById('status-message').textContent = 'Your Steam account has been linked. This window will close automatically.';

              let countdown = 2;
              const countdownEl = document.getElementById('countdown');
              countdownEl.style.display = 'block';
              countdownEl.textContent = 'Closing in ' + countdown + ' seconds...';

              const countdownInterval = setInterval(function() {
                countdown--;
                if (countdown > 0) {
                  countdownEl.textContent = 'Closing in ' + countdown + ' seconds...';
                } else {
                  clearInterval(countdownInterval);
                  console.log("[Steam Auth] Closing window after acknowledgment");
                  window.close();
                }
              }, 1000);
            }
          }

          window.addEventListener('message', handleAcknowledgment);

          // Post message to parent window
          if (window.opener) {
            try {
              window.opener.postMessage(steamData, window.location.origin);
              console.log("[Steam Auth] Message posted to parent window");

              // Wait for acknowledgment, show error if not received
              timeoutHandle = setTimeout(function() {
                if (!acknowledged) {
                  console.error("[Steam Auth] No acknowledgment received from parent window");
                  document.getElementById('status-icon').className = 'error';
                  document.getElementById('status-icon').textContent = '⚠️';
                  document.getElementById('status-title').textContent = 'Connection Issue';
                  document.getElementById('status-message').innerHTML =
                    'We connected to Steam successfully, but couldn\\'t communicate with the main window.<br><br>' +
                    '<strong>Your Steam data has been saved and will be picked up automatically.</strong><br><br>' +
                    'You can close this window and return to the main page.';
                  document.getElementById('close-btn').style.display = 'inline-block';
                }
              }, 3000);

            } catch (e) {
              console.error("[Steam Auth] Failed to post message:", e);
              showError('Failed to send data to parent window: ' + e.message);
            }
          } else {
            console.error("[Steam Auth] No window.opener available");
            showError('This window was not opened correctly. Please try again from the main page.');
          }

          function showError(message) {
            document.getElementById('status-icon').className = 'error';
            document.getElementById('status-icon').textContent = '⚠️';
            document.getElementById('status-title').textContent = 'Connection Issue';
            document.getElementById('status-message').innerHTML = message + '<br><br><strong>Your Steam data has been saved and will be picked up automatically.</strong>';
            document.getElementById('close-btn').style.display = 'inline-block';
          }
        })();
        </script>
      </body>
      </html>`,
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
