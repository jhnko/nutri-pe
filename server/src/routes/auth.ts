import express, { Request, Response } from 'express';
import type {
	EmptyPayload,
	LoginPayload,
	LogoutPayload,
	RegisterPayload,
} from '@shared/types/payloads.types';
import type {
	ApiResponse,
	LoginResponse,
	RegisterResponse,
	RequestResult,
} from '@shared/types/responses.types';
import { AuthService } from '../services/authService';
import { AuthHandler } from '../handlers/authHandler';
import { AuthRequest } from '../types/request';

const router = express.Router();

/* POST login. */
router.post(
	'/login',
	async (
		req: Request<{}, RequestResult<LoginResponse>, LoginPayload>,
		res: Response<RequestResult<LoginResponse>>,
	) => {
		if (
			!req.body.username ||
			!req.body.password ||
			!req.body.username.trim() ||
			!req.body.password.trim()
		) {
			return res.status(400).json({
				success: false,
				response: {
					status: 400,
					message: 'Username or password cannot be empty',
				},
			});
		}

		try {
			const result = await AuthService.login(
				res,
				req.body.username,
				req.body.password,
			);

			if ('error' in result) {
				return res.status(401).json({
					success: false,
					response: {
						status: 401,
						message: result.error,
					},
				});
			}

			res.status(200).json({
				success: true,
				response: {
					status: 200,
					message: 'Login successful',
					username: result.user.username,
					id: result.user.id,
				},
			});
		} catch (error) {
			console.error('Login error:', error);
			res.status(500).json({
				success: false,
				response: {
					status: 500,
					message: 'Login failed',
				},
			});
		}
	},
);

/* POST register. */
router.post(
	'/register',
	async (
		req: Request<{}, RequestResult<RegisterResponse>, RegisterPayload>,
		res: Response<RequestResult<RegisterResponse>>,
	) => {
		if (
			!req.body.username ||
			!req.body.password ||
			!req.body.username.trim() ||
			!req.body.password.trim()
		) {
			return res.status(400).json({
				success: false,
				response: {
					status: 400,
					message: 'Username or password cannot be empty',
				},
			});
		}

		if (req.body.password != req.body.confirm_password) {
			res.status(400).json({
				success: false,
				response: {
					status: 400,
					message: 'Passwords must match',
				},
			});
		}

		try {
			const result = await AuthService.register(
				res,
				req.body.username,
				req.body.password,
			);

			if ('error' in result) {
				return res.status(401).json({
					success: false,
					response: {
						status: 401,
						message: result.error,
					},
				});
			}
			res.status(200).json({
				success: true,
				response: {
					status: 200,
					message: 'Registration successful',
					username: result.user.username,
					id: result.user.id,
				},
			});
		} catch (error) {
			console.error('Registration error:', error);
			res.status(500).json({
				success: false,
				response: {
					status: 500,
					message: 'Registration failed',
				},
			});
		}
	},
);

/* POST logout. */
router.post(
	'/logout',
	async (
		req: Request<{}, RequestResult<ApiResponse>, LogoutPayload>,
		res: Response<RequestResult<ApiResponse>>,
	) => {
		const refreshToken = req.cookies.refreshToken;

		try {
			await AuthService.logout(res, refreshToken);
			res.status(200).json({
				success: true,
				response: {
					status: 200,
					message: 'Logout successful',
				},
			});
		} catch (error) {
			console.error('Logout error:', error);
			res.status(500).json({
				success: false,
				response: {
					status: 500,
					message: 'Logout failed',
				},
			});
		}
	},
);

/* POST refresh */
router.post(
	'/refresh',
	async (
		req: Request<{}, RequestResult<ApiResponse>, EmptyPayload>,
		res: Response<RequestResult<ApiResponse>>,
	) => {
		const refreshToken = req.cookies.refreshToken;

		if (!refreshToken) {
			return res.status(401).json({
				success: false,
				response: {
					status: 401,
					message: 'No refresh token supplied',
				},
			});
		}

		try {
			const result = await AuthService.refreshAccessToken(
				res,
				refreshToken,
			);

			if (!result.success) {
				return res.status(401).json({
					success: false,
					response: {
						status: 401,
						message: result.error || 'Unknown error',
					},
				});
			}

			res.status(200).json({
				success: true,
				response: {
					status: 200,
					message: 'Token refreshed',
				},
			});
		} catch (error) {
			console.error('Refresh error:', error);
			res.status(500).json({
				success: false,
				response: {
					status: 500,
					message: 'Refresh failed',
				},
			});
		}
	},
);

router.get(
	'/me',
	AuthHandler.authenticate,
	async (
		req: AuthRequest<{}, RequestResult<LoginResponse>, EmptyPayload>,
		res: Response<RequestResult<LoginResponse>>,
	) => {
		res.status(200).json({
			success: true,
			response: {
				status: 200,
				message: 'ok',
				id: +req.user_id!,
				username: req.username!,
			},
		});
	},
);

export default router;
