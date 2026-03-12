import apiService, { handleApiError } from './api'

import type { LoginPayload, RegisterPayload, LogoutPayload } from '@shared/types/payloads.types'
import type {
	ApiResponse,
	LoginResponse,
	RegisterResponse,
	RequestResult,
} from '@shared/types/responses.types'

export const authenticate = async (): Promise<RequestResult<LoginResponse>> => {
	try {
		const { data } = await apiService.get<RequestResult<LoginResponse>>('/auth/me', {})
		return data
	} catch (err) {
		return handleApiError(err)
	}
}

export const login = async (payload: LoginPayload): Promise<RequestResult<LoginResponse>> => {
	try {
		const { data } = await apiService.post<RequestResult<LoginResponse>>('/auth/login', payload)
		return data
	} catch (err) {
		return handleApiError(err)
	}
}

export const logout = async (
	payload: LogoutPayload = { reason: 'none' },
): Promise<RequestResult<ApiResponse>> => {
	try {
		const { data } = await apiService.post<RequestResult<ApiResponse>>('/auth/logout', payload)
		return data
	} catch (err) {
		return handleApiError(err)
	}
}

export const register = async (
	payload: RegisterPayload,
): Promise<RequestResult<RegisterResponse>> => {
	try {
		const { data } = await apiService.post<RequestResult<RegisterResponse>>(
			'/auth/register',
			payload,
		)
		return data
	} catch (err) {
		return handleApiError(err)
	}
}

export const refresh = async (): Promise<RequestResult<ApiResponse>> => {
	try {
		const { data } = await apiService.post<RequestResult<ApiResponse>>('/auth/refresh')
		return data
	} catch (err) {
		return handleApiError(err)
	}
}
