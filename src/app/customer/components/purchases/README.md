# Purchase History Implementation

## Overview

The purchase history functionality has been implemented with the following components:

### API Layer

- **Purchase API Client** (`/src/lib/api/clients/purchase.ts`): Handles API calls to fetch purchase history
- **Purchase Types** (`/src/lib/api/types/purchase.ts`): TypeScript interfaces for purchase data
- **Purchase Query Hook** (`/src/hooks/queries/usePurchases.ts`): React Query hook for fetching purchase data

### UI Components

- **Purchase History** (`/src/app/customer/components/purchases/purchase-history.tsx`): Main component displaying purchase history table
- **Bundle Products Popup** (`/src/app/customer/components/purchases/bundle-products-popup.tsx`): Modal showing detailed bundle products

## API Endpoint

```
GET /api/customer/purchases?sortBy=[sortBy]&sortDirection=[sortDirection]&year=[year]
```

### Query Parameters

- `sortBy`: "Title" | "Date" | "Price" | "Quantity" (optional)
- `sortDirection`: "Ascending" | "Descending" (optional)
- `year`: "2024" | "2025" (optional)

### Response Format

```typescript
interface Purchase {
  id: string;
  type: "Listing" | "Bundle";
  listingId?: string;
  bundleId?: string;
  bundleTierId?: string;
  quantity: number;
  price: number;
  charityPercentage: number;
  snapshotTitle?: string;
  snapshotImageUrl?: string;
  snapshotPlatform?: string;
  snapshotTierTitle?: string;
  snapshotTierPrice?: number;
  snapshotProducts: {
    productId: string;
    title: string;
    coverImageUrl: string;
    steamGameInfo?: {
      steamAppId?: number;
      packageId: string;
      steamKeyId: string;
    };
  }[];
}
```

## Features Implemented

### 1. Purchase History Table

- **Columns**: Bundle Name, Date, Items, Amount, Actions
- **Removed**: Status column (as requested)
- **Responsive**: Works on mobile and desktop
- **Loading States**: Shows spinner while fetching data
- **Error Handling**: Displays error messages and retry option

### 2. Filtering & Sorting

- **Search**: Filter by bundle name
- **Year Filter**: Filter by 2025 or 2024
- **Sort Options**: Sort by Title, Date, Price, or Quantity
- **Sort Direction**: Toggle between Ascending and Descending
- **Clear Filters**: Reset all filters to default

### 3. Bundle Products Popup

- **Trigger**: "View Products" button (replaced external link icon)
- **Content**: Shows all products in the bundle with images and details
- **Steam Integration**: Displays Steam-specific information
- **Charity Information**: Shows charity contribution details
- **Responsive**: Mobile-friendly modal design

### 4. Error Handling

- **Network Errors**: Graceful handling of API failures
- **Empty States**: User-friendly messages for no data
- **Loading States**: Smooth loading experience
- **Retry Mechanism**: Easy retry for failed requests

## Usage

### Basic Usage

```typescript
import { usePurchases } from "@/hooks/queries/usePurchases";

function MyComponent() {
  const { data: purchases, isLoading, error } = usePurchases();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {purchases.map(purchase => (
        <div key={purchase.id}>{purchase.snapshotTitle}</div>
      ))}
    </div>
  );
}
```

### With Filters

```typescript
const { data: purchases } = usePurchases({
  sortBy: "Date",
  sortDirection: "Descending",
  year: "2024",
});
```

## Migration from Mock Data

The component was migrated from mock data to real API integration:

- Removed hardcoded purchase data
- Added proper error handling and loading states
- Implemented real filtering and sorting through API
- Added proper TypeScript types
- Integrated with React Query for caching and state management

## Testing

- Component compiles successfully
- All TypeScript types are properly defined
- React Query integration works correctly
- Error handling is comprehensive
- UI is responsive and accessible
