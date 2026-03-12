import express, { Request, Response } from 'express';
import { AuthHandler } from '../handlers/authHandler';
import { AuthRequest } from '../types/request';
import {
	ApiResponse,
	CreateRecipeResponse,
	GetAllRecipesResponse,
	GetRecipeResponse,
	RequestResult,
	UpdateRecipeResponse,
} from '@shared/types/responses.types';
import {
	AddIngredientsToRecipePayload,
	CreateRecipePayload,
	EmptyPayload,
	RecipeIdParams,
	RecipeIngredientIdsParams,
	UpdateIngredientForRecipePayload,
	UpdateRecipePayload,
} from '@shared/types/payloads.types';
import { ParamsDictionary } from 'express-serve-static-core';
import { RecipeService } from '../services/recipeService';

const router = express.Router();

/* GET recipes - get all recipes */
router.get(
	'/',
	AuthHandler.authenticate,
	async (
		req: AuthRequest<
			{},
			RequestResult<GetAllRecipesResponse>,
			EmptyPayload
		>,
		res: Response<RequestResult<GetAllRecipesResponse>>,
	) => {
		try {
			const recipes = await RecipeService.getRecipes();

			res.status(200).json({
				success: true,
				response: {
					status: 200,
					message: 'Recipes fetched successfully',
					recipes: recipes,
				},
			});
		} catch (err) {
			res.status(500).json({
				success: false,
				response: {
					status: 500,
					message: 'Failed to fetch recipes',
				},
			});
		}
	},
);

/* POST recipes - create a recipe */
router.post(
	'/',
	AuthHandler.authenticate,
	async (
		req: AuthRequest<
			{},
			RequestResult<CreateRecipeResponse>,
			CreateRecipePayload
		>,
		res: Response<RequestResult<CreateRecipeResponse>>,
	) => {
		try {
			const recipe = await RecipeService.addRecipe(
				req.body,
				+req.user_id!,
			);

			res.status(200).json({
				success: true,
				response: {
					status: 200,
					message: 'Recipe created successfully',
					recipe: recipe,
				},
			});
		} catch (err) {
			res.status(500).json({
				success: false,
				response: {
					status: 500,
					message: 'Failed to create recipe',
				},
			});
		}
	},
);

/* GET recipes/:recipe_id - get a specific recipe */
router.get(
	'/:recipe_id',
	AuthHandler.authenticate,
	async (
		req: AuthRequest<
			RecipeIdParams & ParamsDictionary,
			RequestResult<GetRecipeResponse>,
			EmptyPayload
		>,
		res: Response<RequestResult<GetRecipeResponse>>,
	) => {
		try {
			const result = await RecipeService.getRecipe(req.params.recipe_id);

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
					message: 'Recipe fetched successfully',
					recipe: result,
				},
			});
		} catch (err) {
			res.status(500).json({
				success: false,
				response: {
					status: 500,
					message: 'Failed to fetch recipe',
				},
			});
		}
	},
);

/* PATCH recipes/:recipe_id - update a recipe */
router.patch(
	'/:recipe_id',
	AuthHandler.authenticate,
	async (
		req: AuthRequest<
			RecipeIdParams & ParamsDictionary,
			RequestResult<UpdateRecipeResponse>,
			UpdateRecipePayload
		>,
		res: Response<RequestResult<UpdateRecipeResponse>>,
	) => {
		try {
			const result = await RecipeService.updateRecipe(
				req.body,
				req.params.recipe_id,
				+req.user_id!,
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
			return res.status(200).json({
				success: true,
				response: {
					status: 200,
					message: 'Recipe updated successfully',
					recipe: result,
				},
			});
		} catch (err) {
			res.status(500).json({
				success: false,
				response: {
					status: 500,
					message: 'Failed to update recipe',
				},
			});
		}
	},
);

/* DELETE recipes/:recipe_id - delete a recipe */
router.delete(
	'/:recipe_id',
	AuthHandler.authenticate,
	async (
		req: AuthRequest<
			RecipeIdParams & ParamsDictionary,
			RequestResult<ApiResponse>,
			EmptyPayload
		>,
		res: Response<RequestResult<ApiResponse>>,
	) => {
		try {
			const { success, message } = await RecipeService.deleteRecipe(
				req.params.recipe_id,
				+req.user_id!,
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
			return res.status(200).json({
				success: true,
				response: {
					status: 200,
					message: 'Recipe deleted successfully',
				},
			});
		} catch (err) {
			res.status(500).json({
				success: false,
				response: {
					status: 500,
					message: 'Failed to delete recipe',
				},
			});
		}
	},
);

/* POST recipes/:recipe_id/ingredients - add (link) ingredient(s) to a recipe */
router.post(
	'/:recipe_id/ingredients',
	AuthHandler.authenticate,
	async (
		req: AuthRequest<
			RecipeIdParams & ParamsDictionary,
			RequestResult<UpdateRecipeResponse>,
			AddIngredientsToRecipePayload
		>,
		res: Response<RequestResult<UpdateRecipeResponse>>,
	) => {
		try {
			const result = await RecipeService.linkIngredientsToRecipe(
				req.body,
				req.params.recipe_id,
				+req.user_id!,
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
			return res.status(200).json({
				success: true,
				response: {
					status: 200,
					message: 'Ingredients added successfully',
					recipe: result,
				},
			});
		} catch (err) {
			res.status(500).json({
				success: false,
				response: {
					status: 500,
					message: 'Failed to add ingredients',
				},
			});
		}
	},
);

/* PATCH recipes/:recipe_id/ingredients/:ingredient_id - update quantity of ingredient for recipe */
router.patch(
	'/:recipe_id/ingredients/:ingredient_id',
	AuthHandler.authenticate,
	async (
		req: AuthRequest<
			RecipeIngredientIdsParams & ParamsDictionary,
			RequestResult<UpdateRecipeResponse>,
			UpdateIngredientForRecipePayload
		>,
		res: Response<RequestResult<UpdateRecipeResponse>>,
	) => {
		try {
			const result = await RecipeService.updateLinkIngredientToRecipe(
				req.body,
				req.params.recipe_id,
				req.params.ingredient_id,
				+req.user_id!,
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
			return res.status(200).json({
				success: true,
				response: {
					status: 200,
					message: 'Ingredient updated successfully',
					recipe: result,
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

/* DELETE recipes/:recipe_id/ingredients/:ingredient_id - delete (unlink) ingredient from a recipe */
router.delete(
	'/:recipe_id/ingredients/:ingredient_id',
	AuthHandler.authenticate,
	async (
		req: AuthRequest<
			RecipeIngredientIdsParams & ParamsDictionary,
			RequestResult<ApiResponse>,
			EmptyPayload
		>,
		res: Response<RequestResult<ApiResponse>>,
	) => {
		try {
			const { success, message } =
				await RecipeService.deleteLinkIngredientToRecipe(
					req.params.recipe_id,
					req.params.ingredient_id,
					+req.user_id!,
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
			return res.status(200).json({
				success: true,
				response: {
					status: 200,
					message: 'Ingredient deleted from recipe successfully',
				},
			});
		} catch (err) {
			res.status(500).json({
				success: false,
				response: {
					status: 500,
					message: 'Failed to deleted ingredient from recipe',
				},
			});
		}
	},
);

export default router;
