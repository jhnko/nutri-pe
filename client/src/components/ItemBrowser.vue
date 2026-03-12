<script setup lang="ts" generic="T extends { id: string | number }">
import { ref, reactive } from 'vue'
import type { Component } from 'vue'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { ArrowDownWideNarrow, Search } from 'lucide-vue-next'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem } from './ui/dropdown-menu'
import { Button } from './ui/button'

export interface FilterTerm {
	key: string
	label: string
	default: boolean
}

export type ActiveFilters = Record<FilterTerm["key"], boolean>

const props = withDefaults(
	defineProps<{
		items: T[]
		itemComponent: Component
		searchEnabled?: boolean
		filterEnabled?: boolean
		filterTerms?: FilterTerm[]
		itemProps?: Record<string, unknown>
	}>(),
	{
		searchEnabled: false,
		filterEnabled: false,
		filterTerms: () => [],
	}
)

const emit = defineEmits<{
	(e: 'update:search', value: string): void
	(e: 'update:filters', filters: ActiveFilters): void
	(e: 'add'): void
	(e: 'item-clicked', value: T): void
}>()

const searchValue = ref('')
const activeFilters = reactive<ActiveFilters>(
	Object.fromEntries(props.filterTerms.map(f => [f.key, f.default]))
)
const listRef = ref<HTMLElement | null>(null)

function onSearchInput() {
	emit('update:search', searchValue.value)
}

function onFilterChange(key: string) {
	activeFilters[key] = !activeFilters[key]
	emit('update:filters', { ...activeFilters })
}

</script>

<template>
	<div class="grow flex flex-col min-h-0 h-full">
		<div class="bg-light-gold-100 row-span-2 border-b-2 border-light-gold-400 rounded-t-xl p-5 flex flex-row gap-5">
			<div class="flex flex-col gap-1.5">
				<Label for="search" class="">
					<Search :size="20" />
					<span>Search</span>
				</Label>
				<Input v-model="searchValue" class="bg-white" id="search" type="text" placeholder=""
					@input="onSearchInput" :disabled="!searchEnabled" />
			</div>

			<div class="self-end">
				<DropdownMenu>
					<DropdownMenuTrigger as-child>
						<Button variant="outline" :disabled="!filterEnabled">
							<ArrowDownWideNarrow :size="16" :stroke-width="1" absoluteStrokeWidth />
							Filter
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuLabel>Filters</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuCheckboxItem v-for="filter in filterTerms" :key="filter.key"
								:model-value="activeFilters[filter.key]" @select.prevent="onFilterChange(filter.key)"
								class="cursor-pointer">
								{{ filter.label }}
							</DropdownMenuCheckboxItem>
						</DropdownMenuGroup>
					</DropdownMenuContent>
				</DropdownMenu>

			</div>
			<div class="ml-auto">
				<slot name="add-action" />
			</div>
		</div>

		<div class="min-h-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 py-2 overflow-y-scroll"
			ref="listRef">
			<component v-for="item in items" :key="item.id" :is="itemComponent" :item="item" v-bind="itemProps"
				@click="emit('item-clicked', item)" />
		</div>
	</div>
</template>
