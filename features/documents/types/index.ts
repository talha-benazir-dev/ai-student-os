import type { Cluster } from "@/features/clusters/types";

export type { Cluster };

export type Document = {
  id: string;
  user_id: string;
  title: string;
  file_url: string;
  file_size: number;
  page_count: number | null;
  ai_summary: string | null;
  cloudinary_public_id: string;
  cluster_id: string | null;
  created_at: string;
};
