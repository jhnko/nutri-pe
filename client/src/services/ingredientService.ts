import type {
	ApiResponse,
	CreateIngredientResponse,
	GetAllIngredientsResponse,
	GetIngredientResponse,
	RequestResult,
	UpdateIngredientResponse,
} from '@shared/types/responses.types'
import apiService, { handleApiError } from './api'
import type {
	CreateIngredientPayload,
	IngredientIdParams,
	UpdateIngredientPayload,
} from '@shared/types/payloads.types'
import type { Ingredient } from '@shared/types/records.types'

export const fetchIngredients = async (): Promise<RequestResult<GetAllIngredientsResponse>> => {
	try {
		const { data } = await apiService.get<RequestResult<GetAllIngredientsResponse>>(
			'/ingredients',
			{},
		)
		return data
	} catch (err) {
		return handleApiError(err)
	}
}

export const fetchIngredient = async (
	params: IngredientIdParams,
): Promise<RequestResult<GetIngredientResponse>> => {
	try {
		const { data } = await apiService.get<RequestResult<GetIngredientResponse>>(
			`/ingredients/${params.ingredient_id}`,
			{},
		)
		return data
	} catch (err) {
		return handleApiError(err)
	}
}

export const createIngredient = async (
	payload: CreateIngredientPayload,
): Promise<RequestResult<CreateIngredientResponse>> => {
	try {
		const { data } = await apiService.post<RequestResult<CreateIngredientResponse>>(
			'/ingredients',
			payload,
		)
		return data
	} catch (err) {
		return handleApiError(err)
	}
}

export const updateIngredient = async (
	payload: UpdateIngredientPayload,
	params: IngredientIdParams,
): Promise<RequestResult<UpdateIngredientResponse>> => {
	try {
		const { data } = await apiService.patch<RequestResult<UpdateIngredientResponse>>(
			`/ingredients/${params.ingredient_id}`,
			payload,
		)
		return data
	} catch (err) {
		return handleApiError(err)
	}
}

export const deleteIngredient = async (
	params: IngredientIdParams,
): Promise<RequestResult<ApiResponse>> => {
	try {
		const { data } = await apiService.delete<RequestResult<ApiResponse>>(
			`/ingredients/${params.ingredient_id}`,
			{},
		)
		return data
	} catch (err) {
		return handleApiError(err)
	}
}

export const parseIngredient = (ingredient: Ingredient): Ingredient => {
	return {
		...ingredient,
		calories_per_gram: ingredient.calories_per_gram
			? parseFloat(ingredient.calories_per_gram as never)
			: undefined,
		protein_per_gram: ingredient.protein_per_gram
			? parseFloat(ingredient.protein_per_gram as never)
			: undefined,
		carbs_per_gram: ingredient.carbs_per_gram
			? parseFloat(ingredient.carbs_per_gram as never)
			: undefined,
		fat_per_gram: ingredient.fat_per_gram
			? parseFloat(ingredient.fat_per_gram as never)
			: undefined,
	}
}
