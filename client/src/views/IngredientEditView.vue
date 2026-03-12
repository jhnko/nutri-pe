<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { FormField, FormLabel, FormItem, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toTypedSchema } from '@vee-validate/zod';
import { Save, Trash, X } from 'lucide-vue-next';
import { useForm } from 'vee-validate';
import { computed } from 'vue';
import * as z from 'zod'
import { vAutoAnimate } from '@formkit/auto-animate';
import { toast } from 'vue-sonner';
import { useRoute, useRouter } from 'vue-router';
import { useIngredientStore } from '@/stores/ingredient';


const ingredientStore = useIngredientStore()
const router = useRouter()
const route = useRoute()

const ingredient = computed(() => {
	const id = route.params.id
	if (!id) return undefined
	return ingredientStore.getIngredientById(+id)
})

const editMode = computed(() => !!ingredient.value)


const saveClicked = () => {
	onSubmit();
}

const cancelClicked = () => {
	router.push({ name: "ingredients" })
}

const deleteClicked = async () => {
	if (ingredient.value) {
		const { success, message } = await ingredientStore.removeIngredient(ingredient.value.id)
		if (success) {
			toast.success('Ingredient deleted', {
				description: message
			})
			router.push({ name: "ingredients" })
		} else {
			toast.error("Failed to delete ingredient", {
				description: message
			})
		}
	}
}

const formSchema = toTypedSchema(z.object({
	name: z
		.string({ required_error: "This field is required" })
		.nonempty({ message: "This field is required" })
		.min(1, { message: "Title is too short" })
		.max(255, { message: "Title is too long" }),
	calories_per_gram: z
		.number({ required_error: "This field is required" }),
	protein_per_gram: z
		.number({ required_error: "This field is required" }),
	carbs_per_gram: z
		.number({ required_error: "This field is required" }),
	fat_per_gram: z
		.number({ required_error: "This field is required" })
}))

const form = useForm({
	validationSchema: formSchema,
	initialValues: {
		name: ingredient.value?.name ?? '',
		calories_per_gram: ingredient.value?.calories_per_gram,
		protein_per_gram: ingredient.value?.protein_per_gram,
		carbs_per_gram: ingredient.value?.carbs_per_gram,
		fat_per_gram: ingredient.value?.fat_per_gram,
	}
})

const onSubmit = form.handleSubmit(async (values) => {
	if (editMode.value) {
		// Update ingredient
		if (!ingredient.value) return;
		const { success, message } = await ingredientStore.editIngredient(ingredient.value.id, values)
		if (success) {
			toast.success('Ingredient updated', {
				description: message
			})
			router.push({ name: "ingredients" })
		} else {
			toast.error("Failed to update ingredient", {
				description: message
			})
		}
	} else {
		// Create a new ingredient
		const { success, message } = await ingredientStore.insertIngredient(values)
		if (success) {
			toast.success('Ingredient created', {
				description: message
			})
			router.push({ name: "ingredients" })
		} else {
			toast.error("Failed to create ingredient", {
				description: message
			})
		}
	}
})

</script>

<template>
	<div class="p-5 flex font-lato grow max-h-screen">
		<div class="grow flex flex-col max-h-full">
			<div
				class="bg-light-gold-100 row-span-2 border-b-2 border-light-gold-400 rounded-t-xl p-5 flex flex-row gap-5">
				<div class="flex flex-col gap-1.5">
					<div class="text-xl">{{ editMode ? 'Edit' : 'Add' }} Ingredient</div>
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
						<!--name-->
						<div class="col-span-12 sm:col-span-4 row-span-1">
							<FormField name="name" v-slot="{ componentField }">
								<FormItem v-auto-animate>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input v-bind="componentField" placeholder="Enter a name for the ingredient..."
											class="border-royal-gold-200 bg-light-gold-50" />
									</FormControl>
									<FormDescription />
									<FormMessage />
								</FormItem>
							</FormField>
						</div>
						<!--calories_per_gram-->
						<div class="col-span-12 sm:col-span-4 row-span-1">
							<FormField name="calories_per_gram" v-slot="{ componentField }">
								<FormItem v-auto-animate>
									<FormLabel>Calories per gram</FormLabel>
									<FormControl>
										<Input v-bind="componentField" placeholder="Enter calorie amount per gram..."
											class="border-royal-gold-200 bg-light-gold-50" type="number" />
									</FormControl>
									<FormDescription />
									<FormMessage />
								</FormItem>
							</FormField>
						</div>
						<!--protein_per_gram-->
						<div class="col-span-12 sm:col-span-4 row-span-1">
							<FormField name="protein_per_gram" v-slot="{ componentField }">
								<FormItem v-auto-animate>
									<FormLabel>Protein per gram</FormLabel>
									<FormControl>
										<Input v-bind="componentField" placeholder="Enter protein amount per gram..."
											class="border-royal-gold-200 bg-light-gold-50" type="number" />
									</FormControl>
									<FormDescription />
									<FormMessage />
								</FormItem>
							</FormField>
						</div>
						<!--carbs_per_gram-->
						<div class="col-span-12 sm:col-span-4 row-span-1">
							<FormField name="carbs_per_gram" v-slot="{ componentField }">
								<FormItem v-auto-animate>
									<FormLabel>Carbohydrates per gram</FormLabel>
									<FormControl>
										<Input v-bind="componentField" placeholder="Enter carb amount per gram..."
											class="border-royal-gold-200 bg-light-gold-50" type="number" />
									</FormControl>
									<FormDescription />
									<FormMessage />
								</FormItem>
							</FormField>
						</div>
						<!--fat_per_gram-->
						<div class="col-span-12 sm:col-span-4 row-span-1">
							<FormField name="fat_per_gram" v-slot="{ componentField }">
								<FormItem v-auto-animate>
									<FormLabel>Fat per gram</FormLabel>
									<FormControl>
										<Input v-bind="componentField" placeholder="Enter fat amount per gram..."
											class="border-royal-gold-200 bg-light-gold-50" type="number" />
									</FormControl>
									<FormDescription />
									<FormMessage />
								</FormItem>
							</FormField>
						</div>

					</div>
				</form>
			</div>
		</div>
	</div>
</template>
