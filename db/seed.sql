-- Bowl n Sticks - menu seed data (Phase 1)
-- Run in Supabase SQL Editor AFTER 01_init_schema. Safe to re-run: it wipes
-- this cafe's rows first (the delete cascades to sections/items/options/tables),
-- then re-inserts everything fresh.
--
-- VERIFY against the printed menu: diet_type (veg/egg/nonveg), is_spicy, and the
-- combo protein numbers are my best reading of the PDF. Correct any that are wrong.

-- Fresh start for this cafe
delete from cafe where slug = 'bowl-n-sticks';

-- ── cafe ───────────────────────────────────────────────────────
insert into cafe (slug, name, tagline, timings, socials, rules) values (
  'bowl-n-sticks',
  'Bowl n Sticks',
  'First anime themed cafe in Karwar. Made by students, for students.',
  '9:30am - 2pm & 5pm - 9:30pm (Mon-Sat) | 5pm - 9:30pm (Sun)',
  '{"instagram":"maggilicious_cafe","zomato":"4.2/5"}'::jsonb,
  array[
    'Minimum 10 mins required for food to be ready.',
    'Order once placed cannot be cancelled unless said before we start cooking.',
    'You can also order online on Zomato & Swiggy and get up to 10% off or more.',
    'If you loved our food, rate us on Google and tag us on Instagram. If not, we are always open for feedback.',
    'Please return the manga books and chopsticks after use, they are not for sale.',
    '₹5 takeaway fee applicable.',
    'Outside food not allowed.'
  ]
);

-- ── tables (T1-T4) ─────────────────────────────────────────────
insert into dining_table (cafe_id, code, label)
select c.id, t.code, t.label
from cafe c,
  (values ('T1','Table 1'), ('T2','Table 2'), ('T3','Table 3'), ('T4','Table 4')) as t(code, label)
where c.slug = 'bowl-n-sticks';

-- ── sections ───────────────────────────────────────────────────
insert into menu_section (cafe_id, name, blurb, sort_order)
select c.id, s.name, s.blurb, s.sort_order
from cafe c,
  (values
    ('Combo Meals',          'Loved by many. Meal combos served with fries + coke.',                      1),
    ('Maggi Dishes',         'Homemade recipes perfected over 4 years. Our signature comfort food.',       2),
    ('Ramen Dishes',         'Fusion Korean/Japanese ramen. All bowls contain egg (removable on request).',3),
    ('Momos',                'Steamed dumplings (5 pieces).',                                             4),
    ('Street Bites',         'Crispy fried chicken bites. Perfect for sharing or solo snacking.',          5),
    ('Rolls',                'Grilled wraps with homemade roti. Egg, paneer, or chicken keema.',           6),
    ('Snacks',               'Sandwiches, pav bhaji, and Indian street food classics.',                   7),
    ('Soups',                'Hot, warming soups. Classic Manchow or our signature Soupy Maggi.',          8),
    ('Pasta',                'Indian-style pasta in creamy, spicy, or cheesy sauces.',                     9),
    ('Burgers',              'Loaded cheese burgers. Veg, chicken, or our signature Crispy Zinger.',      10),
    ('Pizza',                'Medium-sized pizzas with generous toppings. Made fresh.',                   11),
    ('Fries',                'Crispy potato fries.',                                                     12),
    ('Upgradables & Toppings','Add-ons and extras for your order.',                                       13),
    ('Tea',                  'Classic Indian chai and flavored teas. Hot and fresh.',                     14),
    ('Coffee',               'Premium instant coffee blends. Hot, strong, and ready in minutes.',         15),
    ('Cold Coffee',          'Iced coffee shakes in 5 flavours. Sweet, creamy, refreshing.',              16),
    ('Iced Tea',             'Chilled fruit flavoured drinks, naturally refreshing.',                     17),
    ('Matcha',               'Japanese green tea lattes and lemonade. Instant premix, zero added sugar.', 18),
    ('Juice',                'Fresh citrus juices and sodas. Made to order.',                             19),
    ('Mocktails',            'Colorful, refreshing non-alcoholic drinks. Instagram-worthy.',              20),
    ('Milkshakes',           'Thick, creamy milkshakes. Made with real ice cream, not powder.',           21),
    ('Ice Creams',           'Creamy ice cream scoops (2 per serving).',                                  22),
    ('Cold Drinks',          'Chilled bottled drinks.',                                                   23)
  ) as s(name, blurb, sort_order)
where c.slug = 'bowl-n-sticks';

