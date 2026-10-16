export const BANNER_PLACEMENTS = [
  { value: 'before_hero', label: 'Above main hero' },
  { value: 'after_hero', label: 'Below main hero' },
  { value: 'after_categories', label: 'Below categories' },
  { value: 'after_best_sellers', label: 'Below best sellers' },
  { value: 'after_bulk_cta', label: 'Below bulk order section' },
] as const;

export type BannerPlacement = (typeof BANNER_PLACEMENTS)[number]['value'];

export interface HomepageBanner {
  id: string;
  title: string;
  imageUrl: string;
  imageAlt: string;
  linkUrl: string;
  placement: BannerPlacement;
  displayOrder: number;
  enabled: boolean;
  startsAt: string;
  endsAt: string;
}
