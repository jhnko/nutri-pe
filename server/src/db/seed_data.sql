-- Seed data for ingredients table
-- Example data, note GenAI was used to generate this file and thus the nutritional values should NOT be trusted.
INSERT INTO ingredients (name, calories_per_gram, protein_per_gram, carbs_per_gram, fat_per_gram) VALUES
-- Grains & Starches
('White Rice, cooked',        1.3000, 0.0270, 0.2800, 0.0030),
('Brown Rice, cooked',        1.1200, 0.0260, 0.2300, 0.0090),
('Pasta, cooked',             1.3100, 0.0500, 0.2500, 0.0110),
('Bread, white',              2.6500, 0.0910, 0.4900, 0.0320),
('Bread, whole wheat',        2.4700, 0.1300, 0.4100, 0.0340),
('Oats, rolled dry',          3.8900, 0.1700, 0.6600, 0.0700),
('Flour, all-purpose',        3.6400, 0.1000, 0.7600, 0.0100),
('Potato, raw',               0.7700, 0.0200, 0.1700, 0.0010),

-- Meat & Poultry
('Chicken Breast, raw',       1.1500, 0.2310, 0.0000, 0.0260),
('Chicken Thigh, raw',        1.7700, 0.1770, 0.0000, 0.1110),
('Ground Beef, raw',          2.1200, 0.1870, 0.0000, 0.1470),
('Beef Steak, raw',           1.5800, 0.2200, 0.0000, 0.0790),
('Pork Chop, raw',            1.7200, 0.2110, 0.0000, 0.1000),
('Bacon, raw',                4.1700, 0.1230, 0.0140, 0.3960),
('Lamb, raw',                 2.7400, 0.1690, 0.0000, 0.2330),
('Turkey Breast, raw',        1.0400, 0.2200, 0.0000, 0.0130),

-- Seafood
('Salmon, raw',               2.0800, 0.2000, 0.0000, 0.1300),
('Tuna, canned in water',     1.1600, 0.2580, 0.0000, 0.0270),
('Shrimp, raw',               0.7100, 0.1360, 0.0000, 0.0110),
('Cod, raw',                  0.8200, 0.1780, 0.0000, 0.0070),
('Tilapia, raw',              0.9600, 0.2000, 0.0000, 0.0170),

-- Dairy & Eggs
('Egg, whole raw',            1.4300, 0.1260, 0.0072, 0.0950),
('Milk, whole',               0.6100, 0.0320, 0.0470, 0.0330),
('Milk, skim',                0.3400, 0.0340, 0.0500, 0.0020),
('Cheddar Cheese',            4.0200, 0.2490, 0.0130, 0.3310),
('Greek Yogurt, plain',       0.5900, 0.1000, 0.0360, 0.0090),
('Butter',                    7.1700, 0.0085, 0.0006, 0.8100),
('Heavy Cream',               3.4000, 0.0230, 0.0280, 0.3600),
('Cottage Cheese',            0.9800, 0.1100, 0.0340, 0.0430),

-- Vegetables
('Broccoli, raw',             0.3400, 0.0280, 0.0660, 0.0040),
('Spinach, raw',              0.2300, 0.0290, 0.0360, 0.0040),
('Carrot, raw',               0.4100, 0.0093, 0.0960, 0.0024),
('Onion, raw',                0.4000, 0.0110, 0.0930, 0.0010),
('Garlic, raw',               1.4900, 0.0640, 0.3300, 0.0050),
('Tomato, raw',               0.1800, 0.0088, 0.0390, 0.0020),
('Bell Pepper, raw',          0.3100, 0.0099, 0.0600, 0.0030),
('Zucchini, raw',             0.1700, 0.0120, 0.0310, 0.0032),
('Mushrooms, raw',            0.2200, 0.0310, 0.0330, 0.0035),
('Sweet Corn, raw',           0.8600, 0.0320, 0.1900, 0.0130),

-- Legumes
('Lentils, cooked',           1.1600, 0.0900, 0.2000, 0.0038),
('Chickpeas, cooked',         1.6400, 0.0860, 0.2700, 0.0260),
('Black Beans, cooked',       1.3200, 0.0860, 0.2380, 0.0054),

-- Nuts, Seeds & Oils
('Almonds',                   5.7900, 0.2120, 0.2170, 0.4990),
('Peanut Butter',             5.8800, 0.2210, 0.2000, 0.5000),
('Olive Oil',                 8.8400, 0.0000, 0.0000, 1.0000),
('Vegetable Oil',             8.8400, 0.0000, 0.0000, 1.0000),
('Sunflower Seeds',           5.8400, 0.2090, 0.2000, 0.5100),

-- Fruits
('Banana, raw',               0.8900, 0.0110, 0.2280, 0.0033),
('Apple, raw',                0.5200, 0.0026, 0.1380, 0.0017),
('Orange, raw',               0.4700, 0.0094, 0.1180, 0.0012);