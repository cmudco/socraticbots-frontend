export interface Book {
  id: string; // UUID from backend
  title: string;
  description?: string;
  is_published: boolean;
  owner_id: string;
  owner_name: string;
  created_at: string;
  updated_at: string;
}
