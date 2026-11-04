export interface Profile {
  id: string;
  username: string;
  role: "admin" | "cashier";
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category_id: number | null;
  categories: Category | null;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  total: number;
  cashier_id: string;
  profiles: Profile;
  order_items: OrderItem[];
  created_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  qty: number;
  unit_price: number;
  products: { name: string };
}

export interface CartItem {
  product: Product;
  qty: number;
}
