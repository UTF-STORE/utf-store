<script setup lang="ts">
defineOptions({ name: 'PublicAuthSignup' })

import { z } from 'zod'
import { useRouter } from 'vue-router'

import { useToast } from 'primevue/usetoast'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { Form, FormField, type FormSubmitEvent } from '@primevue/forms'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'

import AuthLayout from '@/components/common/auth/AuthLayout.vue'
import { useAuthStore } from '@/stores/auth'
import type AuthSignupReqInterface from '@/domain/auth/types/req/AuthSignupReqInterface'
import getAuthErrorMessage from '@/helpers/formatters/getAuthErrorMessage'
import { isUtfprStudentEmail } from '@utf-store/shared'

const toast = useToast()
const authStore = useAuthStore()
const router = useRouter()

const resolver = zodResolver(
  z.object({
    name: z.string().trim().nonempty({ error: 'Nome é obrigatório' }),
    email: z
      .string()
      .nonempty({ error: 'E-mail é obrigatório' })
      .refine((val) => isUtfprStudentEmail(val), {
        message: 'E-mail inválido. Use um endereço @alunos.utfpr.edu.br.',
      }),
    password: z
      .string()
      .nonempty({ error: 'Senha é obrigatória' })
      .min(6, { error: 'A senha deve ter no mínimo 6 caracteres' }),
    course: z.string().trim().nonempty({ error: 'Curso é obrigatório' }),
    campus: z.string().trim().nonempty({ error: 'Campus é obrigatório' }),
    avatarUrl: z.union([z.literal(''), z.url({ error: 'A URL do avatar deve ser válida' })]),
    bio: z
      .string()
      .trim()
      .min(25, { error: 'Biografia deve ter no mínimo 25 caracteres' })
      .max(200, { error: 'Biografia deve ter no máximo 200 caracteres' }),
  }),
)

async function signup(data: AuthSignupReqInterface) {
  try {
    await authStore.actSignup(data)
    toast.add({
      severity: 'success',
      summary: 'Cadastro realizado com sucesso.',
      detail: 'Sua conta de estudante está pronta para uso.',
      life: 4000,
    })

    router.replace('/app')
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Não foi possível criar sua conta.',
      detail: getAuthErrorMessage(err),
      life: 4000,
    })
  }
}

function onFormSubmit({ valid, values }: FormSubmitEvent) {
  if (!valid) return
  signup(values as AuthSignupReqInterface)
}
</script>

