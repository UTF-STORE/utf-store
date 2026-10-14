import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'

import authRoutes from '@/router/public/authRoutes'
import userRoutes from '@/router/private/userRoutes'
import adsRoutes from '@/router/private/adsRoutes'
import clientRoutes from '@/router/private/clientRoutes'

const PublicView = () => import('@/views/PublicView/index.vue')
const PrivateView = () => import('@/views/PrivateView/index.vue')

const isAuthenticated = (): boolean => {
  const authStore = useAuthStore()
  return !!authStore.token
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/public/auth/signin',
      beforeEnter: (_to, _from) => {
        if (isAuthenticated()) return { path: '/app', replace: true }
      },
    },

    {
      path: '/public',
      name: 'public',
      component: PublicView,
      beforeEnter: (_to, _from) => {
        if (isAuthenticated()) return { path: '/app', replace: true }
      },
      children: [...authRoutes],
    },

    {
      path: '/app',
      name: 'app',
      component: PrivateView,
      beforeEnter: (_to, _from) => {
        if (!isAuthenticated()) return { path: '/', replace: true }
      },
      children: [...userRoutes, ...adsRoutes, ...clientRoutes],
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
