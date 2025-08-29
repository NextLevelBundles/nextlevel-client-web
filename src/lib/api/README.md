# API Architecture

This folder contains the clean architecture implementation for API calls in the NextLevel client web application.

## Structure

```
src/lib/api/
├── client.ts              # Generic ClientApi class with HTTP methods
├── types/
│   ├── index.ts          # Re-exports all types (backward compatibility)
│   ├── cart/
│   │   └── index.ts      # Cart-specific types
│   ├── user/
│   │   └── index.ts      # User-specific types
│   └── common/
│       └── index.ts      # Shared/common types
├── clients/
│   ├── cart.ts           # Cart-specific API methods
│   └── user.ts           # User-specific API methods
└── index.ts              # Main exports and API client instances
```

## Usage

### Basic Usage

```typescript
import { cartApi, userApi } from "@/lib/api";

// Cart operations
const cart = await cartApi.getCart();
await cartApi.addToCart(item);
await cartApi.removeFromCart(itemId);

// User operations
const customer = await userApi.getCustomer();
const countries = await userApi.getCountries();
await userApi.updateBillingAddress(billingAddress);
```

### Error Handling

```typescript
import { ClientApiError } from "@/lib/api";

try {
  await userApi.updateBillingAddress(data);
} catch (error) {
  if (error instanceof ClientApiError) {
    console.error(`API Error: ${error.message} (${error.status})`);
  } else {
    console.error("Unexpected error:", error);
  }
}
```

### Advanced Usage

```typescript
import { ClientApi, UserApi } from "@/lib/api";

// Create a custom client instance
const customClient = new ClientApi("https://api.example.com");
const customUserApi = new UserApi(customClient);
```

### Type Imports

You can import types in several ways:

```typescript
// Import all types (backward compatibility)
import { Cart, Customer, Country } from "@/lib/api";

// Import specific type modules for better organization
import { CartTypes, UserTypes, CommonTypes } from "@/lib/api";
const cart: CartTypes.Cart = await cartApi.getCart();

// Import directly from specific type modules
import { Cart } from "@/lib/api/types/cart";
import { Customer } from "@/lib/api/types/user";
import { Country } from "@/lib/api/types/common";
```

## Features

### Generic ClientApi Class

- **HTTP Methods**: GET, POST, PUT, PATCH, DELETE
- **Authentication**: Automatic Bearer token handling
- **Error Handling**: Structured error responses with status codes
- **Type Safety**: Full TypeScript support with generics

### Specialized API Clients

- **CartApi**: Shopping cart operations
- **UserApi**: User profile and settings operations
- **Extensible**: Easy to add new API clients

### Error Handling

- **ClientApiError**: Custom error class with HTTP status information
- **Global Error Handling**: Consistent error handling across all API calls
- **Fallback Responses**: Graceful degradation for critical operations

## Migration Guide

### From old client-api.ts

**Old way:**

```typescript
import { apiClient } from "@/lib/client-api";

const cart = await apiClient.getCart();
```

**New way:**

```typescript
import { cartApi } from "@/lib/api";

const cart = await cartApi.getCart();
```

### From manual fetch calls

**Old way:**

```typescript
const response = await fetch("/api/customer", {
  headers: { Authorization: `Bearer ${token}` },
});
const customer = await response.json();
```

**New way:**

```typescript
import { userApi } from "@/lib/api";

const customer = await userApi.getCustomer();
```

## Benefits

1. **Consistent Authentication**: All API calls automatically include proper auth headers
2. **Type Safety**: Full TypeScript support with proper interfaces
3. **Error Handling**: Structured error responses with meaningful messages
4. **Separation of Concerns**: Each API domain has its own client
5. **Maintainability**: Easy to add new endpoints and modify existing ones
6. **Testing**: Easier to mock and test individual API clients
7. **Reusability**: Generic ClientApi can be used for any HTTP API
