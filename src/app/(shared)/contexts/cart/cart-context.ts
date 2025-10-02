import { AddToCartRequest, Cart, UpdateGiftRequest } from "@/lib/api/types/cart";
import { createContext } from "react";

export interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
}

export interface CartContextType extends CartState {
  addToCart: (item: AddToCartRequest) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  reserveCart: (turnstileToken?: string, trackdeskCid?: string | null, affS1?: string | null) => Promise<{ url: string }>;
  updateGiftSettings: (itemId: string, giftSettings: UpdateGiftRequest) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export default CartContext;
