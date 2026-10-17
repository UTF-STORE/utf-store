import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'

import authRoutes from '@/router/public/authRoutes'
import userRoutes from '@/router/admin/userRoutes'
import adsRoutes from '@/router/admin/adsRoutes'
import clientRoutes from '@/router/client/clientRoutes'
import listingRoutes from '@/router/client/listingRoutes'

const PublicView = () => import('@/views/PublicView/index.vue')
const PrivateView = () => import('@/views/PrivateView/index.vue')

const isAuthenticated = (): boolean => {
  const authStore = useAuthStore()
  return !!authStore.token
}

const getUserRole = (): string | undefined => {
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
  return getUserRole() === 'admin' ? '/admin/users' : '/app/listings'
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
      beforeEnter: () => {
        if (isAuthenticated()) return { path: getHomeByRole(), replace: true }
      },
      children: [...authRoutes],
    },

    {
      path: '/admin',
      name: 'admin',
      component: PrivateView,
      redirect: '/admin/users',
      beforeEnter: async () => {
        if (!isAuthenticated()) return { path: '/public/auth/signin', replace: true }
        if (!(await loadAuthenticatedUser())) return { path: '/public/auth/signin', replace: true }
        if (getUserRole() !== 'admin') return { path: '/app/listings', replace: true }
      },
      children: [...userRoutes, ...adsRoutes],
    },

    {
      path: '/app',
      name: 'app',
      component: PrivateView,
      redirect: '/app/listings',
      beforeEnter: async (_to, _from) => {
        if (!isAuthenticated()) return { path: '/public/auth/signin', replace: true }
        if (!(await loadAuthenticatedUser())) return { path: '/public/auth/signin', replace: true }
        if (getUserRole() === 'admin') return { path: '/admin', replace: true }
      },
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
  if (!to.path.startsWith('/app') || !authStore.token) return

  const userStore = useUserStore()
  let user = userStore.user

  if (!user) {
    try {
      user = (await userStore.actMe()).me
    } catch {
      return { path: '/', replace: true }
    }
  }

  const defaultPath = user.role === 'client' ? '/app/home' : '/app/users'
  if (to.path === '/app' || to.path === '/app/') return defaultPath
  if (to.meta.role && to.meta.role !== user.role) return defaultPath
})

export default router
