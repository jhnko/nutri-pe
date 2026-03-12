import type { Ingredient, Recipe } from './records.types';

/* General */
export interface ApiResponse {
	status: number;
	message: string;
}

export interface ErrorResponse extends ApiResponse {
	code?: number;
}

export type RequestResult<T> =
	| { success: true; response: T }
	| { success: false; response: ErrorResponse };

/* Auth */
export interface LoginResponse extends ApiResponse {
	id: number;
	username: string;
}

export interface RegisterResponse extends ApiResponse {
	id: number;
	username: string;
}

/* Recipes */
export interface GetAllRecipesResponse extends ApiResponse {
	recipes: Recipe[];
}

export interface GetRecipeResponse extends ApiResponse {
	recipe: Recipe;
}

export interface CreateRecipeResponse extends GetRecipeResponse {}
export interface UpdateRecipeResponse extends GetRecipeResponse {}

/* Ingredients */
export interface GetAllIngredientsResponse extends ApiResponse {
	ingredients: Ingredient[];
}

export interface GetIngredientResponse extends ApiResponse {
	ingredient: Ingredient;
}

export interface CreateIngredientResponse extends GetIngredientResponse {}
export interface UpdateIngredientResponse extends GetIngredientResponse {}
