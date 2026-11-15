import type { RouteRecordRaw } from 'vue-router'

export default [
  {
    path: 'listings',
    name: 'client.listings',
    component: () => import('@/views/PrivateView/Listings/listingView.vue'),
    meta: { role: 'client' },
  },
] as Array<RouteRecordRaw>
