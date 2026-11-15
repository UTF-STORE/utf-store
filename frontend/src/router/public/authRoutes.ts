import type { RouteRecordRaw } from 'vue-router'

const PublicAuthView = () => import('@/views/PublicView/Auth/index.vue')

export default [
  {
    path: 'auth',
    name: 'public.auth',
    component: PublicAuthView,
    children: [
      {
        path: 'signin',
        name: 'public.auth.signin',
        component: () => import('@/views/PublicView/Auth/Signin/index.vue'),
      },

      /**
       * Cadastro público exclusivo para estudantes da UTFPR.
       * Contas administrativas são criadas internamente e não possuem autocadastro.
       */
      {
        path: 'signup',
        name: 'public.auth.signup',
        component: () => import('@/views/PublicView/Auth/Signup/index.vue'),
      },
    ],
  },
] as Array<RouteRecordRaw>
