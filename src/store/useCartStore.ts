import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  slug: string;
  stock: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        const items = get().items;
        const existingItem = items.find((i) => i.id === product.id);

        if (existingItem) {
          const newQuantity = existingItem.quantity + product.quantity;
          // Ensure we don't exceed stock when adding more of the same item
          if (newQuantity > product.stock) {
            set({
              items: items.map((i) =>
                i.id === product.id ? { ...i, quantity: product.stock } : i
              ),
            });
            return;
          }

          set({
            items: items.map((i) =>
              i.id === product.id ? { ...i, quantity: newQuantity } : i
            ),
          });
        } else {
          // Double check the initial quantity doesn't exceed stock
          const initialQty = Math.min(product.quantity, product.stock);
          set({ items: [...items, { ...product, quantity: initialQty }] });
        }
      },
      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },
      updateQuantity: (id, qty) => {
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, quantity: Math.max(1, Math.min(qty, i.stock)) } : i
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      getTotalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      getTotalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: 'mmo-cart-storage',
    }
  )
);
