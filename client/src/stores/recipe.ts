import { defineStore } from 'pinia'
import type { Recipe } from '@shared/types/records.types'
import { computed, ref } from 'vue'
import {
	createRecipe,
	deleteRecipe,
	fetchRecipe,
	fetchRecipes,
	linkIngredientsToRecipe,
	parseRecipe,
	unlinkIngredientFromRecipe,
	updateIngredientForRecipe,
	updateRecipe,
} from '@/services/recipeService'
import type {
	AddIngredientsToRecipePayload,
	CreateRecipePayload,
	UpdateRecipePayload,
} from '@shared/types/payloads.types'

export const useRecipeStore = defineStore('recipe', () => {
	// State
	const recipesById = ref<Record<number, Recipe>>({})

	// Getters
	const recipes = computed(() => Object.values(recipesById.value))

	const getRecipeById = computed(() => {
		return (recipeId: number) => recipesById.value[recipeId]
	})

	// Actions
	async function loadRecipes(): Promise<{ success: boolean; message: string }> {
		const { success, response } = await fetchRecipes()
		if (success) {
			recipesById.value = Object.fromEntries(
				response.recipes.map((r) => [r.id, parseRecipe(r)]),
			)
		}
		return { success: success, message: response.message }
	}

	async function loadRecipe(recipeId: number): Promise<{ success: boolean; message: string }> {
		const { success, response } = await fetchRecipe({ recipe_id: recipeId.toString() })
		if (success) {
			recipesById.value[recipeId] = parseRecipe(response.recipe)
		}
		return { success: success, message: response.message }
	}

	async function insertRecipe(
		rPayload: CreateRecipePayload,
		iPayload: AddIngredientsToRecipePayload,
	): Promise<{ success: boolean; message: string }> {
		const result = { success: false, message: 'Unknown error' }
		const recipeResult = await createRecipe(rPayload)
		if (recipeResult.success) {
			const recipeId = recipeResult.response.recipe.id
			const ingredientsResult = await linkIngredientsToRecipe(iPayload, {
				recipe_id: recipeId.toString(),
			})

			if (ingredientsResult.success) {
				// Success, update recipe with ingredients
				recipesById.value[recipeId] = parseRecipe(ingredientsResult.response.recipe)
				result.success = true
				result.message = ingredientsResult.response.message
			} else {
				// Failed to insert ingredients, but recipe creation was successful, update recipe
				recipesById.value[recipeId] = parseRecipe(recipeResult.response.recipe)
				result.success = false
				result.message = ingredientsResult.response.message
			}
		} else {
			// Failed to create recipe
			result.success = false
			result.message = recipeResult.response.message
		}
		return result
	}

	async function editRecipe(
		recipeId: number,
		rPayload: UpdateRecipePayload,
		iPayload: AddIngredientsToRecipePayload,
	): Promise<{ success: boolean; message: string }> {
		const curRecipe = recipesById.value[recipeId]
		if (!curRecipe)
			return { success: false, message: 'Recipe does not exist, try reloading the page' }
		const shouldUpdateRecipe = (() => {
			if (curRecipe.title !== rPayload.title) return true
			if (curRecipe.description !== rPayload.description) return true
			if (curRecipe.instructions !== rPayload.instructions) return true
			return false
		})()

		if (shouldUpdateRecipe) {
			const recipeResult = await updateRecipe(rPayload, { recipe_id: recipeId.toString() })
			if (!recipeResult.success) {
				// Failed to update recipe
				return { success: false, message: recipeResult.response.message }
			}
		}

		let failedIngredients = 0
		let lastErrorMessage = ''
		const parsedIngredients: number[] = []
		// Update needed ingredients
		for (const ip of iPayload.ingredients) {
			const recipeIngredient = curRecipe.ingredients.find(
				([ingredient]) => ingredient.id === ip[0],
			)
			// Check if it should be linked
			const shouldBeLinked = !recipeIngredient

			// Check if it should be updated
			const shouldUpdateIngredient = (() => {
				if (shouldBeLinked) return false
				if (ip[1] !== recipeIngredient[1]) return true
			})()

			if (shouldBeLinked) {
				// Link the ingredient
				const { success, response } = await linkIngredientsToRecipe(
					{ ingredients: [ip] },
					{ recipe_id: recipeId.toString() },
				)
				if (!success) {
					failedIngredients++
					lastErrorMessage = response.message
				}
			}

			if (shouldUpdateIngredient) {
				// Update the amount for the ingredient
				const { success, response } = await updateIngredientForRecipe(
					{ amount: ip[1] },
					{ recipe_id: recipeId.toString(), ingredient_id: ip[0].toString() },
				)
				if (!success) {
					failedIngredients++
					lastErrorMessage = response.message
				}
			}
			parsedIngredients.push(ip[0])
		}
		// Check if it should be unlinked
		for (const [ingredient] of curRecipe.ingredients) {
			if (!parsedIngredients.includes(ingredient.id)) {
				const { success, response } = await unlinkIngredientFromRecipe({
					recipe_id: recipeId.toString(),
					ingredient_id: ingredient.id.toString(),
				})
				if (!success) {
					failedIngredients++
					lastErrorMessage = response.message
				}
			}
		}

		if (failedIngredients > 0) {
			return {
				success: false,
				message: `Failed to update ingredients
						  for recipe: ${failedIngredients}/${iPayload.ingredients.length} ingredients failed.
						  Error: ${lastErrorMessage}`,
			}
		}
		loadRecipe(recipeId)
		return { success: true, message: 'Successfully updated recipe and ingredients' }
	}

	async function removeRecipe(recipeId: number): Promise<{ success: boolean; message: string }> {
		const { success, response } = await deleteRecipe({ recipe_id: recipeId.toString() })
		if (success) {
			const { [recipeId]: _, ...rest } = recipesById.value
			recipesById.value = rest
		}
		return { success: success, message: response.message }
	}

	return {
		recipes,
		getRecipeById,
		loadRecipes,
		loadRecipe,
		insertRecipe,
		editRecipe,
		removeRecipe,
	}
})
