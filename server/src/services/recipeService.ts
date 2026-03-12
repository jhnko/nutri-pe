import { Amount, Ingredient, Recipe } from '@shared/types/records.types';
import db from '../db/index';
import { PoolClient } from 'pg';
import {
	AddIngredientsToRecipePayload,
	CreateRecipePayload,
	UpdateIngredientForRecipePayload,
	UpdateRecipePayload,
} from '@shared/types/payloads.types';

export class RecipeService {
	// LOCKING
	static async getRecipes(): Promise<Recipe[]> {
		const client = await db.connect();
		try {
			// Using transaction to avoid read inconsistencies
			await client.query('BEGIN READ ONLY');
			const { rows } = await client.query(
				'SELECT recipe_id AS id, username, title, description, instructions FROM recipes INNER JOIN users ON recipes.user_id = users.id',
			);

			const recipes = await Promise.all(
				rows.map(async (recipe) => ({
					...recipe,
					ingredients: await this.getIngredientsForRecipeId(
						recipe.id,
						client,
					),
				})),
			);
			await client.query('COMMIT');
			return recipes;
		} catch (err) {
			throw err;
		} finally {
			client.release();
		}
	}

	// LOCKING / NON-LOCKING
	static async getRecipe(
		recipeId: string,
		injectedClient?: PoolClient,
	): Promise<Recipe | { error: string }> {
		const executor = injectedClient ?? (await db.connect());
		try {
			if (!injectedClient) await executor.query('BEGIN READ ONLY');
			let recipe = undefined;
			const res = await this.getRecipeSkeleton(recipeId, executor);
			if (res) {
				recipe = {
					...res,
					ingredients: await this.getIngredientsForRecipeId(
						recipeId,
						executor,
					),
				};
			} else {
				if (!injectedClient) await executor.query('ROLLBACK');
				return { error: 'Recipe does not exist' };
			}
			if (!injectedClient) await executor.query('COMMIT');
			return recipe;
		} catch (err) {
			throw err;
		} finally {
			if (!injectedClient) executor.release();
		}
	}

	// NON-LOCKING
	static async getRecipeSkeleton(
		recipeId: string,
		client?: PoolClient,
	): Promise<Recipe | undefined> {
		const executor = client ?? db;

		const { rows } = await executor.query(
			`
				SELECT recipe_id AS id, username, title, description, instructions
				FROM recipes INNER JOIN users ON recipes.user_id = users.id
				WHERE recipe_id = $1
				`,
			[recipeId],
		);
		return rows.length > 0 ? rows[0] : undefined;
	}

	// NON-LOCKING
	static async getIngredientsForRecipeId(
		recipeId: string,
		client?: PoolClient,
	): Promise<[Ingredient, Amount][]> {
		const executor = client ?? db;

		const result = await executor.query(
			`
			SELECT ingredient_id AS id, name, calories_per_gram, protein_per_gram, carbs_per_gram, fat_per_gram, quantity_grams
			FROM recipe_ingredients INNER JOIN ingredients USING (ingredient_id)
			WHERE recipe_id = $1
			`,
			[recipeId],
		);
		return result.rows.map(({ quantity_grams, ...ingredient }) => [
			ingredient,
			quantity_grams,
		]);
	}

	// NON-LOCKING
	static async addRecipe(
		recipe: CreateRecipePayload,
		userId: number,
		injectedClient?: PoolClient,
	): Promise<Recipe> {
		const executor = injectedClient ?? (await db.connect());
		try {
			if (!injectedClient) await executor.query('BEGIN');
			const result = await executor.query(
				`
			INSERT INTO recipes (user_id, title, description, instructions) VALUES ($1, $2, $3, $4) RETURNING recipe_id
			`,
				[userId, recipe.title, recipe.description, recipe.instructions],
			);

			const result2 = await this.getRecipe(
				result.rows[0].recipe_id,
				executor,
			);
			if ('error' in result2) throw Error('Failed to create recipe');

			return result2;
		} catch (err) {
			if (!injectedClient) await executor.query('ROLLBACK');
			throw err;
		} finally {
			if (!injectedClient) await executor.release();
		}
	}

	// LOCKING - Updates recipe iff userId is the owner of the recipe
	static async updateRecipe(
		data: UpdateRecipePayload,
		recipeId: string,
		userId: number,
	): Promise<Recipe | { error: string }> {
		const client = await db.connect();
		try {
			await client.query('BEGIN');
			const res = await this.verifyRecipeOwner(recipeId, userId, client);
			if (!res.success) {
				client.query('ROLLBACK');
				return { error: res.message };
			}

			const result = await client.query(
				`
				UPDATE recipes
				SET 
					title = COALESCE($1, title),
					description = COALESCE($2, description),
					instructions = COALESCE($3, instructions)
				WHERE recipe_id = $4
				`,
				[data.title, data.description, data.instructions, recipeId],
			);

			if (result.rowCount === 0) {
				return { error: 'Recipe does not exist' };
			}

			const recipe = this.getRecipe(recipeId, client);
			await client.query('COMMIT');
			return recipe;
		} catch (err) {
			client.query('ROLLBACK');
			throw err;
		} finally {
			client.release();
		}
	}

