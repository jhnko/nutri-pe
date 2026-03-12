import axios, {
	type AxiosInstance,
	type AxiosRequestConfig,
	type AxiosResponse,
	AxiosError,
} from 'axios'
import type { ErrorResponse, RequestResult } from '@shared/types/responses.types'
import { useAuthStore } from '@/stores/auth'

class ApiService {
	private api: AxiosInstance

	constructor(baseURL: string) {
		this.api = axios.create({
			baseURL,
			headers: {
				'Content-Type': 'application/json',
			},
			withCredentials: true, // Enable sending cookies with requests
		})

		// Handle request errors
		this.api.interceptors.request.use(undefined, (error) => {
			return Promise.reject(error)
		})

		// Handle authentication errors
		this.api.interceptors.response.use(
			(response) => response,
			async (error) => {
				if (error.response?.status === 401) {
					const originalRequest = error.config

					// Prevent infinite loops
					if (originalRequest._retry) {
						return Promise.reject(error)
					}

					originalRequest._retry = true

					const authStore = useAuthStore()

					try {
						const refreshed = await authStore.handleUnAuth(error.config.url)
						if (refreshed) {
							return this.api({
								...originalRequest,
								_retry: true,
							})
						}
						// oxlint-disable-next-line no-unused-vars
					} catch (_error) {
						return Promise.reject(error)
					}
				}

				return Promise.reject(error)
			},
		)
	}

	public get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
		return this.api.get<T>(url, config)
	}

	public post<T>(
		url: string,
		data?: unknown,
		config?: AxiosRequestConfig,
	): Promise<AxiosResponse<T>> {
		return this.api.post<T>(url, data, config)
	}

	public put<T>(
		url: string,
		data?: unknown,
		config?: AxiosRequestConfig,
	): Promise<AxiosResponse<T>> {
		return this.api.put<T>(url, data, config)
	}

	public patch<T>(
		url: string,
		data?: unknown,
		config?: AxiosRequestConfig,
	): Promise<AxiosResponse<T>> {
		return this.api.patch<T>(url, data, config)
	}

	public delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
		return this.api.delete<T>(url, config)
	}

	public head<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
		return this.api.head<T>(url, config)
	}

	public options<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
		return this.api.options<T>(url, config)
	}
}

/**
 * Handles Axios errors in a consistent way for API calls.
 * @param err - The error thrown in a try/catch block
 * @returns An object with success: false and a response payload
 */
export function handleApiError(err: unknown): RequestResult<never> {
	if (err instanceof AxiosError && err.response) {
		return {
			success: false,
			response: err.response.data.response as ErrorResponse,
		}
	}
	return {
		success: false,
		response: { message: 'unknown_error' } as ErrorResponse,
	}
}

const apiService = new ApiService('http://localhost:3000/api')

export default apiService
