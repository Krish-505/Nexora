import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import LoginView from '../views/LoginView.vue'

const MainLayout = () => import('../layouts/MainLayout.vue')
const DashboardView = () => import('../views/DashboardView.vue')
const ProductsView = () => import('../views/ProductsView.vue')
const HomeView = () => import('../views/HomeView.vue')
const TenantsView = () => import('../views/TenantsView.vue')

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresGuest: true },
    },
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
        {
          path: 'tenants',
          name: 'tenants',
          component: TenantsView,
          meta: {
            requiresAuth: true,
            requiresRole: 'superadmin',
          },
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

router.beforeEach((to) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.token) {
    return { name: 'login' }
  }

  if (to.meta.requiresGuest && authStore.token) {
    return { name: 'dashboard' }
  }

  if (to.meta.requiresRole && authStore.user?.role !== to.meta.requiresRole) {
    return { name: 'dashboard' }
  }
})

export default router
