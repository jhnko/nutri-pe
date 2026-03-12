import { NextFunction, Response } from 'express';
import { AuthRequest } from '../types/request';
import { AuthService } from '../services/authService';
import { RequestResult } from '@shared/types/responses.types';

// Middleware for authenticating a request, (via cookies)
export class AuthHandler {
	static authenticate(
		req: AuthRequest,
		res: Response<RequestResult<any>>,
		next: NextFunction,
	) {
		const accessToken = req.cookies.accessToken;

		if (!accessToken) {
			res.status(401).json({
				success: false,
				response: {
					status: 401,
					message: 'Not authenticated',
				},
			});
			return;
		}

		try {
			const decoded = AuthService.verifyAccessToken(accessToken);
			req.user_id = decoded.userId;
			req.username = decoded.username;
			next();
		} catch (error) {
			res.status(401).json({
				success: false,
				response: {
					status: 401,
					message: 'Invalid or expired token',
				},
			});
			return;
		}
	}
}
