import type { RouteRecordRaw } from 'vue-router'
import PrivateAds from '@/views/PrivateView/Ads/index.vue'

export default [
  {
    path: 'ads',
    name: 'admin.ads',
    component: PrivateAds,
    meta: { role: 'admin' },
  },
  {
    path: 'ads/create',
    name: 'admin.ads.create',
    component: () => import('@/views/PrivateView/CreateAdView.vue'),
  },
] as Array<RouteRecordRaw>