	// LOCKING - Deletes recipe iff userId is the owner of the recipe
	static async deleteRecipe(
		recipeId: string,
		userId: number,
	): Promise<{ success: boolean; message: string }> {
		const client = await db.connect();
		try {
			await client.query('BEGIN');
			const res = await this.verifyRecipeOwner(recipeId, userId, client);
			if (!res.success) {
				client.query('ROLLBACK');
				return res;
			}
			await client.query(`DELETE FROM recipes WHERE recipe_id = $1`, [
				recipeId,
			]);

			await client.query('COMMIT');
			return { success: true, message: 'Success' };
		} catch (err) {
			client.query('ROLLBACK');
			throw err;
		} finally {
			client.release();
		}
	}

	// NON-LOCKING
	static async verifyRecipeOwner(
		recipeId: string,
		userId: number,
		client?: PoolClient,
	): Promise<{ success: boolean; message: string }> {
		const executor = client ?? db;
		const { rows } = await executor.query(
			`SELECT user_id FROM recipes WHERE recipe_id = $1`,
			[recipeId],
		);
		if (rows.length === 0)
			return { success: false, message: 'Recipe does not exist' };
		if (+rows[0].user_id !== userId)
			return { success: false, message: 'Not permitted' };

		return { success: true, message: 'Success' };
	}

	// LOCKING
	static async linkIngredientsToRecipe(
		data: AddIngredientsToRecipePayload,
		recipeId: string,
		userId: number,
	): Promise<Recipe | { error: string }> {
		const client = await db.connect();
		try {
			await client.query('BEGIN');
			const res = await this.verifyRecipeOwner(recipeId, userId, client);
			if (!res.success) {
				client.query('ROLLBACK');
				return { error: res.message };
			}
			if (data.ingredients.length === 0) {
				client.query('ROLLBACK');
				return { error: 'No ingredients provided' };
			}

			const ingredientIds = data.ingredients.map(([id, _]) => id);
			const amounts = data.ingredients.map(([_, amount]) => amount);

			// Produces a query with all ingredients to add instead of looping a single query
			await client.query(
				`
				INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity_grams)
				SELECT $1, unnest($2::int[]), unnest($3::numeric[])
				`,
				[recipeId, ingredientIds, amounts],
			);

			const recipe = await this.getRecipe(recipeId, client);
			if ('error' in recipe) {
				client.query('ROLLBACK');
				return { error: 'Failed to link ingredients' };
			}

			await client.query('COMMIT');
			return recipe;
		} catch (err) {
			client.query('ROLLBACK');
			throw err;
		} finally {
			client.release();
		}
	}

	// LOCKING
	static async updateLinkIngredientToRecipe(
		data: UpdateIngredientForRecipePayload,
		recipeId: string,
		ingredientId: string,
		userId: number,
	): Promise<Recipe | { error: string }> {
		const client = await db.connect();
		try {
			await client.query('BEGIN');
			const res = await this.verifyRecipeOwner(recipeId, userId, client);
			if (!res.success) {
				client.query('ROLLBACK');
				return { error: res.message };
			}
			if (+data.amount === 0) {
				client.query('ROLLBACK');
				return { error: 'Amount cannot be zero' };
			}

			const result = await client.query(
				`
				UPDATE recipe_ingredients SET quantity_grams = $1 WHERE recipe_id = $2 AND ingredient_id = $3
				`,
				[data.amount, recipeId, ingredientId],
			);

			if (result.rowCount === 0) {
				client.query('ROLLBACK');
				return { error: 'Ingredient not found on recipe' };
			}

			const recipe = await this.getRecipe(recipeId, client);
			if (!recipe) {
				client.query('ROLLBACK');
				return { error: 'Failed update ingredient' };
			}

			await client.query('COMMIT');
			return recipe;
		} catch (err) {
			client.query('ROLLBACK');
			throw err;
		} finally {
			client.release();
		}
	}

	// LOCKING
	static async deleteLinkIngredientToRecipe(
		recipeId: string,
		ingredientId: string,
		userId: number,
	): Promise<{ success: boolean; message: string }> {
		const client = await db.connect();
		try {
			await client.query('BEGIN');
			const res = await this.verifyRecipeOwner(recipeId, userId, client);
			if (!res.success) {
				client.query('ROLLBACK');
				return res;
			}

			const result = await client.query(
				`
				DELETE FROM recipe_ingredients WHERE recipe_id = $1 AND ingredient_id = $2
				`,
				[recipeId, ingredientId],
			);

			if (result.rowCount === 0) {
				client.query('ROLLBACK');
				return {
					success: false,
					message: 'Ingredient not found on recipe',
				};
			}

			await client.query('COMMIT');
			return { success: true, message: 'Success' };
		} catch (err) {
			client.query('ROLLBACK');
			throw err;
		} finally {
			client.release();
		}
	}
}
