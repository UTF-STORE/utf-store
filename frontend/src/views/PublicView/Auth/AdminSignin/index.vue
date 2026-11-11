<script setup lang="ts">
defineOptions({ name: 'AdminAuthSignin' })

import { z } from 'zod'
import { useRouter } from 'vue-router'

import { useToast } from 'primevue/usetoast'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { Form, FormField, type FormSubmitEvent } from '@primevue/forms'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'

import AuthLayout from '@/components/common/auth/AuthLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'
import type AuthSigninReqInterface from '@/domain/auth/types/req/AuthSigninReqInterface'
import getAuthErrorMessage from '@/helpers/formatters/getAuthErrorMessage'
import { isUtfprStudentEmail } from '@utf-store/shared'

const toast = useToast()
const authStore = useAuthStore()
const userStore = useUserStore()
const router = useRouter()

const resolver = zodResolver(
  z.object({
    email: z
      .string()
      .nonempty({ error: 'E-mail é obrigatório' })
      .refine((val) => isUtfprStudentEmail(val), {
        message: 'E-mail inválido. Use um endereço @utfpr.edu.br.',
      }),
    password: z
      .string()
      .nonempty({ error: 'Senha é obrigatória' })
      .min(6, { error: 'A senha deve ter no mínimo 6 caracteres' }),
  }),
)

async function signin(data: AuthSigninReqInterface) {
  try {
    await authStore.actSignin(data, 'admin')
    const { me } = await userStore.actMe()

    if (me.role !== 'admin') {
      authStore.token = null
      userStore.$reset()
      toast.add({
        severity: 'error',
        summary: 'Acesso não permitido.',
        detail: 'Esta conta não possui permissão para acessar o painel administrativo.',
        life: 4000,
      })
      return
    }

    toast.add({ severity: 'success', summary: 'Login efetuado com sucesso.', life: 3000 })
    router.replace('/admin')
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Não foi possível entrar no painel administrativo.',
      detail: getAuthErrorMessage(err),
      life: 4000,
    })
  }
}

function onFormSubmit({ valid, values }: FormSubmitEvent) {
  if (!valid) return
  signin(values as AuthSigninReqInterface)
}
</script>

<template>
  <AuthLayout
    kicker="Administração"
    title="Acesso administrativo"
    subtitle="Gerencie usuários e anúncios da UTF-Store."
  >
    <template #brand>
      <div class="relative">
        <p class="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">UTF-Store</p>
        <h1 class="mt-6 font-display text-3xl font-bold leading-tight text-white">
          Painel<br />administrativo
        </h1>
        <p class="mt-4 max-w-xs text-sm leading-relaxed text-slate-300">
          Gerencie usuários e anúncios da UTF-Store em um só lugar, com acesso restrito à equipe.
        </p>
      </div>
      <div class="relative flex items-center gap-2 text-xs font-medium text-slate-400">
        <i class="pi pi-lock" />
        Acesso restrito a administradores
      </div>
    </template>

    <Form :resolver @submit="onFormSubmit" class="flex w-full flex-col gap-4">
      <FormField
        v-slot="$field"
        as="section"
        name="email"
        initialValue=""
        class="flex flex-col gap-2"
      >
        <InputText type="email" placeholder="nome@utfpr.edu.br" class="w-full" />
        <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{
          $field.error?.message
        }}</Message>
      </FormField>

      <FormField v-slot="$field" asChild name="password" initialValue="">
        <section class="flex flex-col gap-2">
          <Password
            type="password"
            placeholder="Senha"
            :feedback="false"
            toggleMask
            fluid
            class="w-full"
          />
          <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{
            $field.error?.message
          }}</Message>
        </section>
      </FormField>

      <Button
        type="submit"
        label="Acessar painel"
        class="mt-2 w-full rounded-xl border-none bg-slate-900 py-3 text-white hover:bg-slate-800"
      />

      <div
        class="mt-2 flex min-h-[3.25rem] flex-col items-center justify-center text-center max-[374px]:min-h-[4.5rem]"
      >
        <RouterLink
          :to="{ name: 'public.auth.signin' }"
          class="text-sm font-medium text-slate-500 transition-colors hover:text-slate-700"
        >
          <i class="pi pi-arrow-left mr-2 text-xs" />
          Voltar ao login do estudante
        </RouterLink>
      </div>
    </Form>
  </AuthLayout>
</template>
