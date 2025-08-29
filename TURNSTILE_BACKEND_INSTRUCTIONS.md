# Cloudflare Turnstile Backend Implementation Instructions

## Overview
The frontend is now sending a Cloudflare Turnstile token with the checkout request. The backend needs to verify this token with Cloudflare's API before processing the checkout.

## What's Changed on Frontend
- The `/customer/checkout/reserve` endpoint now receives a POST body with:
  ```json
  {
    "turnstileToken": "TOKEN_FROM_TURNSTILE_WIDGET"
  }
  ```

## Backend Implementation Required

### 1. Add Turnstile Secret Key to Environment
Add to your backend environment variables:
```
TURNSTILE_SECRET_KEY=YOUR_SECRET_KEY_FROM_CLOUDFLARE
```

You can get this from: https://dash.cloudflare.com → Turnstile → Your Site → Settings

### 2. Update the Checkout Endpoint

In your `/customer/checkout/reserve` endpoint handler, add verification before processing:

```csharp
// C# Example
[HttpPost("checkout/reserve")]
public async Task<IActionResult> ReserveCheckout([FromBody] ReserveCheckoutRequest request)
{
    // Step 1: Verify Turnstile token
    if (string.IsNullOrEmpty(request.TurnstileToken))
    {
        return BadRequest(new { error = "Security verification required" });
    }

    var isValidToken = await VerifyTurnstileToken(request.TurnstileToken);
    if (!isValidToken)
    {
        return BadRequest(new { error = "Security verification failed. Please try again." });
    }

    // Step 2: Continue with existing checkout logic
    // ... your existing checkout code ...
}

private async Task<bool> VerifyTurnstileToken(string token)
{
    var secretKey = Environment.GetEnvironmentVariable("TURNSTILE_SECRET_KEY");
    
    using var httpClient = new HttpClient();
    var formData = new FormUrlEncodedContent(new[]
    {
        new KeyValuePair<string, string>("secret", secretKey),
        new KeyValuePair<string, string>("response", token),
        // Optional: Add user's IP for additional security
        // new KeyValuePair<string, string>("remoteip", userIpAddress)
    });

    var response = await httpClient.PostAsync(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        formData
    );

    if (!response.IsSuccessStatusCode)
        return false;

    var jsonResponse = await response.Content.ReadAsStringAsync();
    var result = JsonSerializer.Deserialize<TurnstileVerifyResponse>(jsonResponse);
    
    return result?.Success ?? false;
}

public class TurnstileVerifyResponse
{
    [JsonPropertyName("success")]
    public bool Success { get; set; }
    
    [JsonPropertyName("error-codes")]
    public List<string> ErrorCodes { get; set; }
    
    [JsonPropertyName("challenge_ts")]
    public string ChallengeTimestamp { get; set; }
    
    [JsonPropertyName("hostname")]
    public string Hostname { get; set; }
}

public class ReserveCheckoutRequest
{
    public string TurnstileToken { get; set; }
    // ... other existing properties ...
}
```

### 3. Error Handling

Make sure to handle these scenarios:
- **Missing token**: Return 400 with message "Security verification required"
- **Invalid token**: Return 400 with message "Security verification failed. Please try again."
- **Turnstile API error**: Log the error and return 500 with generic message
- **Token already used**: Turnstile tokens are single-use, return appropriate error

### 4. Cloudflare Turnstile Verification API Response

The Turnstile verification API returns:
```json
{
  "success": true|false,
  "error-codes": [],
  "challenge_ts": "2024-01-01T00:00:00Z",
  "hostname": "yourdomain.com",
  "action": "",
  "cdata": ""
}
```

Common error codes:
- `missing-input-secret`: Secret key is missing
- `invalid-input-secret`: Secret key is invalid
- `missing-input-response`: Token is missing
- `invalid-input-response`: Token is invalid or expired
- `timeout-or-duplicate`: Token has already been used

### 5. Optional Security Enhancements

1. **IP Validation**: Pass the user's IP address in the verification request
2. **Timestamp Check**: Verify the challenge timestamp is recent (within 5 minutes)
3. **Hostname Validation**: Ensure the hostname matches your expected domain
4. **Rate Limiting**: Implement rate limiting on failed attempts

### 6. Testing

For testing purposes, Cloudflare provides test keys:
- **Always passes**: `1x00000000000000000000AA`
- **Always fails**: `2x00000000000000000000AB`

Use these in development/staging environments.

## Implementation Checklist

- [ ] Add `TURNSTILE_SECRET_KEY` to environment variables
- [ ] Update checkout endpoint to accept `turnstileToken` in request body
- [ ] Implement token verification with Cloudflare API
- [ ] Add appropriate error handling and messages
- [ ] Test with real Turnstile tokens
- [ ] Test error scenarios (missing token, invalid token, etc.)
- [ ] Add logging for security audit trail
- [ ] Consider implementing rate limiting

## Reference Links
- [Cloudflare Turnstile Server-side Validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)
- [Turnstile Dashboard](https://dash.cloudflare.com/)