import express, { Request, Response } from 'express';
import { AuthHandler } from '../handlers/authHandler';
import { AuthRequest } from '../types/request';
import {
	ApiResponse,
	CreateIngredientResponse,
	GetAllIngredientsResponse,
	GetIngredientResponse,
	RequestResult,
	UpdateIngredientResponse,
} from '@shared/types/responses.types';
import {
	CreateIngredientPayload,
	EmptyPayload,
	IngredientIdParams,
	UpdateIngredientPayload,
} from '@shared/types/payloads.types';
import { ParamsDictionary } from 'express-serve-static-core';
import { IngredientService } from '../services/ingredientService';

const router = express.Router();

/* GET ingredients - list all ingredients */
router.get(
	'/',
	AuthHandler.authenticate,
	async (
		req: AuthRequest<
			{},
			RequestResult<GetAllIngredientsResponse>,
			EmptyPayload
		>,
		res: Response<RequestResult<GetAllIngredientsResponse>>,
	) => {
		try {
			const ingredients = await IngredientService.getIngredients();

			res.status(200).json({
				success: true,
				response: {
					status: 200,
					message: 'Ingredients fetched successfully',
					ingredients: ingredients,
				},
			});
		} catch (err) {
			res.status(500).json({
				success: false,
				response: {
					status: 500,
					message: 'Failed to fetch ingredients',
				},
			});
		}
	},
);

/* POST ingredients - create an ingredient */
router.post(
	'/',
	AuthHandler.authenticate,
	async (
		req: AuthRequest<
			{},
			RequestResult<CreateIngredientResponse>,
			CreateIngredientPayload
		>,
		res: Response<RequestResult<CreateIngredientResponse>>,
	) => {
		try {
			const ingredient = await IngredientService.addIngredient(req.body);

			res.status(200).json({
				success: true,
				response: {
					status: 200,
					message: 'Ingredient created successfully',
					ingredient: ingredient,
				},
			});
		} catch (err) {
			res.status(500).json({
				success: false,
				response: {
					status: 500,
					message: 'Failed to create ingredient',
				},
			});
		}
	},
);

/* GET ingredients/:ingredient_id - get ingredient with id */
router.get(
	'/:ingredient_id',
	AuthHandler.authenticate,
	async (
		req: AuthRequest<
			IngredientIdParams & ParamsDictionary,
			RequestResult<GetIngredientResponse>,
			EmptyPayload
		>,
		res: Response<RequestResult<GetIngredientResponse>>,
	) => {
		try {
			const result = await IngredientService.getIngredient(
				req.params.ingredient_id,
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
					message: 'Fetched ingredient successfully',
					ingredient: result,
				},
			});
		} catch (err) {
			res.status(500).json({
				success: false,
				response: {
					status: 500,
					message: 'Failed to get ingredient',
				},
			});
		}
	},
);

/* PATCH ingredients/:ingredient_id - update ingredient with id */
router.patch(
	'/:ingredient_id',
	AuthHandler.authenticate,
	async (
		req: AuthRequest<
			IngredientIdParams & ParamsDictionary,
			RequestResult<UpdateIngredientResponse>,
			UpdateIngredientPayload
		>,
		res: Response<RequestResult<UpdateIngredientResponse>>,
	) => {
		try {
			const result = await IngredientService.updateIngredient(
				req.body,
				req.params.ingredient_id,
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
					message: 'Updated ingredient successfully',
					ingredient: result,
				},
			});
		} catch (err) {
			res.status(500).json({
				success: false,
				response: {
					status: 500,
					message: 'Failed to update ingredient',
				},
			});
		}
	},
);

/* DELETE ingredients/:ingredient_id - delete ingredient with id */
router.delete(
	'/:ingredient_id',
	AuthHandler.authenticate,
	async (
		req: AuthRequest<
			IngredientIdParams & ParamsDictionary,
			RequestResult<ApiResponse>,
			EmptyPayload
		>,
		res: Response<RequestResult<ApiResponse>>,
	) => {
		try {
			const { success, message } =
				await IngredientService.deleteIngredient(
					req.params.ingredient_id,
				);

			if (!success) {
				return res.status(401).json({
					success: false,
					response: {
						status: 401,
						message: message,
					},
				});
			}

			res.status(200).json({
				success: true,
				response: {
					status: 200,
					message: 'Deleted ingredient successfully',
				},
			});
		} catch (err) {
			res.status(500).json({
				success: false,
				response: {
					status: 500,
					message: 'Failed to delete ingredient',
				},
			});
		}
	},
);

export default router;
