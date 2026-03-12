<script setup lang="ts">
import type { Recipe } from '@shared/types/records.types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { computed, ref } from 'vue';
import IngredientItem from './IngredientItem.vue';
import NutrientRow from './NutrientRow.vue';
import { Button } from './ui/button';
import { Pencil } from 'lucide-vue-next';

const props = defineProps<{
	item: Recipe
}>()

const open = ref(false)

const ingredientCount = computed(() => { return props.item.ingredients.length })
const totals = computed(() => {
	return props.item.ingredients.reduce(
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

</script>

<template>
	<div class="p-0 m-0">
		<Dialog v-model:open="open">
			<DialogTrigger as-child>
				<div class="cursor-pointer rounded-xl border p-4 shadow-sm transition hover:shadow-md font-lato">
					<div class="grid grid-rows-12 gap-3">
						<div class="row-span-8 flex flex-col">
							<div class="text-2xl">{{ item.title }}</div>
							<div class="line-clamp-2">{{ item.description }}</div>
						</div>
						<div class="row-span-4 m-0 p-0">
							<NutrientRow :calories="totals.calories == 0 ? '?' : totals.calories"
								:protein="Math.round(totals.protein) == 0 ? '?' : Math.round(totals.protein)"
								:carbohydrates="Math.round(totals.carbs) == 0 ? '?' : Math.round(totals.carbs)"
								:fat="Math.round(totals.fat) == 0 ? '?' : Math.round(totals.fat)"
								:count="ingredientCount" />
						</div>
					</div>
				</div>
			</DialogTrigger>
			<DialogContent class="font-lato min-w-175">
				<div class="flex flex-col gap-2">
					<div class="grid grid-rows-12 gap-3">
						<DialogHeader class="row-span-8">
							<DialogTitle>{{ item.title }}</DialogTitle>
							<DialogDescription class="flex flex-row justify-between">
								<div class="flex flex-col">
									<div class="line-clamp-3">{{ item.description }}</div>
									<div class="line-clamp-6">{{ item.instructions }}</div>
								</div>
								<RouterLink :to="{ path: `recipes/edit/${item.id}` }" as-child>
									<Button variant="outline" size="icon" as-child class="cursor-pointer p-1.5">
										<Pencil />
									</Button>
								</RouterLink>
							</DialogDescription>
						</DialogHeader>
						<div class="row-span-4 m-0 p-0">
							<NutrientRow :calories="totals.calories == 0 ? '?' : totals.calories"
								:protein="Math.round(totals.protein) == 0 ? '?' : Math.round(totals.protein)"
								:carbohydrates="Math.round(totals.carbs) == 0 ? '?' : Math.round(totals.carbs)"
								:fat="Math.round(totals.fat) == 0 ? '?' : Math.round(totals.fat)"
								:count="ingredientCount" />
						</div>
					</div>
					<div class="border-t border-light-gold-400 h-100 flex flex-col gap-2 overflow-y-scroll pt-5">
						<div v-for="[ingredient, amount] in item.ingredients" :key="ingredient.id"
							class="grid grid-cols-12 min-h-30 gap-1">
							<div class="col-span-10 flex">
								<IngredientItem :item="ingredient" />
							</div>
							<div class="col-span-2 self-center text-center">{{ amount }} g</div>
						</div>
					</div>
				</div>
			</DialogContent>

		</Dialog>
	</div>
</template>
