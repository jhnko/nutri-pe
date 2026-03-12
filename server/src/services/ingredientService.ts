import { Ingredient } from '@shared/types/records.types';
import db from '../db/index';
import {
	CreateIngredientPayload,
	UpdateIngredientPayload,
} from '@shared/types/payloads.types';
import { PoolClient } from 'pg';

export class IngredientService {
	// NON-LOCKING
	static async getIngredients(): Promise<Ingredient[]> {
		const result = await db.query(`
			SELECT ingredient_id AS id, name, calories_per_gram, protein_per_gram, carbs_per_gram, fat_per_gram
			FROM ingredients
			`);
		return result.rows;
	}

	// NON-LOCKING
	static async getIngredient(
		ingredientId: string,
	): Promise<Ingredient | { error: string }> {
		const result = await db.query(
			`
			SELECT ingredient_id AS id, name, calories_per_gram, protein_per_gram, carbs_per_gram, fat_per_gram
			FROM ingredients WHERE ingredient_id = $1
			`,
			[ingredientId],
		);

		if (result.rowCount === 0) {
			return { error: 'Ingredient does not exist' };
		}

		return result.rows[0];
	}

	// NON-LOCKING
	static async addIngredient(
		ingredient: CreateIngredientPayload,
		client?: PoolClient,
	): Promise<Ingredient> {
		const executor = client ?? db;
		const result = await executor.query(
			`
			INSERT INTO ingredients (name, calories_per_gram, protein_per_gram, carbs_per_gram, fat_per_gram)
			VALUES ($1, $2, $3, $4, $5) RETURNING *
			`,
			[
				ingredient.name,
				ingredient.calories_per_gram,
				ingredient.protein_per_gram,
				ingredient.carbs_per_gram,
				ingredient.fat_per_gram,
			],
		);
		return result.rows[0];
	}

	// NON-LOCKING
	static async updateIngredient(
		data: UpdateIngredientPayload,
		ingredientId: string,
	): Promise<Ingredient | { error: string }> {
		const result = await db.query(
			`
			UPDATE ingredients
				SET 
					name = COALESCE($1, name),
					calories_per_gram = COALESCE($2, calories_per_gram),
					protein_per_gram = COALESCE($3, protein_per_gram),
					carbs_per_gram = COALESCE($4, carbs_per_gram),
					fat_per_gram = COALESCE($5, fat_per_gram)
				WHERE ingredient_id = $6 RETURNING *
			`,
			[
				data.name,
				data.calories_per_gram,
				data.protein_per_gram,
				data.carbs_per_gram,
				data.fat_per_gram,
				ingredientId,
			],
		);

		if (result.rowCount === 0) {
			return { error: 'Ingredient does not exist' };
		}

		return result.rows[0];
	}

	// NON-LOCKING
	static async deleteIngredient(
		ingredientId: string,
	): Promise<{ success: boolean; message: string }> {
		const result = await db.query(
			`
			DELETE FROM ingredients WHERE ingredient_id = $1`,
			[ingredientId],
		);

		if (result.rowCount === 0) {
			return { success: false, message: 'Ingredient does not exist' };
		}

		return { success: true, message: 'Success' };
	}
}