-- ── items ──────────────────────────────────────────────────────
-- Columns: section, name, price, diet_type, is_spicy, protein_g, badges, is_featured, sort_order
insert into menu_item (menu_section_id, name, price, diet_type, is_spicy, protein_g, badges, is_featured, sort_order)
select ms.id, i.name, i.price, i.diet_type::diet_type, i.is_spicy, i.protein_g, i.badges::text[], i.is_featured, i.sort_order
from menu_section ms
join cafe c on c.id = ms.cafe_id
join (values
  -- Combo Meals
  ('Combo Meals','Maggi Meals',            129, 'veg',    false, 26,   '{"Highest selling"}', true,  1),
  ('Combo Meals','Ramen Combo',            259, 'egg',    false, 23,   '{}',                  false, 2),
  ('Combo Meals','Burger Combo',           199, 'veg',    false, 26,   '{"students fav"}',    false, 3),
  ('Combo Meals','Pizza Combo',            269, 'veg',    false, null, '{"Most ordered"}',    true,  4),
  ('Combo Meals','Sandwich Combo',         169, 'veg',    false, null, '{"must try"}',        false, 5),

  -- Maggi Dishes
  ('Maggi Dishes','Classic Maggi',          60, 'veg',    false, null, '{}', false, 1),
  ('Maggi Dishes','Butter Maggi',           80, 'veg',    false, null, '{}', false, 2),
  ('Maggi Dishes','Masala Maggi',          100, 'veg',    false, null, '{}', false, 3),
  ('Maggi Dishes','Soya Maggi',            110, 'veg',    false, null, '{}', false, 4),
  ('Maggi Dishes','Cheese Maggi',          120, 'veg',    false, null, '{}', false, 5),
  ('Maggi Dishes','Milk Maggi',            120, 'veg',    false, null, '{}', false, 6),
  ('Maggi Dishes','Mushroom Maggi',        130, 'veg',    false, null, '{}', false, 7),
  ('Maggi Dishes','Paneer Maggi',          140, 'veg',    false, null, '{}', false, 8),
  ('Maggi Dishes','Omu Maggi',              90, 'egg',    false, null, '{}', false, 9),
  ('Maggi Dishes','Egg Maggi',             110, 'egg',    false, null, '{}', false, 10),
  ('Maggi Dishes','Chicken Maggi',         140, 'nonveg', false, null, '{}', false, 11),
  ('Maggi Dishes','Chicken Masala Maggi',  150, 'nonveg', false, null, '{}', false, 12),

  -- Ramen Dishes
  ('Ramen Dishes','Paneer Ramen',          180, 'egg',    false, null, '{}', false, 1),
  ('Ramen Dishes','Chicken Ramen',         190, 'nonveg', false, null, '{}', false, 2),
  ('Ramen Dishes','Chicken Crispy Ramen',  220, 'nonveg', false, null, '{}', false, 3),
  ('Ramen Dishes','Spicy Korean Paneer Ramen', 200, 'egg', true, null, '{}', false, 4),
  ('Ramen Dishes','Spicy Korean Chicken Ramen',230, 'nonveg', true, null, '{}', true, 5),

  -- Momos
  ('Momos','Veg Momos',                    110, 'veg',    false, null, '{}', false, 1),
  ('Momos','Paneer Momos',                 150, 'veg',    false, null, '{}', false, 2),
  ('Momos','Schezwan Momos',               150, 'veg',    true,  null, '{}', false, 3),
  ('Momos','Chicken Tikka Momos',          160, 'nonveg', false, null, '{}', false, 4),
  ('Momos','Chicken Peri Peri Momos',      170, 'nonveg', true,  null, '{}', false, 5),

  -- Street Bites
  ('Street Bites','Chicken Nuggets (7 pcs)',   150, 'nonveg', false, null, '{}', false, 1),
  ('Street Bites','Chicken Popcorn (10 pcs)',  250, 'nonveg', false, null, '{}', false, 2),
  ('Street Bites','Chicken Wings (5 pcs)',     250, 'nonveg', false, null, '{}', false, 3),
  ('Street Bites','Crispy Chicken (5 pcs)',    290, 'nonveg', false, null, '{}', false, 4),

  -- Rolls
  ('Rolls','Egg Cheese Roll',              110, 'egg',    false, null, '{}', false, 1),
  ('Rolls','Paneer Cheese Roll',           130, 'veg',    false, null, '{}', false, 2),
  ('Rolls','Chicken Cheese Roll',          150, 'nonveg', false, null, '{}', false, 3),
  ('Rolls','Chicken Keema Roll',           160, 'nonveg', false, null, '{}', false, 4),

  -- Snacks
  ('Snacks','Veg Sandwich',                 60, 'veg',    false, null, '{}', false, 1),
  ('Snacks','Cheese Sandwich',              80, 'veg',    false, null, '{}', false, 2),
  ('Snacks','Paneer Sandwich',              80, 'veg',    false, null, '{}', false, 3),
  ('Snacks','Egg Sandwich',                 80, 'egg',    false, null, '{}', false, 4),
  ('Snacks','Bread Omelette',               80, 'egg',    false, null, '{}', false, 5),
  ('Snacks','Chicken Sandwich',             90, 'nonveg', false, null, '{}', false, 6),
  ('Snacks','Chicken Cheese Sandwich',     110, 'nonveg', false, null, '{}', false, 7),
  ('Snacks','Chicken Keema Pav',           110, 'nonveg', false, null, '{}', false, 8),
  ('Snacks','Pav Bhaji',                    80, 'veg',    false, null, '{}', false, 9),
  ('Snacks','Cheese Pav Bhaji',             95, 'veg',    false, null, '{}', false, 10),
  ('Snacks','Paneer Pav Bhaji',            105, 'veg',    false, null, '{}', false, 11),
  ('Snacks','Paneer Cheese Pav Bhaji',     115, 'veg',    false, null, '{}', false, 12),

  -- Soups
  ('Soups','Soupy Maggi',                   60, 'veg',    false, null, '{}', false, 1),
  ('Soups','Chicken Soupy Maggi',           90, 'nonveg', false, null, '{}', false, 2),
  ('Soups','Manchow Soup',                 100, 'veg',    false, null, '{}', false, 3),
  ('Soups','Chicken Manchow Soup',         120, 'nonveg', false, null, '{}', false, 4),

  -- Pasta
  ('Pasta','Mushroom Penne',               100, 'veg',    false, null, '{}', false, 1),
  ('Pasta','Masala Penne',                 120, 'veg',    true,  null, '{}', false, 2),
  ('Pasta','Cheese Macaroni',              120, 'veg',    false, null, '{}', false, 3),
  ('Pasta','Cheesy Tomato',                120, 'veg',    false, null, '{}', false, 4),
  ('Pasta','Chicken Masala Penne',         160, 'nonveg', true,  null, '{}', false, 5),

  -- Burgers
  ('Burgers','Veg Cheese Burger',          110, 'veg',    false, null, '{}', false, 1),
  ('Burgers','Spicy Veg Cheese Burger',    130, 'veg',    true,  null, '{}', false, 2),
  ('Burgers','Egg Cheese Burger',          130, 'egg',    false, null, '{}', false, 3),
  ('Burgers','Chicken Cheese Burger',      140, 'nonveg', false, null, '{}', false, 4),
  ('Burgers','Chicken & Egg Cheese Burger',150, 'nonveg', false, null, '{}', false, 5),
  ('Burgers','Spicy Chicken Cheese Burger',150, 'nonveg', true,  null, '{}', false, 6),
  ('Burgers','Nuggets Cheese Burger',      170, 'nonveg', false, null, '{}', false, 7),
  ('Burgers','Chicken Crispy Zinger',      180, 'nonveg', false, null, '{"signature"}', true, 8),

  -- Pizza
  ('Pizza','Veg Pizza',                    210, 'veg',    false, null, '{}', false, 1),
  ('Pizza','Corn Pizza',                   210, 'veg',    false, null, '{}', false, 2),
  ('Pizza','Veg Corn Pizza',               220, 'veg',    false, null, '{}', false, 3),
  ('Pizza','Cheese Pizza',                 220, 'veg',    false, null, '{}', false, 4),
  ('Pizza','Mushroom Pizza',               230, 'veg',    false, null, '{}', false, 5),
  ('Pizza','Paneer Pizza',                 230, 'veg',    false, null, '{}', false, 6),
  ('Pizza','Chicken Pizza',                250, 'nonveg', false, null, '{}', false, 7),
  ('Pizza','Chicken Corn Pizza',           260, 'nonveg', false, null, '{}', false, 8),

  -- Fries
  ('Fries','French Fries',                 100, 'veg',    false, null, '{}', false, 1),
  ('Fries','Peri Peri Fries',              130, 'veg',    true,  null, '{}', false, 2),
  ('Fries','Cheese Loaded Fries',          140, 'veg',    false, null, '{}', false, 3),
  ('Fries','Chicken Cheese Loaded Fries',  180, 'nonveg', false, null, '{}', false, 4),

  -- Upgradables & Toppings
  ('Upgradables & Toppings','Chicken Keema Meal',        159, 'nonveg', false, null, '{}', false, 1),
  ('Upgradables & Toppings','Extra Mayonnaise',           10, 'veg',    false, null, '{}', false, 2),
  ('Upgradables & Toppings','Extra Schezwan Sauce',       15, 'veg',    false, null, '{}', false, 3),
  ('Upgradables & Toppings','Extra Mixed Sauce',          15, 'veg',    false, null, '{}', false, 4),
  ('Upgradables & Toppings','Extra Roti',                 30, 'veg',    false, null, '{}', false, 5),
  ('Upgradables & Toppings','Extra Cheese / Butter',      30, 'veg',    false, null, '{}', false, 6),
  ('Upgradables & Toppings','Extra Egg',                  20, 'egg',    false, null, '{}', false, 7),
  ('Upgradables & Toppings','Extra Paneer',               20, 'veg',    false, null, '{}', false, 8),
  ('Upgradables & Toppings','Extra Mushroom',             30, 'veg',    false, null, '{}', false, 9),
  ('Upgradables & Toppings','Peri Peri Fries (add-on)',   15, 'veg',    true,  null, '{}', false, 10),
  ('Upgradables & Toppings','Any Iced Tea',               30, 'veg',    false, null, '{}', false, 11),
  ('Upgradables & Toppings','Extra Popcorn (1 piece)',    25, 'nonveg', false, null, '{}', false, 12),
  ('Upgradables & Toppings','Extra Crispy (1 piece)',     55, 'nonveg', false, null, '{}', false, 13),
  ('Upgradables & Toppings','Extra Chicken (4 pieces)',   50, 'nonveg', false, null, '{}', false, 14),

  -- Tea
  ('Tea','Classic Tea',                     25, 'veg', false, null, '{}', false, 1),
  ('Tea','Black Tea',                       30, 'veg', false, null, '{}', false, 2),
  ('Tea','Lemon Tea',                       30, 'veg', false, null, '{}', false, 3),
  ('Tea','Ginger Tea',                      30, 'veg', false, null, '{}', false, 4),
  ('Tea','Horlicks',                        25, 'veg', false, null, '{}', false, 5),
  ('Tea','Boost',                           25, 'veg', false, null, '{}', false, 6),
  ('Tea','Masala Tea',                      35, 'veg', false, null, '{}', false, 7),

  -- Coffee
  ('Coffee','Classic Coffee',               25, 'veg', false, null, '{}', false, 1),
  ('Coffee','Butterscotch Coffee',          50, 'veg', false, null, '{}', false, 2),
  ('Coffee','Colombian Coffee',             50, 'veg', false, null, '{}', false, 3),
  ('Coffee','French Vanilla Coffee',        50, 'veg', false, null, '{}', false, 4),
  ('Coffee','Hazelnut Coffee',              50, 'veg', false, null, '{}', false, 5),

  -- Cold Coffee
  ('Cold Coffee','Cold Coffee',             80, 'veg', false, null, '{}', false, 1),
  ('Cold Coffee','Butterscotch Cold Coffee',110,'veg', false, null, '{}', false, 2),
  ('Cold Coffee','Colombian Cold Coffee',   110,'veg', false, null, '{}', false, 3),
  ('Cold Coffee','French Vanilla Cold Coffee',110,'veg',false,null, '{}', false, 4),
  ('Cold Coffee','Hazelnut Cold Coffee',    110,'veg', false, null, '{}', false, 5),

  -- Iced Tea
  ('Iced Tea','Lemon Mint Iced Tea',        60, 'veg', false, null, '{}', false, 1),
  ('Iced Tea','Blueberry Iced Tea',         60, 'veg', false, null, '{}', false, 2),
  ('Iced Tea','Watermelon Iced Tea',        60, 'veg', false, null, '{}', false, 3),

  -- Matcha
  ('Matcha','Matcha Vanilla Latte',         120,'veg', false, null, '{"ALL NEW"}', false, 1),
  ('Matcha','Matcha Strawberry Latte',      120,'veg', false, null, '{"ALL NEW"}', false, 2),
  ('Matcha','Matcha Classic Latte',         120,'veg', false, null, '{"ALL NEW"}', false, 3),
  ('Matcha','Matcha Mint Lemonade',         120,'veg', false, null, '{"ALL NEW"}', false, 4),

  -- Juice
  ('Juice','Lemon Mint Juice',              40, 'veg', false, null, '{}', false, 1),
  ('Juice','Lemon Mint Soda',               50, 'veg', false, null, '{}', false, 2),
  ('Juice','Mosambi Juice',                 70, 'veg', false, null, '{}', false, 3),
  ('Juice','Orange Juice',                  70, 'veg', false, null, '{}', false, 4),

  -- Mocktails
  ('Mocktails','Blue Lagoon',               90, 'veg', false, null, '{}', false, 1),
  ('Mocktails','Rose Mojito',               90, 'veg', false, null, '{}', false, 2),
  ('Mocktails','Melon Mojito',              90, 'veg', false, null, '{}', false, 3),
  ('Mocktails','Tangy Mojito',              90, 'veg', false, null, '{}', false, 4),

  -- Milkshakes
  ('Milkshakes','Vanilla Milkshake',        90, 'veg', false, null, '{}', false, 1),
  ('Milkshakes','Strawberry Milkshake',     90, 'veg', false, null, '{}', false, 2),
  ('Milkshakes','Pista Milkshake',          90, 'veg', false, null, '{}', false, 3),
  ('Milkshakes','Mango Milkshake',          100,'veg', false, null, '{}', false, 4),
  ('Milkshakes','Butterscotch Milkshake',   100,'veg', false, null, '{}', false, 5),
  ('Milkshakes','Chocolate Milkshake',      110,'veg', false, null, '{}', false, 6),
  ('Milkshakes','Oreo Milkshake',           110,'veg', false, null, '{}', false, 7),
  ('Milkshakes','KitKat Milkshake',         110,'veg', false, null, '{}', false, 8),
  ('Milkshakes','Rajbogh Milkshake',        120,'veg', false, null, '{}', false, 9),

  -- Ice Creams
  ('Ice Creams','Vanilla Ice Cream',        90, 'veg', false, null, '{}', false, 1),
  ('Ice Creams','Strawberry Ice Cream',     90, 'veg', false, null, '{}', false, 2),
  ('Ice Creams','Pista Ice Cream',          90, 'veg', false, null, '{}', false, 3),
  ('Ice Creams','Mango Ice Cream',          100,'veg', false, null, '{}', false, 4),
  ('Ice Creams','Butterscotch Ice Cream',   100,'veg', false, null, '{}', false, 5),
  ('Ice Creams','Chocolate Ice Cream',      110,'veg', false, null, '{}', false, 6),
  ('Ice Creams','Rajbogh Ice Cream',        120,'veg', false, null, '{}', false, 7),

  -- Cold Drinks
  ('Cold Drinks','Coke 250ml',              30,  'veg', false, null, '{}', false, 1),
  ('Cold Drinks','Sprite 250ml',            30,  'veg', false, null, '{}', false, 2),
  ('Cold Drinks','Water Bottle 500ml',      null,'veg', false, null, '{}', false, 3)
) as i(section_name, name, price, diet_type, is_spicy, protein_g, badges, is_featured, sort_order)
  on i.section_name = ms.name
