import type { RouteRecordRaw } from 'vue-router'

export default [
  {
    path: 'ads',
    name: 'private.ads',
    component: () => import('@/views/PrivateView/AdsListView.vue'),
  },
  {
    path: 'ads/create',
    name: 'private.ads.create',
    component: () => import('@/views/PrivateView/CreateAdView.vue'),
  },
] as Array<RouteRecordRaw>