<template>
  <AuthLayout
    wide
    kicker="Cadastro de estudante"
    title="Criar conta de estudante"
    subtitle="Preencha seus dados com o e-mail @alunos.utfpr.edu.br."
  >
    <template #brand>
      <div class="relative">
        <p class="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">UTF-Store</p>
        <h1 class="mt-6 font-display text-3xl font-bold leading-tight text-white">
          Crie sua conta e<br />comece a negociar
        </h1>
        <p class="mt-4 max-w-xs text-sm leading-relaxed text-slate-300">
          Publique anúncios, encontre itens e negocie com outros estudantes da UTFPR.
        </p>
      </div>
      <div class="relative flex items-center gap-2 text-xs font-medium text-slate-400">
        <i class="pi pi-graduation-cap" />
        Cadastro exclusivo para alunos da UTFPR
      </div>
    </template>

    <Form
      :resolver
      class="flex w-full flex-col gap-[1rem] sm:flex-row sm:flex-wrap"
      @submit="onFormSubmit"
    >
      <FormField v-slot="$field" asChild name="name" initialValue="">
        <section class="flex min-w-0 flex-col gap-2 sm:w-[calc(50%-0.5rem)]">
          <label for="signup-name" class="text-sm font-medium text-slate-700">Nome completo</label>
          <InputText
            id="signup-name"
            type="text"
            placeholder="Seu nome completo"
            autocomplete="name"
            class="w-full"
          />
          <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{
            $field.error?.message
          }}</Message>
        </section>
      </FormField>

      <FormField v-slot="$field" asChild name="email" initialValue="">
        <section class="flex min-w-0 flex-col gap-2 sm:w-[calc(50%-0.5rem)]">
          <label for="signup-email" class="text-sm font-medium text-slate-700">
            E-mail institucional
          </label>
          <InputText
            id="signup-email"
            type="email"
            placeholder="nome@alunos.utfpr.edu.br"
            autocomplete="email"
            class="w-full"
          />
          <p class="-mt-1 text-xs text-slate-400">Somente e-mails @alunos.utfpr.edu.br</p>
          <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{
            $field.error?.message
          }}</Message>
        </section>
      </FormField>

      <FormField v-slot="$field" asChild name="password" initialValue="">
        <section class="flex min-w-0 flex-col gap-2 sm:w-[calc(50%-0.5rem)]">
          <label for="signup-password" class="text-sm font-medium text-slate-700">Senha</label>
          <Password
            input-id="signup-password"
            type="password"
            placeholder="Mínimo de 6 caracteres"
            autocomplete="new-password"
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

      <FormField v-slot="$field" asChild name="course" initialValue="">
        <section class="flex min-w-0 flex-col gap-2 sm:w-[calc(50%-0.5rem)]">
          <label for="signup-course" class="text-sm font-medium text-slate-700">Curso</label>
          <InputText
            id="signup-course"
            type="text"
            placeholder="Ex.: Engenharia de Software"
            class="w-full"
          />
          <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{
            $field.error?.message
          }}</Message>
        </section>
      </FormField>

      <FormField v-slot="$field" asChild name="campus" initialValue="">
        <section class="flex min-w-0 flex-col gap-2 sm:w-[calc(50%-0.5rem)]">
          <label for="signup-campus" class="text-sm font-medium text-slate-700">Campus</label>
          <InputText
            id="signup-campus"
            type="text"
            placeholder="Ex.: Dois Vizinhos"
            class="w-full"
          />
          <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{
            $field.error?.message
          }}</Message>
        </section>
      </FormField>

      <FormField v-slot="$field" asChild name="avatarUrl" initialValue="">
        <section class="flex min-w-0 flex-col gap-2 sm:w-[calc(50%-0.5rem)]">
          <label for="signup-avatar" class="text-sm font-medium text-slate-700">
            URL do avatar <span class="font-normal text-slate-400">(opcional)</span>
          </label>
          <InputText
            id="signup-avatar"
            type="url"
            placeholder="https://exemplo.com/avatar.png"
            class="w-full"
          />
          <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{
            $field.error?.message
          }}</Message>
        </section>
      </FormField>

      <FormField v-slot="$field" asChild name="bio" initialValue="">
        <section class="flex min-w-0 flex-col gap-2 sm:w-full">
          <label for="signup-bio" class="text-sm font-medium text-slate-700">Biografia</label>
          <Textarea
            id="signup-bio"
            placeholder="Conte um pouco sobre você (mínimo de 25 caracteres)"
            class="w-full"
            rows="3"
            autoResize
          />
          <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{
            $field.error?.message
          }}</Message>
        </section>
      </FormField>

      <Button
        type="submit"
        label="Criar conta de estudante"
        icon="pi pi-user-plus"
        class="w-full rounded-xl border-none bg-slate-900 py-3 text-white hover:bg-slate-800 sm:w-full"
      />
    </Form>

    <div
      class="mt-[1.25rem] flex flex-col items-center gap-3 border-t border-slate-100 pt-[1.25rem] text-center"
    >
      <p class="text-sm text-slate-600">
        Já tem uma conta?
        <RouterLink
          :to="{ name: 'public.auth.signin' }"
          class="font-semibold text-slate-900 hover:underline"
        >
          Entrar
        </RouterLink>
      </p>

      <RouterLink
        :to="{ name: 'admin.auth.signin' }"
        class="text-xs font-medium text-slate-400 transition-colors hover:text-slate-600"
      >
        É administrador? Acesse o painel administrativo
      </RouterLink>
    </div>
  </AuthLayout>
</template>