where c.slug = 'bowl-n-sticks';

-- ── combo options ("Make it ..." upgrades) ─────────────────────
-- All deltas (is_delta = true), shown as "+₹<price>" on top of the combo price.
insert into menu_item_option (menu_item_id, label, price, is_delta, sort_order)
select mi.id, o.label, o.price, true, o.sort_order
from menu_item mi
join menu_section ms on ms.id = mi.menu_section_id
join cafe c on c.id = ms.cafe_id
join (values
  ('Maggi Meals',   'Paneer Maggi Meal',    60,  1),
  ('Maggi Meals',   'Popcorn Maggi Meal',   90,  2),
  ('Maggi Meals',   'Crispy Maggi Meal',    130, 3),
  ('Ramen Combo',   'Korean Paneer Ramen',  30,  1),
  ('Ramen Combo',   'Crispy Chicken Ramen', 40,  2),
  ('Ramen Combo',   'Korean Chicken Ramen', 70,  3),
  ('Burger Combo',  'Chicken Burger Combo', 20,  1),
  ('Burger Combo',  'Nuggets Burger Combo', 30,  2),
  ('Burger Combo',  'Zinger Burger Combo',  80,  3),
  ('Pizza Combo',   'Cheese Pizza',         20,  1),
  ('Pizza Combo',   'Mushroom Pizza',       40,  2),
  ('Pizza Combo',   'Paneer Pizza',         80,  3),
  ('Pizza Combo',   'Chicken Pizza',        100, 4),
  ('Sandwich Combo','Paneer Cheese Sandwich',20, 1),
  ('Sandwich Combo','Egg Cheese Sandwich',   20, 2),
  ('Sandwich Combo','Chicken Cheese Sandwich',30,3)
) as o(item_name, label, price, sort_order)
  on o.item_name = mi.name and ms.name = 'Combo Meals'
where c.slug = 'bowl-n-sticks';
