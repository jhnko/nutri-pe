import type { Amount, Ingredient, Recipe } from './records.types';

/* General */
export interface EmptyPayload {}

/* Auth */
export interface RegisterPayload {
	username: string;
	password: string;
	confirm_password: string;
}

export interface LoginPayload {
	username: string;
	password: string;
}

export interface LogoutPayload {
	reason: string;
}

/* Recipes */
export interface CreateRecipePayload extends Omit<
	Recipe,
	'id' | 'username' | 'ingredients'
> {}

export interface UpdateRecipePayload extends Partial<
	Omit<Recipe, 'id' | 'username' | 'ingredients'>
> {}

export interface AddIngredientsToRecipePayload {
	ingredients: IngredientAmount[];
}

export interface UpdateIngredientForRecipePayload {
	amount: Amount;
}

export interface RecipeIdParams {
	recipe_id: string;
}

export interface RecipeIngredientIdsParams
	extends RecipeIdParams, IngredientIdParams {}

export type IngredientAmount = [ingredient_id: number, amount: Amount];

/* Ingredients */
export interface CreateIngredientPayload extends Omit<Ingredient, 'id'> {}

export interface UpdateIngredientPayload extends Partial<
	Omit<Ingredient, 'id'>
> {}

export interface IngredientIdParams {
	ingredient_id: string;
}
