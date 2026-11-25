import type { GalleryItem } from "@/lib/types";

// Finished pieces shown on /gallery. More are added in Admin → Gallery.
export const galleryItems: GalleryItem[] = [
  {
    id: "gal_blush-plum-leaf-gown",
    slug: "blush-plum-leaf-gown",
    title: "Blush satin gown with plum leaf appliqué",
    occasion: "Evening",
    story:
      "A strapless blush satin bodice with a corset lace-up back, finished with hand-beaded plum satin leaves that climb from the waist to the neckline. A sheer tulle overskirt falls into a soft train, worn with a matching tulle neck scarf and shawl.",
    design_slug: null,
    images: ["front", "back", "side", "detail"].map((v) => `/gallery/blush-plum-leaf-gown/${v}.webp`),
    published: true,
    featured: true,
    sort: 0,
    made_on: null,
    created_at: "2026-11-25T00:00:00.000Z",
  },
];
