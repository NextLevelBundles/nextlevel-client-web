import { CartItem } from "@/lib/api/types/cart";

/**
 * Determines if a cart item is a book bundle by checking if any
 * of its snapshot products have bookInfo
 */
export function isBookBundle(item: CartItem): boolean {
  return item.snapshotProducts?.some(product => product.bookInfo != null) ?? false;
}

/**
 * Determines if a cart item is a game bundle by checking if none
 * of its snapshot products have bookInfo
 */
export function isGameBundle(item: CartItem): boolean {
  return !isBookBundle(item);
}