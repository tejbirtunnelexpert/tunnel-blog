export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  cover_image: string | null;
  status: "draft" | "published";
  author_id: string;
  created_at: string;
  updated_at: string;
  categories?: Category[];
  tags?: Tag[];
  comments?: Comment[];
  comment_count?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  post_count?: number;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  post_count?: number;
}

export interface Comment {
  id: string;
  post_id: string;
  author_name: string;
  author_email: string;
  content: string;
  approved: boolean;
  created_at: string;
  post?: { title: string; slug: string };
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribed_at: string;
  active: boolean;
}

export interface DownloadCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  created_at: string;
  download_count?: number;
}

export interface Download {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  thumbnail_url: string | null;
  category_id: string | null;
  file_size: string | null;
  created_at: string;
  category?: DownloadCategory;
}

export interface DashboardStats {
  total_posts: number;
  published_posts: number;
  total_comments: number;
  pending_comments: number;
  total_subscribers: number;
}
