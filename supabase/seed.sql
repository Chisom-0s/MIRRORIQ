-- ═══════════════════════════════════════════════════════════
-- MirrorIQ Demo Products Seed Data
-- ═══════════════════════════════════════════════════════════

insert into public.products (id, name, brand, description, category, image_url, price, color, occasion)
values
  (
    'a1111111-1111-1111-1111-111111111111',
    'Sculpted Italian Wool Trench Coat',
    'L''Atelier Studio',
    'Double-faced virgin wool overcoat with structured storm flap and tailored raglan sleeves.',
    'Apparel • Outerwear',
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80&auto=format&fit=crop',
    '$480',
    '#C5A880',
    'Formal & Editorial'
  ),
  (
    'b2222222-2222-2222-2222-222222222222',
    'Silk Charmeuse Blouse in Crimson Rose',
    'Aura Collection',
    'Heavyweight 22mm silk charmeuse drape with concealed mother-of-pearl placket.',
    'Apparel • Tops',
    'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800&q=80&auto=format&fit=crop',
    '$210',
    '#9E2A2B',
    'Evening & Day-to-Night'
  ),
  (
    'c3333333-3333-3333-3333-333333333333',
    'Cashmere Minimalist Knit in Oat Heather',
    'Maison Minimal',
    'Grade-A 2-ply Mongolian cashmere with ribbed crewneck and relaxed tubular hem.',
    'Apparel • Knitwear',
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80&auto=format&fit=crop',
    '$260',
    '#E2DCD5',
    'Everyday Minimal'
  ),
  (
    'd4444444-4444-4444-4444-444444444444',
    'Relaxed Double-Breasted Cashmere Trench',
    'Maison Minimal',
    'Unstructured luxury cashmere-wool blend trench coat with tonal horn buttons.',
    'Apparel • Outerwear',
    'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800&q=80&auto=format&fit=crop',
    '$620',
    '#D8C7B5',
    'Smart Casual'
  ),
  (
    'e5555555-5555-5555-5555-555555555555',
    'Structured Belted Wool Overcoat in Noir',
    'Vanguard Atelier',
    'Clean architectural lines with peak lapel and removable tie belt in midnight black.',
    'Apparel • Outerwear',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&q=80&auto=format&fit=crop',
    '$450',
    '#1C1917',
    'Black Tie & Evening'
  )
on conflict (id) do update set
  name = excluded.name,
  brand = excluded.brand,
  description = excluded.description,
  category = excluded.category,
  image_url = excluded.image_url,
  price = excluded.price,
  color = excluded.color,
  occasion = excluded.occasion;
