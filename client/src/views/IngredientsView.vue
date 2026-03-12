<script setup lang="ts">
import IngredientItem from '@/components/IngredientItem.vue';
import ItemBrowser, { type ActiveFilters, type FilterTerm } from '@/components/ItemBrowser.vue';
import { Button } from '@/components/ui/button';
import { useIngredientStore } from '@/stores/ingredient';
import type { Ingredient } from '@shared/types/records.types';
import { Plus } from 'lucide-vue-next';
import { computed, onMounted, ref } from 'vue';
import { toast } from 'vue-sonner';

const props = withDefaults(defineProps<{
	readOnly?: boolean,
	hideIngredients?: number[] // Ingredient ids
}>(), {
	readOnly: false,
	hideIngredients: undefined,
})

const ingredientStore = useIngredientStore()

const searchTerm = ref<string>("")
const filterTerms = ref<ActiveFilters>({})

onMounted(async () => {
	const startLen = ingredientStore.ingredients.length
	const { success, message } = await ingredientStore.loadIngredients();

	if (success) {
		if (startLen !== ingredientStore.ingredients.length) {
			toast.success(`Loaded ${ingredientStore.ingredients.length} ingredients`, {
				description: message
			})
		}
	} else {
		toast.error("Failed to load ingredients", {
			description: message
		})
	}
})

const filterTermsDefinition: FilterTerm[] = [
	{ key: 'hasCalories', label: 'Has calories defined', default: false },
	{ key: 'hasProtein', label: 'Has protein defined', default: false },
	{ key: 'hasCarbohydrates', label: 'Has carbohydrates defined', default: false },
	{ key: 'hasFat', label: 'Has fat defined', default: false },
]

const emit = defineEmits<{
	(e: 'item-clicked', value: Ingredient): void
}>()

const computedItems = computed<Ingredient[]>(() => {
	let result = ingredientStore.ingredients

	if (props.hideIngredients) {
		result = result.filter(ingredient =>
			!props.hideIngredients!.includes(ingredient.id)
		)
	}

	if (searchTerm.value.length > 0) {
		const term = searchTerm.value.toLowerCase()
		result = result.filter(ingredient =>
			ingredient.name?.toLowerCase().includes(term)
		)
	}
	for (const [key, value] of Object.entries(filterTerms.value)) {
		if (!value) continue
		if (key === 'hasCalories') result = result.filter(i => !!i.calories_per_gram)
		if (key === 'hasProtein') result = result.filter(i => !!i.protein_per_gram)
		if (key === 'hasCarbohydrates') result = result.filter(i => !!i.carbs_per_gram)
		if (key === 'hasFat') result = result.filter(i => !!i.fat_per_gram)
	}
	return result
})

</script>

<template>
	<div class="p-5 flex font-lato grow min-h-0 max-h-screen">
		<ItemBrowser :items=computedItems :item-component="IngredientItem" :search-enabled="true" :filter-enabled="true"
			:filter-terms="filterTermsDefinition" @item-clicked="(e) => emit('item-clicked', e)"
			@update:search="(s: string) => searchTerm = s" @update:filters="(f) => filterTerms = f"
			:item-props="{ editEnabled: !props.readOnly }">
			<template #add-action v-if="!props.readOnly">
				<RouterLink :to="{ name: 'ingredient-edit' }">
					<Button variant="outline" class="aspect-square bg-green-500 cursor-pointer text-white"
						size="icon-lg">
						<Plus />
					</Button>
				</RouterLink>
			</template>
		</ItemBrowser>
	</div>
</template>
