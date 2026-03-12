<script setup lang="ts">
import PublicHeader from '@/components/PublicHeader.vue';
import { Button } from '@/components/ui/button';
import { FormItem, FormField, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form/';
import Input from '@/components/ui/input/Input.vue';
import { useAuthStore } from '@/stores/auth';
import type { LoginPayload } from '@shared/types/payloads.types';
import { vAutoAnimate } from '@formkit/auto-animate';
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { toast } from 'vue-sonner';
import * as z from 'zod'
import { useRouter } from 'vue-router';


const formSchema = toTypedSchema(z.object({
	username: z
		.string({ required_error: "This field is required" })
		.nonempty({ message: "This field is required" })
		.min(5, { message: "Username is too short" })
		.max(255, { message: "Username is too long" }),
	password: z
		.string({ required_error: "This field is required" })
		.nonempty({ message: "This field is required" })
		.min(5, { message: "Password is too short" })
		.max(100, { message: "Password is too long" }),
}))

const form = useForm({
	validationSchema: formSchema,
})

const authStore = useAuthStore()
const router = useRouter()

const onSubmit = form.handleSubmit(async (values) => {
	const payload: LoginPayload = {
		username: values.username,
		password: values.password,
	}

	const { success, response } = await authStore.loginUser(payload);

	if (success) {
		toast.success("Logged in successfully", {
			description: response.message
		})
		router.push({ name: "app" })
	} else {
		toast.error("Failed to login", {
			description: response.message
		})
	}
})

</script>

<template>
	<div class="flex flex-col gap-4 bg-light-gold-100 min-h-screen">
		<PublicHeader />
		<div class="flex flex-col m-auto grow justify-center ">
			<div class="w-150 h-150 px-15 py-10 rounded-xl text-light-gold-900 flex flex-col justify-center">
				<form @submit="onSubmit" class="flex flex-col gap-2">
					<FormField name="username" v-slot="{ componentField }">
						<FormItem v-auto-animate>
							<FormLabel>Username</FormLabel>
							<FormControl>
								<Input v-bind="componentField" class="border-royal-gold-400 bg-light-gold-50" />
							</FormControl>
							<FormDescription />
							<FormMessage />
						</FormItem>
					</FormField>
					<FormField name="password" v-slot="{ componentField }">
						<FormItem v-auto-animate>
							<FormLabel>Password</FormLabel>
							<FormControl>
								<Input type="password" v-bind="componentField"
									class="border-royal-gold-400 bg-light-gold-50" />
							</FormControl>
							<FormDescription />
							<FormMessage />
						</FormItem>
					</FormField>
					<Button type="submit" variant="outline"
						class="w-full mt-10 bg-royal-gold-400 border-0 hover:cursor-pointer">
						Login
					</Button>
				</form>
			</div>
		</div>
	</div>
</template>
