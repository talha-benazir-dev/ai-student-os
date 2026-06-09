export type Document = {
  id: string;
  user_id: string;
  title: string;
  file_url: string;
  file_size: number | null;
  page_count: number | null;
  subject: string;
  ai_summary: string | null;
  cloudinary_public_id: string | null;
  created_at: string;
};
