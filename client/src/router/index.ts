import PrivateLayout from '@/layouts/PrivateLayout.vue'
import { useAuthStore } from '@/stores/auth'
import IngredientEditView from '@/views/IngredientEditView.vue'
import IngredientsView from '@/views/IngredientsView.vue'
import LandingView from '@/views/LandingView.vue'
import LoginView from '@/views/LoginView.vue'
import RecipeEditView from '@/views/RecipeEditView.vue'
import RecipesView from '@/views/RecipesView.vue'
import RegisterView from '@/views/RegisterView.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/',
			name: 'landing',
			component: LandingView,
			meta: { requiresAuth: false, redirectIfAuthenticated: true },
		},
		{
			path: '/app',
			name: 'app',
			component: PrivateLayout,
			children: [
				{
					path: 'recipes',
					name: 'recipes',
					component: RecipesView,
					meta: { requiresAuth: true, redirectIfAuthenticated: false },
				},
				{
					path: 'ingredients',
					name: 'ingredients',
					component: IngredientsView,
					meta: { requiresAuth: true, redirectIfAuthenticated: false },
				},
				{
					path: 'recipes/edit',
					name: 'recipe-edit',
					component: RecipeEditView,
					meta: { requiresAuth: true, redirectIfAuthenticated: false },
				},
				{
					path: 'recipes/edit/:id',
					name: 'recipe-edit-id',
					component: RecipeEditView,
					meta: { requiresAuth: true, redirectIfAuthenticated: false },
				},
				{
					path: 'ingredients/edit',
					name: 'ingredient-edit',
					component: IngredientEditView,
					meta: { requiresAuth: true, redirectIfAuthenticated: false },
				},
				{
					path: 'ingredients/edit/:id',
					name: 'ingredient-edit-id',
					component: IngredientEditView,
					meta: { requiresAuth: true, redirectIfAuthenticated: false },
				},
			],
		},
		{
			path: '/login',
			name: 'login',
			component: LoginView,
			meta: { requiresAuth: false, redirectIfAuthenticated: true },
		},
		{
			path: '/register',
			name: 'register',
			component: RegisterView,
			meta: { requiresAuth: false, redirectIfAuthenticated: true },
		},
	],
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
	const authStore = useAuthStore()
	await authStore.checkAuth()
	// Check for illegal route configuration
	if (to.meta.requiresAuth && to.meta.redirectIfAuthenticated) {
		console.error('Route config error: Route cannot require auth and redirect if authenticated')
		next('/login')
		return
	}

	// Redirect unauthenticated users from private routes
	if (to.meta.requiresAuth && !authStore.isAuthenticated) {
		next('/login')
		return
	}

	// Redirect authenticated users from public routes with redirectIfAuthenticated
	if (to.meta.redirectIfAuthenticated && authStore.isAuthenticated) {
		next('/app/recipes')
		return
	}

	// Check that we actually enter a valid site and not a "page parent"
	if (to.name === 'app') {
		next('/app/recipes')
		return
	}

	next()
})

export default router
