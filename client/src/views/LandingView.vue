<script setup lang="ts">
import PublicHeader from '@/components/PublicHeader.vue';



</script>

<template>
	<div class="flex flex-col gap-4 bg-light-gold-100 min-h-screen">
		<PublicHeader />
		<div class="flex justify-center flex-col grow gap-2">
			<div class="flex flex-row justify-center">
				<div
					class="bg-royal-gold-400 w-25 text-center py-2 rounded-md text-light-gold-900 font-lato text-1xl select-none">
					<RouterLink to="/login">
						Login
					</RouterLink>
				</div>
			</div>
			<div class="flex flex-row justify-center">
				<div
					class="bg-golden-orange-400 w-25 text-center py-2 rounded-md text-light-gold-900 font-lato text-1xl select-none">
					<RouterLink to="/register">
						Register
					</RouterLink>
				</div>
			</div>
		</div>

	</div>
</template>
