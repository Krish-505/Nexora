import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

// ─── Route components (lazy-loaded) ───────────────────────────────────────
import LoginView from '../views/LoginView.vue'
const MainLayout = () => import('../layouts/MainLayout.vue')
const DashboardView = () => import('../views/DashboardView.vue')
const ProductsView = () => import('../views/ProductsView.vue')
const HomeView = () => import('../views/HomeView.vue')

// ─── Routes ───────────────────────────────────────────────────────────────
const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Public — login page
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresGuest: true },
    },

    // Protected — dashboard layout
    {
      path: '/',
      component: MainLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'home',
          component: HomeView,
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: DashboardView,
        },
        {
          path: 'products',
          name: 'products',
          component: ProductsView,
        },
      ],
    },

    // Catch-all — redirect home
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

// ─── Navigation Guard ──────────────────────────────────────────────────────
router.beforeEach((to) => {
  const authStore = useAuthStore()

  // Route requires authentication but user has no token → go to login
  if (to.meta.requiresAuth && !authStore.token) {
    return { name: 'login' }
  }

  // Route is only for guests (login page) but user is already authenticated
  if (to.meta.requiresGuest && authStore.token) {
    return { name: 'dashboard' }
  }
})

export default router
