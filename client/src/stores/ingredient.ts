import {
	createIngredient,
	deleteIngredient,
	fetchIngredient,
	fetchIngredients,
	parseIngredient,
	updateIngredient,
} from '@/services/ingredientService'
import type { CreateIngredientPayload, UpdateIngredientPayload } from '@shared/types/payloads.types'
import type { Ingredient } from '@shared/types/records.types'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useIngredientStore = defineStore('ingredient', () => {
	// State
	const ingredientsById = ref<Record<number, Ingredient>>({})

	// Getters
	const ingredients = computed(() => Object.values(ingredientsById.value))

	const getIngredientById = computed(() => {
		return (ingredientId: number) => ingredientsById.value[ingredientId]
	})

	// Actions
	async function loadIngredients(): Promise<{ success: boolean; message: string }> {
		const { success, response } = await fetchIngredients()
		if (success) {
			ingredientsById.value = Object.fromEntries(
				response.ingredients.map((i) => [i.id, parseIngredient(i)]),
			)
		}
		return { success: success, message: response.message }
	}

	async function loadIngredient(
		ingredientId: number,
	): Promise<{ success: boolean; message: string }> {
		const { success, response } = await fetchIngredient({
			ingredient_id: ingredientId.toString(),
		})
		if (success) {
			ingredientsById.value[ingredientId] = parseIngredient(response.ingredient)
		}
		return { success: success, message: response.message }
	}

	async function insertIngredient(
		payload: CreateIngredientPayload,
	): Promise<{ success: boolean; message: string }> {
		const { success, response } = await createIngredient(payload)
		if (success) {
			ingredientsById.value[response.ingredient.id] = parseIngredient(response.ingredient)
		}
		return { success: success, message: response.message }
	}

	async function editIngredient(
		ingredientId: number,
		payload: UpdateIngredientPayload,
	): Promise<{ success: boolean; message: string }> {
		const { success, response } = await updateIngredient(payload, {
			ingredient_id: ingredientId.toString(),
		})
		if (success) {
			ingredientsById.value[ingredientId] = parseIngredient(response.ingredient)
		}
		return { success: success, message: response.message }
	}

	async function removeIngredient(
		ingredientId: number,
	): Promise<{ success: boolean; message: string }> {
		const { success, response } = await deleteIngredient({
			ingredient_id: ingredientId.toString(),
		})
		if (success) {
			const { [ingredientId]: _, ...rest } = ingredientsById.value
			ingredientsById.value = rest
		}
		return { success: success, message: response.message }
	}

	return {
		ingredients,
		getIngredientById,
		loadIngredients,
		loadIngredient,
		insertIngredient,
		editIngredient,
		removeIngredient,
	}
})
