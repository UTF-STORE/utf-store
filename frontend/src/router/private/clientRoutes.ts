import type { RouteRecordRaw } from 'vue-router'
import ClientPlaceholder from '@/views/PrivateView/ClientPlaceholder/index.vue'
import ClientProfile from '@/views/PrivateView/Profile/index.vue'

export default [
  {
    path: 'home',
    name: 'client.home',
    component: ClientPlaceholder,
    meta: { role: 'client' },
  },
  {
    path: 'favorites',
    name: 'client.favorites',
    component: ClientPlaceholder,
    meta: { role: 'client' },
  },
  {
    path: 'profile',
    name: 'client.profile',
    component: ClientProfile,
    meta: { role: 'client' },
  },
] as Array<RouteRecordRaw>