import { authenticate, login, logout, refresh, register } from '@/services/authService'
import type { LoginPayload, RegisterPayload } from '@shared/types/payloads.types'
import type {
	ApiResponse,
	LoginResponse,
	RegisterResponse,
	RequestResult,
} from '@shared/types/responses.types'
import type { User } from '@/types/user'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
	// State
	const user = ref<User | null>(null)

	// Getters
	const isAuthenticated = computed(() => user.value != null)

	// Actions
	async function checkAuth() {
		const result = await authenticate()
		if (result.success) {
			user.value = { id: result.response.id, username: result.response.username }
		} else {
			user.value = null
		}
	}

	async function loginUser(credentials: LoginPayload): Promise<RequestResult<LoginResponse>> {
		const result = await login(credentials)
		if (result.success) {
			user.value = { id: result.response.id, username: result.response.username }
		}
		return result
	}

	async function registerUser(
		payload: RegisterPayload,
	): Promise<RequestResult<RegisterResponse>> {
		const result = await register(payload)
		return result
	}

	async function logoutUser(reason: string): Promise<RequestResult<ApiResponse>> {
		const result = await logout({ reason: reason })
		clearUser()
		return result
	}

	async function handleUnAuth(url: string): Promise<boolean> {
		if (!url.endsWith('refresh')) {
			const { success, response } = await refresh()
			if (success) {
				console.log('Token refreshed: ' + response.message)
				return true
			}
		} else {
			clearUser()
		}
		return false
	}

	function clearUser() {
		user.value = null
	}

	return {
		user,
		isAuthenticated,
		checkAuth,
		loginUser,
		registerUser,
		logoutUser,
		handleUnAuth,
		clearUser,
	}
})
