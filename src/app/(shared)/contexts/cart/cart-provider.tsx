"use client";

import { useSession } from "next-auth/react";
import {
  useContext,
  useReducer,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { toast } from "sonner";
import CartContext, { CartContextType, CartState } from "./cart-context";
import {
  AddToCartRequest,
  Cart,
  CartItem,
  UpdateGiftRequest,
} from "@/lib/api/types/cart";
import { cartApi } from "@/lib/api";

interface CartProviderProps {
  children: ReactNode;
  initialCart?: Cart | null;
}

type CartAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_CART"; payload: Cart }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "ADD_ITEM"; payload: CartItem }
  | {
      type: "UPDATE_ITEM";
      payload: { itemId: string; updates: Partial<CartItem> };
    }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "CLEAR_CART" };

const initialState: CartState = {
  cart: null,
  isLoading: false,
  error: null,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_CART":
      return { ...state, cart: action.payload, error: null };
    case "SET_ERROR":
      return { ...state, error: action.payload, isLoading: false };
    case "ADD_ITEM":
      if (!state.cart) return state;
      return {
        ...state,
        cart: {
          ...state.cart,
          items: [...state.cart.items, action.payload],
        },
      };
    case "UPDATE_ITEM":
      if (!state.cart) return state;
      return {
        ...state,
        cart: {
          ...state.cart,
          items: state.cart.items.map((item) =>
            item.id === action.payload.itemId
              ? { ...item, ...action.payload.updates }
              : item
          ),
        },
      };
    case "REMOVE_ITEM":
      if (!state.cart) return state;
      return {
        ...state,
        cart: {
          ...state.cart,
          items: state.cart.items.filter((item) => item.id !== action.payload),
        },
      };
    case "CLEAR_CART":
      return {
        ...state,
        cart: state.cart ? { ...state.cart, items: [] } : null,
      };
    default:
      return state;
  }
}

export default function CartProvider({
  children,
  initialCart = null,
}: CartProviderProps) {
  const [state, dispatch] = useReducer(cartReducer, {
    ...initialState,
    cart: initialCart,
  });
  const { status } = useSession();

  const refreshCart = useCallback(async () => {
    if (status !== "authenticated") return;

    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const cart = await cartApi.getCart();
      dispatch({ type: "SET_CART", payload: cart });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to load cart" });
      console.error("Error refreshing cart:", error);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [status]);

  const addToCart = async (item: AddToCartRequest) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const updatedCart = await cartApi.addToCart(item);
      dispatch({ type: "SET_CART", payload: updatedCart });
      toast.success("Item added to cart!");
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to add item to cart" });
      // Error toast is handled by the global ClientApi error handler
      console.error("Error adding to cart:", error);
      // Re-throw the error so components can handle it
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const removeFromCart = async (itemId: string) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const updatedCart = await cartApi.removeFromCart(itemId);
      dispatch({ type: "SET_CART", payload: updatedCart });
      toast.success("Item removed from cart");
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: "Failed to remove item from cart",
      });
      // Error toast is handled by the global ClientApi error handler
      console.error("Error removing from cart:", error);
      // Re-throw the error so components can handle it
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const clearCart = async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      await cartApi.clearCart();
      dispatch({ type: "CLEAR_CART" });
      toast.success("Cart cleared");
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to clear cart" });
      // Error toast is handled by the global ClientApi error handler
      console.error("Error clearing cart:", error);
      // Re-throw the error so components can handle it
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const reserveCart = async (
    turnstileToken?: string
  ): Promise<{ url: string }> => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const response = await cartApi.reserveCart(turnstileToken);
      return response;
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to reserve cart" });
      // Error toast is handled by the global ClientApi error handler
      console.error("Error reserving cart:", error);
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const getTotalItems = () => {
    return (
      state.cart?.items.reduce((total, item) => total + item.quantity, 0) || 0
    );
  };

  const getTotalPrice = () => {
    return state.cart?.total || 0;
  };

  const updateGiftSettings = async (
    itemId: string,
    giftSettings: UpdateGiftRequest
  ) => {
    try {
      const updatedCart = await cartApi.updateGiftSettings(
        itemId,
        giftSettings
      );
      dispatch({ type: "SET_CART", payload: updatedCart });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: "Failed to update gift settings",
      });
      console.error("Error updating gift settings:", error);
      throw error;
    }
  };

  useEffect(() => {
    // Only refresh cart if we don't have initial data or if authentication status changes
    if (status === "authenticated" && !initialCart) {
      console.log("Refreshing cart due to authentication status change");
      refreshCart();
    }
  }, [status, initialCart, refreshCart]);

  const value: CartContextType = {
    ...state,
    addToCart,
    removeFromCart,
    clearCart,
    refreshCart,
    getTotalItems,
    getTotalPrice,
    reserveCart,
    updateGiftSettings,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
