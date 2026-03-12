import type {
	ApiResponse,
	CreateRecipeResponse,
	GetAllRecipesResponse,
	GetRecipeResponse,
	RequestResult,
	UpdateRecipeResponse,
} from '@shared/types/responses.types'
import apiService, { handleApiError } from './api'
import type {
	AddIngredientsToRecipePayload,
	CreateRecipePayload,
	RecipeIdParams,
	RecipeIngredientIdsParams,
	UpdateIngredientForRecipePayload,
	UpdateRecipePayload,
} from '@shared/types/payloads.types'
import type { Recipe } from '@shared/types/records.types'
import { parseIngredient } from './ingredientService'

export const fetchRecipes = async (): Promise<RequestResult<GetAllRecipesResponse>> => {
	try {
		const { data } = await apiService.get<RequestResult<GetAllRecipesResponse>>('/recipes', {})
		return data
	} catch (err) {
		return handleApiError(err)
	}
}

export const fetchRecipe = async (
	params: RecipeIdParams,
): Promise<RequestResult<GetRecipeResponse>> => {
	try {
		const { data } = await apiService.get<RequestResult<GetRecipeResponse>>(
			`/recipes/${params.recipe_id}`,
			{},
		)
		return data
	} catch (err) {
		return handleApiError(err)
	}
}

export const createRecipe = async (
	payload: CreateRecipePayload,
): Promise<RequestResult<CreateRecipeResponse>> => {
	try {
		const { data } = await apiService.post<RequestResult<CreateRecipeResponse>>(
			'/recipes',
			payload,
		)
		return data
	} catch (err) {
		return handleApiError(err)
	}
}

export const updateRecipe = async (
	payload: UpdateRecipePayload,
	params: RecipeIdParams,
): Promise<RequestResult<UpdateRecipeResponse>> => {
	try {
		const { data } = await apiService.patch<RequestResult<UpdateRecipeResponse>>(
			`/recipes/${params.recipe_id}`,
			payload,
		)
		return data
	} catch (err) {
		return handleApiError(err)
	}
}

export const deleteRecipe = async (params: RecipeIdParams): Promise<RequestResult<ApiResponse>> => {
	try {
		const { data } = await apiService.delete<RequestResult<ApiResponse>>(
			`/recipes/${params.recipe_id}`,
			{},
		)
		return data
	} catch (err) {
		return handleApiError(err)
	}
}

export const linkIngredientsToRecipe = async (
	payload: AddIngredientsToRecipePayload,
	params: RecipeIdParams,
): Promise<RequestResult<UpdateRecipeResponse>> => {
	try {
		const { data } = await apiService.post<RequestResult<UpdateRecipeResponse>>(
			`/recipes/${params.recipe_id}/ingredients`,
			payload,
		)
		return data
	} catch (err) {
		return handleApiError(err)
	}
}

export const updateIngredientForRecipe = async (
	payload: UpdateIngredientForRecipePayload,
	params: RecipeIngredientIdsParams,
): Promise<RequestResult<UpdateRecipeResponse>> => {
	try {
		const { data } = await apiService.patch<RequestResult<UpdateRecipeResponse>>(
			`/recipes/${params.recipe_id}/ingredients/${params.ingredient_id}`,
			payload,
		)
		return data
	} catch (err) {
		return handleApiError(err)
	}
}

export const unlinkIngredientFromRecipe = async (
	params: RecipeIngredientIdsParams,
): Promise<RequestResult<ApiResponse>> => {
	try {
		const { data } = await apiService.delete<RequestResult<ApiResponse>>(
			`/recipes/${params.recipe_id}/ingredients/${params.ingredient_id}`,
			{},
		)
		return data
	} catch (err) {
		return handleApiError(err)
	}
}

export const parseRecipe = (recipe: Recipe): Recipe => {
	return {
		...recipe,
		ingredients: recipe.ingredients.map(([ingredient, amount]) => [
			parseIngredient(ingredient),
			amount,
		]),
	}
}
