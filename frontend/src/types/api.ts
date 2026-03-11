export type ApiSuccess<T> = {
  success: true;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  display_order: number;
  is_active: boolean;
  item_count?: number;
};

export type MenuItem = {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  image_url: string;
  is_available: boolean;
  is_featured: boolean;
  is_deleted: boolean;
  category?: Category | null;
};

export type Reservation = {
  id: number;
  customer_name: string;
  phone: string;
  email: string | null;
  reservation_date: string;
  reservation_time: string;
  guest_count: number;
  special_request: string | null;
  status: "pending" | "acknowledged";
  acknowledged_at: string | null;
  created_at: string;
  updated_at: string;
};
