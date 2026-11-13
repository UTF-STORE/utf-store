import type { RouteRecordRaw } from 'vue-router'

export default [
  {
    path: 'listings',
    name: 'client.listings',
    redirect: { name: 'client.home' },
    meta: { role: 'client' },
  },
] as Array<RouteRecordRaw>
