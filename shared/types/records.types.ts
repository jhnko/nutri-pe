export interface Recipe {
	id: number;
	username: string;
	title: string;
	description: string;
	instructions: string;
	ingredients: [Ingredient, Amount][];
}

export interface Ingredient {
	id: number;
	name: string;
	calories_per_gram?: number;
	protein_per_gram?: number;
	carbs_per_gram?: number;
	fat_per_gram?: number;
}

export type Amount = number;
