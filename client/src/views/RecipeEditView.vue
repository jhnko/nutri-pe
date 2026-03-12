<script setup lang="ts">
import IngredientItem from '@/components/IngredientItem.vue';
import NutrientRow from '@/components/NutrientRow.vue';
import IngredientsView from './IngredientsView.vue';
import { Button } from '@/components/ui/button';
import { FormField, FormLabel, FormItem, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { Ingredient } from '@shared/types/records.types';
import { toTypedSchema } from '@vee-validate/zod';
import { Plus, Save, Trash, X } from 'lucide-vue-next';
import { useForm } from 'vee-validate';
import { computed, ref } from 'vue';
import * as z from 'zod'
import { vAutoAnimate } from '@formkit/auto-animate';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useRecipeStore } from '@/stores/recipe';
import type { AddIngredientsToRecipePayload } from '@shared/types/payloads.types';
import { toast } from 'vue-sonner';
import { useRoute, useRouter } from 'vue-router';


const recipeStore = useRecipeStore()
const router = useRouter()
const route = useRoute()

const recipe = computed(() => {
	const id = route.params.id
	if (!id) return undefined
	return recipeStore.getRecipeById(+id)
})

const editMode = computed(() => !!recipe.value)

const ingredients = ref<[Ingredient, number][]>(
	recipe.value?.ingredients.map(([ingredient, amount]) => [ingredient, amount]) ?? []
)

const ingredientCount = computed(() => ingredients.value.length)
const totals = computed(() => {
	return ingredients.value.reduce(
		(acc, [ingredient, amount]) => {
			acc.calories += (ingredient.calories_per_gram ?? 0) * amount
			acc.protein += (ingredient.protein_per_gram ?? 0) * amount
			acc.carbs += (ingredient.carbs_per_gram ?? 0) * amount
			acc.fat += (ingredient.fat_per_gram ?? 0) * amount
			return acc
		},
		{ calories: 0, protein: 0, carbs: 0, fat: 0 }
	)
})

const dialogOpen = ref(false)

const saveClicked = () => {
	onSubmit();
}

const cancelClicked = () => {
	router.push({ name: "recipes" })
}

const deleteClicked = async () => {
	if (recipe.value) {
		const { success, message } = await recipeStore.removeRecipe(recipe.value.id)
		if (success) {
			toast.success('Recipe deleted', {
				description: message
			})
			router.push({ name: "recipes" })
		} else {
			toast.error("Failed to delete recipe", {
				description: message
			})
		}
	}
}

const formSchema = toTypedSchema(z.object({
	title: z
		.string({ required_error: "This field is required" })
		.nonempty({ message: "This field is required" })
		.min(1, { message: "Title is too short" })
		.max(255, { message: "Title is too long" }),
	description: z
		.string({ required_error: "This field is required" })
		.nonempty({ message: "This field is required" })
		.min(5, { message: "Description is too short" })
		.max(255, { message: "Description is too long" }),
	instructions: z
		.string({ required_error: "This field is required" })
		.nonempty({ message: "This field is required" })
		.min(5, { message: "Instructions is too short" })
		.max(1000, { message: "Instructions is too long" }),
}))

const form = useForm({
	validationSchema: formSchema,
	initialValues: {
		title: recipe.value?.title ?? '',
		description: recipe.value?.description ?? '',
		instructions: recipe.value?.instructions ?? '',
	}
})

const onSubmit = form.handleSubmit(async (values) => {
	const iPayload: AddIngredientsToRecipePayload = {
		ingredients: ingredients.value.map((i) => [i[0].id, i[1]])
	}

	if (editMode.value) {
		// Update recipe
		if (!recipe.value) return;
		const { success, message } = await recipeStore.editRecipe(recipe.value?.id, values, iPayload)
		if (success) {
			toast.success('Recipe updated', {
				description: message
			})
			router.push({ name: "recipes" })
		} else {
			toast.error("Failed to update recipe", {
				description: message
			})
		}
	} else {
		// Create a new recipe
		const { success, message } = await recipeStore.insertRecipe(values, iPayload)
		if (success) {
			toast.success('Recipe created', {
				description: message
			})
			router.push({ name: "recipes" })
		} else {
			toast.error("Failed to create recipe", {
				description: message
			})
		}
	}
})

const toggleIngredientDialog = () => {
	dialogOpen.value = !dialogOpen.value
}

const addIngredient = (ingredient: Ingredient, amount: number) => {
	// Add if it does not exist already
	if (!ingredients.value.some(e => e[0].id === ingredient.id)) {
		ingredients.value.push([ingredient, amount])
	}
	toggleIngredientDialog();
}

const deleteIngredient = (ingredient: Ingredient) => {
	const i = ingredients.value.findIndex(([e]) => e.id === ingredient.id)
	if (i > -1) {
		ingredients.value.splice(i, 1)
	}
}

</script>

