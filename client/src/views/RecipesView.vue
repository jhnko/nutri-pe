<script setup lang="ts">
import ItemBrowser, { type ActiveFilters, type FilterTerm } from '@/components/ItemBrowser.vue';
import { computed, onMounted, ref } from 'vue';
import type { Recipe } from '@shared/types/records.types';
import RecipeItem from '@/components/RecipeItem.vue';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-vue-next';
import { useRecipeStore } from '@/stores/recipe';
import { toast } from 'vue-sonner';

// We will have a allArray for all items and a computedArray, the computedArray will always be passed in, but only differ when search and/or filters are enabled.
// Apply filter first then search
//

const recipeStore = useRecipeStore()

const searchTerm = ref<string>("")
const filterTerms = ref<ActiveFilters>({})

onMounted(async () => {
	const startLen = recipeStore.recipes.length
	const { success, message } = await recipeStore.loadRecipes();

	if (success) {
		if (startLen !== recipeStore.recipes.length) {
			toast.success(`Loaded ${recipeStore.recipes.length} recipes`, {
				description: message
			})
		}
	} else {
		toast.error("Failed to load recipes", {
			description: message
		})
	}
})

const filterTermsDefinition: FilterTerm[] = [
	{ key: 'hasIngredients', label: 'Has ingredients', default: false },
	{ key: 'hasDescription', label: 'Has description', default: false },
	{ key: 'hasInstructions', label: 'Has instructions', default: false },
]


const computedItems = computed<Recipe[]>(() => {
	let result = recipeStore.recipes;
	if (searchTerm.value.length > 0) {
		const term = searchTerm.value.toLowerCase()
		result = result.filter(recipe =>
			recipe.title?.toLowerCase().includes(term) ||
			recipe.description?.toLowerCase().includes(term) ||
			recipe.instructions?.toLowerCase().includes(term)
		)
	}
	for (const [key, value] of Object.entries(filterTerms.value)) {
		if (!value) continue
		if (key === 'hasIngredients') result = result.filter(r => r.ingredients.length > 0)
		if (key === 'hasDescription') result = result.filter(r => !!r.description)
		if (key === 'hasInstructions') result = result.filter(r => !!r.instructions)
	}
	return result
})


</script>

<template>
	<div class="min-h-0 p-5 flex font-lato grow max-h-screen">
		<ItemBrowser :items=computedItems :item-component="RecipeItem" :search-enabled="true" :filter-enabled="true"
			:filter-terms="filterTermsDefinition" @update:search="(s: string) => searchTerm = s"
			@update:filters="(f) => filterTerms = f">
			<template #add-action>
				<RouterLink :to="{ name: 'recipe-edit' }">
					<Button variant="outline" class="aspect-square bg-green-500 cursor-pointer text-white"
						size="icon-lg">
						<Plus />
					</Button>
				</RouterLink>
			</template>
		</ItemBrowser>
	</div>
</template>
