import { createRouter, createWebHistory } from 'vue-router'
import type { UserRoleType } from '@/domain/user/types/UserRoleType'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'

import authRoutes from '@/router/public/authRoutes'
import userRoutes from '@/router/admin/userRoutes'
import adsRoutes from '@/router/admin/adsRoutes'
import clientRoutes from '@/router/client/clientRoutes'
import listingRoutes from '@/router/client/listingRoutes'

const PublicView = () => import('@/views/PublicView/index.vue')
const PrivateView = () => import('@/views/PrivateView/index.vue')
const AdminSigninView = () => import('@/views/PublicView/Auth/AdminSignin/index.vue')

const ADMIN_LOGIN_ROUTE_NAME = 'admin.auth.signin'

const isAuthenticated = (): boolean => {
  const authStore = useAuthStore()
  return !!authStore.token
}

const getUserRole = (): UserRoleType | undefined => {
  const userStore = useUserStore()
  return userStore.user?.role
}

const loadAuthenticatedUser = async (): Promise<boolean> => {
  const userStore = useUserStore()
  if (userStore.user) return true

  try {
    await userStore.actMe()
    return !!userStore.user
  } catch {
    return false
  }
}

const getHomeByRole = (): string => {
  return getUserRole() === 'admin' ? '/admin/users' : '/app/home'
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: () => (isAuthenticated() ? getHomeByRole() : '/public/auth/signin'),
    },

    {
      path: '/public',
      name: 'public',
      component: PublicView,
      children: [...authRoutes],
    },

    {
      path: '/admin/login',
      component: PublicView,
      children: [
        {
          path: '',
          name: ADMIN_LOGIN_ROUTE_NAME,
          component: AdminSigninView,
        },
      ],
    },

    {
      path: '/admin',
      name: 'admin',
      component: PrivateView,
      redirect: '/admin/users',
      meta: { role: 'admin' },
      children: [...userRoutes, ...adsRoutes],
    },

    {
      path: '/app',
      name: 'app',
      component: PrivateView,
      redirect: '/app/home',
      meta: { role: 'client' },
      children: [...listingRoutes, ...clientRoutes],
    },

    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  const isPublicRoute = to.path.startsWith('/public') || to.name === ADMIN_LOGIN_ROUTE_NAME
  const requiresAuthentication = to.matched.some((route) => route.meta.role)

  if (!authStore.token) {
    if (requiresAuthentication) return { path: '/public/auth/signin', replace: true }
    return
  }

  if (!(await loadAuthenticatedUser())) {
    return { path: '/public/auth/signin', replace: true }
  }

  const role = getUserRole()
  if (!role) return { path: '/public/auth/signin', replace: true }

  if (isPublicRoute) return { path: getHomeByRole(), replace: true }

  const requiredRole = to.matched
    .map((route) => route.meta.role as UserRoleType | undefined)
    .find(Boolean)

  if (requiredRole && requiredRole !== role) {
    return { path: getHomeByRole(), replace: true }
  }
})

export default router