<template>
	<div class="p-5 flex font-lato grow max-h-screen">
		<div class="grow flex flex-col max-h-full">
			<div
				class="bg-light-gold-100 row-span-2 border-b-2 border-light-gold-400 rounded-t-xl p-5 flex flex-row gap-5">
				<div class="flex flex-col gap-1.5">
					<div class="text-xl">{{ editMode ? 'Edit' : 'Add' }} Recipe</div>
				</div>
				<div class="ml-auto flex flex-row gap-1.5">
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger>
								<Button variant="outline" class="aspect-square bg-green-500 cursor-pointer text-white"
									size="icon-lg" @click="saveClicked">
									<Save />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<div class="text-sm">Save</div>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>

					<TooltipProvider v-if="editMode">
						<Tooltip>
							<TooltipTrigger>
								<Button variant="outline" class="aspect-square bg-red-500 cursor-pointer text-white"
									size="icon-lg" @click="cancelClicked">
									<X />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<div class="text-sm">Cancel</div>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>

					<TooltipProvider v-if="editMode">
						<Tooltip>
							<TooltipTrigger>
								<Button variant="outline" class="aspect-square bg-red-500 cursor-pointer text-white"
									size="icon-lg" @click="deleteClicked">
									<Trash />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<div class="text-sm">Delete</div>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
			</div>

			<div class="row-span-10 p-5 rounded-b-xl grow flex min-h-0 overflow-hidden">
				<form class="m-0 p-0 grow flex min-h-0 overflow-hidden">
					<div class="grid grid-cols-12 gap-2 grid-rows-6 grow min-h-0 overflow-hidden">
						<!--title-->
						<div class="col-span-12 sm:col-span-4 row-span-1">
							<FormField name="title" v-slot="{ componentField }">
								<FormItem v-auto-animate>
									<FormLabel>Title</FormLabel>
									<FormControl>
										<Input v-bind="componentField" placeholder="Enter a title for the recipe..."
											class="border-royal-gold-200 bg-light-gold-50" />
									</FormControl>
									<FormDescription />
									<FormMessage />
								</FormItem>
							</FormField>
						</div>
						<!--description-->
						<div class="col-span-12 sm:col-span-4 row-start-2 min-h-0 overflow-hidden row-span-2">
							<FormField name="description" v-slot="{ componentField }">
								<FormItem v-auto-animate class="h-full flex flex-col">
									<FormLabel>Description</FormLabel>
									<FormControl class="flex-1 min-h-0">
										<Textarea v-bind="componentField"
											placeholder="Enter a description of the recipe..."
											class="border-royal-gold-200 bg-light-gold-50 resize-none h-full" />
									</FormControl>
									<FormDescription />
									<FormMessage />
								</FormItem>
							</FormField>
						</div>
						<!--instructions-->
						<div class="col-span-12 sm:col-span-4 row-start-4 min-h-0 overflow-hidden row-span-3">
							<FormField name="instructions" v-slot="{ componentField }">
								<FormItem v-auto-animate class="h-full flex flex-col">
									<FormLabel>Instructions</FormLabel>
									<FormControl class="flex-1 min-h-0">
										<Textarea v-bind="componentField"
											placeholder="Enter instructions for the recipe..."
											class="border-royal-gold-200 bg-light-gold-50 resize-none h-full" />
									</FormControl>
									<FormDescription />
									<FormMessage />
								</FormItem>
							</FormField>
						</div>
						<!--ingredients-->
						<div
							class="col-span-12 sm:col-span-8 sm:row-start-1 min-h-0 row-span-6 flex flex-col gap-2 p-2 overflow-hidden">
							<div
								class="flex-1 min-h-0 flex flex-col gap-1 rounded-lg border border-light-gold-400 bg-light-gold-50 p-2 overflow-y-auto">
								<div v-for="([ingredient], index) in (ingredients)" :key="ingredient.id"
									class="grid grid-cols-12 items-center gap-1 border-b border-light-gold-200 py-1 last:border-b-0">
									<div class="col-span-7">
										<IngredientItem :item="ingredient" />
									</div>
									<div class="col-span-2 text-center text-sm">
										<Input v-model.number="ingredients[index]![1]"
											class="text-center text-sm w-15 p-0" /> grams
									</div>
									<div class="col-span-3 flex gap-1 justify-end">
										<Button variant="outline" size="icon" class="cursor-pointer text-red-500"
											@click="deleteIngredient(ingredient)">
											<Trash class="w-4 h-4" />
										</Button>
									</div>
								</div>

								<div v-if="ingredients.length === 0"
									class="flex-1 flex items-center justify-center text-sm text-muted-foreground">
									No ingredients
								</div>
							</div>

							<div
								class="rounded-lg border border-light-gold-400 bg-light-gold-100 px-3 py-2 text-sm flex justify-between gap-15">
								<div class="grow flex flex-col justify-center">
									<NutrientRow :calories="totals.calories == 0 ? '?' : totals.calories"
										:protein="Math.round(totals.protein) == 0 ? '?' : Math.round(totals.protein)"
										:carbohydrates="Math.round(totals.carbs) == 0 ? '?' : Math.round(totals.carbs)"
										:fat="Math.round(totals.fat) == 0 ? '?' : Math.round(totals.fat)"
										:count="ingredientCount" />
								</div>
								<div>
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger>
												<Button variant="outline" type="button"
													@click.prevent="toggleIngredientDialog"
													class="aspect-square bg-green-500 cursor-pointer text-white"
													size="icon-lg">
													<Plus />
												</Button>
											</TooltipTrigger>
											<TooltipContent>
												<div class="text-sm">Add ingredient</div>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								</div>
							</div>
						</div>
					</div>
				</form>
			</div>
		</div>
	</div>
	<Dialog v-model:open="dialogOpen">
		<DialogContent class="max-w-none! w-2/3 max-h-none! h-2/3 flex flex-col">
			<DialogHeader>
				<DialogTitle>Add an ingridient</DialogTitle>
				<DialogDescription>
					Use the ingredient browser below to find an ingredient to add, click an ingredient to add it
					to the recipe.
				</DialogDescription>
			</DialogHeader>
			<IngredientsView :read-only="true" @item-clicked="e => addIngredient(e, 0)"
				:hide-ingredients="ingredients.map(i => i[0].id)" />
		</DialogContent>
	</Dialog>
</template>
