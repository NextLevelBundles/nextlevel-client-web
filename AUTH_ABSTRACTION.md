# Authentication Abstraction Layer

## Overview

This application now uses an **Auth Adapter Pattern** to support multiple authentication methods without changing any application code. The system automatically routes to the appropriate auth provider based on environment configuration.

## How It Works

### Single Configuration Point

Set `NEXT_PUBLIC_USE_TEST_AUTH=true` in your `.env.local` file to enable test authentication:

```env
# Use test auth (email-only login via API)
NEXT_PUBLIC_USE_TEST_AUTH=true

# Use Cognito auth (default)
NEXT_PUBLIC_USE_TEST_AUTH=false
```

**That's it!** No code changes needed. The entire app automatically uses the correct auth method.

## Architecture

### File Structure

```
src/lib/auth/
├── auth-service.ts                    # Main auth service (uses adapter)
├── auth-adapter.ts                    # Factory that selects provider
├── providers/
│   ├── auth-provider-interface.ts     # Common interface
│   ├── cognito-provider.ts            # AWS Cognito/Amplify implementation
│   └── test-provider.ts               # Test auth implementation (API-based)
├── token-validator.ts                 # Shared token validation
└── test-auth-service.ts               # Direct test login (for /auth/test-login page)
```

### Components Updated

1. **AuthService** (`src/lib/auth/auth-service.ts`)
   - Now uses `getAuthProvider()` to route all auth operations
   - No direct Amplify calls except for Cognito-specific features (confirmSignUp, etc.)

2. **ClientApi** (`src/lib/api/client-api.ts`)
   - Uses `getAuthProvider().getIdToken()` to get auth headers
   - Works seamlessly with both auth methods

3. **Middleware** (`src/middleware.ts`)
   - Uses `isTestAuthEnabled()` helper
   - Skips JWT verification for test auth tokens

4. **Auth Provider** (`src/app/(shared)/providers/auth-provider.tsx`)
   - No changes needed! Works with both auth methods

## Auth Providers

### Cognito Provider (`cognito-provider.ts`)

- **Uses**: AWS Amplify + Cognito
- **Features**: Full auth flow (sign up, sign in, password reset, MFA, etc.)
- **Token Storage**: Amplify localStorage + Cookie sync
- **Best For**: Production environment

### Test Provider (`test-provider.ts`)

- **Uses**: Backend API test endpoint (`/api/test/login`)
- **Features**: Email-only login (no password), JWT from backend
- **Token Storage**: Cookies only
- **Best For**: Development, testing, load testing with jMeter

## Key Benefits

✅ **Zero Code Changes** - Switch auth methods by changing one environment variable
✅ **Type Safety** - Both providers implement the same `IAuthProvider` interface
✅ **Clean Separation** - Auth logic isolated in providers
✅ **Easy Testing** - Test different auth methods without code modifications
✅ **Maintainable** - Clear responsibilities and structure

## Usage Examples

### Existing Code (No Changes Needed!)

```typescript
// This works with BOTH auth methods automatically
const result = await AuthService.signIn(email, password);

// This also works with BOTH methods
const user = await AuthService.getCurrentUser();

// API calls automatically use the correct token
const data = await apiClient.get('/some-endpoint');
```

### How It Routes

```typescript
// When NEXT_PUBLIC_USE_TEST_AUTH=true
AuthService.signIn() → TestAuthProvider.signIn() → API test endpoint

// When NEXT_PUBLIC_USE_TEST_AUTH=false (or not set)
AuthService.signIn() → CognitoAuthProvider.signIn() → AWS Cognito
```

## Test Auth Flow

1. User enters email on test login page
2. `TestAuthProvider.signIn()` calls `/api/test/login` endpoint
3. Backend validates email exists in Customer table
4. Backend issues JWT with `custom:customerId` claim
5. Token stored in cookies
6. Middleware validates token (skips signature verification for test tokens)
7. `AuthService.getCurrentUser()` decodes token from cookie
8. API calls include token in Authorization header

## Development Workflow

### Using Test Auth

1. Set `NEXT_PUBLIC_USE_TEST_AUTH=true` in `.env.local`
2. Restart dev server: `npm run dev`
3. Navigate to `/auth/test-login`
4. Enter any email from Customer table
5. Access customer dashboard with full API access

### Using Cognito Auth

1. Set `NEXT_PUBLIC_USE_TEST_AUTH=false` (or remove the variable)
2. Restart dev server: `npm run dev`
3. Use normal sign in at `/auth/signin`
4. Complete OAuth flow with Cognito

## Adding New Auth Methods

To add a new auth method (e.g., Auth0, Firebase):

1. Create new provider: `src/lib/auth/providers/auth0-provider.ts`
2. Implement `IAuthProvider` interface
3. Update `auth-adapter.ts` to detect and return new provider
4. Add environment variable (e.g., `NEXT_PUBLIC_USE_AUTH0=true`)

**No other code changes needed!**

## Migration Notes

All existing code continues to work without modification. The abstraction layer:

- Preserves all existing AuthService method signatures
- Maintains backward compatibility
- Handles both auth methods transparently
- Logs which provider is being used for debugging

## Testing

To verify the abstraction is working:

1. Check browser console for provider initialization:
   ```
   [AuthAdapter] Using Test Auth Provider
   ```
   or
   ```
   [AuthAdapter] Using Cognito Auth Provider
   ```

2. Check API requests include Authorization header
3. Verify middleware logs show correct token handling
4. Confirm user context loads correctly in `useAuth()` hook

## Troubleshooting

**Issue**: API returns 401 Unauthorized
- **Check**: Token is being sent in Authorization header
- **Check**: `NEXT_PUBLIC_USE_TEST_AUTH` matches your auth method
- **Solution**: Restart dev server after changing env variables

**Issue**: User is null in `useAuth()`
- **Check**: Console logs show correct provider being used
- **Check**: Token exists in cookies (DevTools → Application → Cookies)
- **Solution**: Clear cookies and log in again

**Issue**: Middleware redirects to sign in
- **Check**: Token issuer matches expected value
- **Check**: Test auth tokens have `mock-cognito` in issuer claim
- **Solution**: Verify `.env.local` has correct configuration
