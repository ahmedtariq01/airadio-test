export interface Wall {
  id: number;
  title: string;
  artist: string;
  content_type: string;
  media_url: string;
  cover_art?: string;
  social_media_handle?: string;
  youtube?: string;
  in_point: string;
  aux_point: string;
  rating: number;
  relative_link?: string;
  schedule_item: boolean;
  skip_allowed: boolean;
  studio_only: boolean;
  ui_color_foreground: string;
  ui_color_background: string;
} 