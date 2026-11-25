import type { RouteRecordRaw } from 'vue-router'

export default [
  {
    path: 'chat',
    name: 'client.chat',
    component: () => import('@/views/PrivateView/Chat/index.vue'),
    meta: { role: 'client' },
  },
  {
    path: 'chat/:listingId/:contactId',
    name: 'client.chat.conversation',
    component: () => import('@/views/PrivateView/Chat/index.vue'),
    meta: { role: 'client' },
  },
] as Array<RouteRecordRaw>
