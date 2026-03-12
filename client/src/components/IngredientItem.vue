<script setup lang="ts">
import type { Ingredient } from '@shared/types/records.types';
import NutrientRow from './NutrientRow.vue';
import { Button } from './ui/button';
import { Pencil } from 'lucide-vue-next';

const props = defineProps<{
	item: Ingredient
	editEnabled?: boolean
}>()



</script>

<template>
	<div class="cursor-pointer rounded-xl border p-4 shadow-sm transition hover:shadow-md font-lato grow">
		<div class="grid grid-rows-12 gap-1">
			<div class="row-span-6 flex flex-row justify-between">
				<div class="text-2xl">{{ props.item.name }}</div>
				<RouterLink :to="{ path: `ingredients/edit/${item.id}` }" as-child v-if="editEnabled!">
					<Button variant="outline" size="icon-sm" as-child class="cursor-pointer p-1.5">
						<Pencil />
					</Button>
				</RouterLink>
			</div>
			<div class="row-span-6">
				<NutrientRow :calories="!item.calories_per_gram ? '?' : item.calories_per_gram.toFixed(2)"
					:protein="!item.protein_per_gram ? '?' : item.protein_per_gram.toFixed(2)"
					:carbohydrates="!item.carbs_per_gram ? '?' : item.carbs_per_gram.toFixed(2)"
					:fat="!item.fat_per_gram ? '?' : item.fat_per_gram.toFixed(2)" :per_gram="true" />
			</div>
		</div>
	</div>
</template>
