<script setup lang="ts">
import { Beef, Droplet, Flame, ShoppingCart, Wheat } from 'lucide-vue-next';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { computed } from 'vue';

const props = defineProps<{
	calories?: string | number,
	protein?: string | number,
	carbohydrates?: string | number,
	fat?: string | number,
	count?: string | number,
	per_gram?: boolean
}>()

const format = (value?: string | number) => {
	if (value === undefined || value === '?') return value
	if (props.per_gram) {
		return parseFloat(value as string).toFixed(2)
	} else {
		return parseFloat(value as string).toFixed(0)
	}
}

const formatted = computed(() => ({
	calories: format(props.calories),
	protein: format(props.protein),
	carbohydrates: format(props.carbohydrates),
	fat: format(props.fat),
}))


</script>

<template>
	<div class="flex justify-between gap-1">
		<TooltipProvider v-if="!!formatted.calories">
			<Tooltip>
				<TooltipTrigger>
					<div class="flex flex-row gap-1">
						<Flame />
						<div class="font-thin text-xs my-auto">
							{{ formatted.calories }} kcal{{ per_gram ? '/g' : '' }}
						</div>
					</div>
				</TooltipTrigger>
				<TooltipContent>
					<div class="text-sm">Calories</div>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
		<TooltipProvider v-if="!!formatted.protein">
			<Tooltip>
				<TooltipTrigger>
					<div class="flex flex-row gap-1">
						<Beef />
						<div class="font-thin text-xs my-auto">
							{{ formatted.protein }} g{{ per_gram ? '/g' : '' }}
						</div>
					</div>
				</TooltipTrigger>
				<TooltipContent>
					<div class="text-sm">Protein</div>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
		<TooltipProvider v-if="!!formatted.carbohydrates">
			<Tooltip>
				<TooltipTrigger>
					<div class="flex flex-row gap-1">
						<Wheat />
						<div class="font-thin text-xs my-auto">
							{{ formatted.carbohydrates }} g{{ per_gram ? '/g' : '' }}
						</div>
					</div>
				</TooltipTrigger>
				<TooltipContent>
					<div class="text-sm">Carbohydrates</div>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
		<TooltipProvider v-if="!!formatted.fat">
			<Tooltip>
				<TooltipTrigger>
					<div class="flex flex-row gap-1">
						<Droplet />
						<div class="font-thin text-xs my-auto">
							{{ formatted.fat }} g{{ per_gram ? '/g' : '' }}
						</div>
					</div>
				</TooltipTrigger>
				<TooltipContent>
					<div class="text-sm">Fat</div>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
		<TooltipProvider v-if="!!props.count">
			<Tooltip>
				<TooltipTrigger>
					<div class="flex flex-row gap-1">
						<ShoppingCart />
						<div class="font-thin text-xs my-auto">
							{{ props.count }}
						</div>
					</div>
				</TooltipTrigger>
				<TooltipContent>
					<div class="text-sm">Ingredients</div>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	</div>
</template>
