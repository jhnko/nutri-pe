import jwt from 'jsonwebtoken';
import { Response } from 'express';
import bcrypt from 'bcrypt';
import db from '../db/index';
import { User } from '../types/records';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'null';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'null';

if (ACCESS_TOKEN_SECRET == 'null' || REFRESH_TOKEN_SECRET == 'null') {
	throw new Error(
		'Missing required environment variables: ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET must be set',
	);
}

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';
const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const SALT_ROUNDS = 10;

interface TokenPayload {
	userId: string;
	username?: string;
}

interface DecodedToken {
	userId: string;
	username?: string;
	iat?: number;
	exp?: number;
}

export class AuthService {
	static generateAccessToken(payload: TokenPayload): string {
		return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
			expiresIn: ACCESS_TOKEN_EXPIRY,
		});
	}

	static generateRefreshToken(userId: string): string {
		return jwt.sign({ userId }, REFRESH_TOKEN_SECRET, {
			expiresIn: REFRESH_TOKEN_EXPIRY,
		});
	}

	static verifyAccessToken(token: string): DecodedToken {
		return jwt.verify(token, ACCESS_TOKEN_SECRET) as DecodedToken;
	}

	static verifyRefreshToken(token: string): DecodedToken {
		return jwt.verify(token, REFRESH_TOKEN_SECRET) as DecodedToken;
	}

	static setAuthCookies(
		res: Response,
		accessToken: string,
		refreshToken: string,
	): void {
		const isProduction = process.env.NODE_ENV === 'production';

		res.cookie('accessToken', accessToken, {
			httpOnly: true,
			secure: isProduction, // HTTPS only in production
			sameSite: 'strict',
			maxAge: 15 * 60 * 1000, // 15 minutes
		});

		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			secure: isProduction,
			sameSite: 'strict',
			maxAge: REFRESH_TOKEN_EXPIRY_MS,
		});
	}

	static clearAuthCookies(res: Response): void {
		res.clearCookie('accessToken');
		res.clearCookie('refreshToken');
	}

	static async hashPassword(password: string): Promise<string> {
		return bcrypt.hash(password, SALT_ROUNDS);
	}

	static async comparePassword(
		password: string,
		hash: string,
	): Promise<boolean> {
		return bcrypt.compare(password, hash);
	}

	static async storeRefreshToken(
		userId: number,
		token: string,
	): Promise<void> {
		const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);

		await db.query(
			'INSERT INTO tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
			[userId, token, expiresAt],
		);
	}

	static async verifyRefreshTokenInDB(token: string): Promise<boolean> {
		const result = await db.query(
			'SELECT * FROM tokens WHERE token = $1 AND revoked = FALSE AND expires_at > NOW()',
			[token],
		);

		return result.rows.length > 0;
	}

	static async revokeRefreshToken(token: string): Promise<void> {
		await db.query('UPDATE tokens SET revoked = TRUE WHERE token = $1', [
			token,
		]);
	}

	static async revokeAllUserTokens(userId: number): Promise<void> {
		await db.query('UPDATE tokens SET revoked = TRUE WHERE user_id = $1', [
			userId,
		]);
	}

	static async findUserByUsername(username: string): Promise<User | null> {
		const result = await db.query(
			'SELECT * FROM users WHERE username = $1',
			[username],
		);

		return result.rows[0] || null;
	}

	static async createUser(username: string, password: string): Promise<User> {
		const passwordHash = await this.hashPassword(password);

		const result = await db.query(
			'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING *',
			[username, passwordHash],
		);

		return result.rows[0];
	}

	static getRefreshTokenExpiry(): Date {
		return new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);
	}

	static async login(
		res: Response,
		username: string,
		password: string,
	): Promise<{ user: User } | { error: string }> {
		const user = await this.findUserByUsername(username);
		if (!user) {
			return { error: 'Invalid credentials' };
		}

		const isValidPassword = await this.comparePassword(
			password,
			user.password_hash,
		);

		if (!isValidPassword) {
			return { error: 'Invalid credentials' };
		}

		const accessToken = this.generateAccessToken({
			userId: user.id.toString(),
			username: user.username,
		});
		const refreshToken = this.generateRefreshToken(user.id.toString());

		await this.storeRefreshToken(user.id, refreshToken);

		this.setAuthCookies(res, accessToken, refreshToken);

		return { user };
	}

	static async register(
		res: Response,
		username: string,
		password: string,
	): Promise<{ user: User } | { error: string }> {
		const existingUsername = await this.findUserByUsername(username);

		if (existingUsername) {
			return { error: 'Username already taken' };
		}

		const user = await this.createUser(username, password);

		const accessToken = this.generateAccessToken({
			userId: user.id.toString(),
			username: user.username,
		});
		const refreshToken = this.generateRefreshToken(user.id.toString());

		await this.storeRefreshToken(user.id, refreshToken);

		this.setAuthCookies(res, accessToken, refreshToken);

		return { user };
	}

	static async logout(res: Response, refreshToken?: string): Promise<void> {
		if (refreshToken) {
			await this.revokeRefreshToken(refreshToken);
		}

		this.clearAuthCookies(res);
	}

	static async refreshAccessToken(
		res: Response,
		refreshToken: string,
	): Promise<{ success: boolean; error?: string }> {
		try {
			const decoded = this.verifyRefreshToken(refreshToken);
			const isValidInDB = await this.verifyRefreshTokenInDB(refreshToken);

			if (!isValidInDB) {
				return {
					success: false,
					error: 'Invalid or expired refresh token',
				};
			}

			const result = await db.query('SELECT * FROM users WHERE id = $1', [
				decoded.userId,
			]);
			const user = result.rows[0];

			if (!user) {
				return { success: false, error: 'User not found' };
			}

			const accessToken = this.generateAccessToken({
				userId: user.id.toString(),
				username: user.username,
			});

			const isProduction = process.env.NODE_ENV === 'production';
			res.cookie('accessToken', accessToken, {
				httpOnly: true,
				secure: isProduction,
				sameSite: 'strict',
				maxAge: 15 * 60 * 1000,
			});

			return { success: true };
		} catch (error) {
			return { success: false, error: 'Invalid refresh token' };
		}
	}
}
