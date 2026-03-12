-- Create users table
CREATE TABLE IF NOT EXISTS users (
	id SERIAL PRIMARY KEY,
	username VARCHAR(50) NOT NULL UNIQUE,
	password_hash VARCHAR(255) NOT NULL
);

-- Create tokens table (for refresh tokens)
CREATE TABLE IF NOT EXISTS tokens (
	id SERIAL PRIMARY KEY,
	user_id INT NOT NULL,
	token VARCHAR(500) NOT NULL UNIQUE,
	expires_at TIMESTAMP NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	revoked BOOLEAN DEFAULT FALSE,
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_tokens_token ON tokens(token);
CREATE INDEX IF NOT EXISTS idx_tokens_user_id ON tokens(user_id);

-- Create recipes table
CREATE TABLE IF NOT EXISTS recipes (
	recipe_id SERIAL PRIMARY KEY,
	user_id INT NOT NULL,
	title VARCHAR(255) NOT NULL,
	description TEXT,
	instructions TEXT,
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create ingredients table
CREATE TABLE IF NOT EXISTS ingredients (
	ingredient_id SERIAL PRIMARY KEY,
	name VARCHAR(255) NOT NULL,
	calories_per_gram DECIMAL(8,4),
	protein_per_gram DECIMAL(8,4),
	carbs_per_gram DECIMAL(8,4),
	fat_per_gram DECIMAL(8,4)
);

-- Create recipe_ingredients table
CREATE TABLE IF NOT EXISTS recipe_ingredients (
	recipe_id INT NOT NULL,
	ingredient_id INT NOT NULL,
	quantity_grams DECIMAL(10,2) NOT NULL,
	PRIMARY KEY (recipe_id, ingredient_id),
	FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id) ON DELETE CASCADE,
	FOREIGN KEY (ingredient_id) REFERENCES ingredients(ingredient_id) ON DELETE CASCADE
);