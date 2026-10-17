<script setup lang="ts">
defineOptions({ name: 'ClientProfile' })

import { computed, reactive, ref, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'

import Avatar from '@/components/common/Avatar.vue'
import type UserMeResInterface from '@/domain/user/types/res/UserMeResInterface'
import type UserUpdateMeReqInterface from '@/domain/user/types/req/UserUpdateMeReqInterface'
import { useUserStore } from '@/stores/user'

const toast = useToast()
const userStore = useUserStore()
const isSaving = ref(false)
const isUploadingAvatar = ref(false)
const avatarInput = ref<HTMLInputElement | null>(null)

const profile = reactive({
  name: '',
  course: '',
  campus: '',
  bio: '',
  defaultUserPrompt: '',
})

const bioLength = computed(() => profile.bio.length)

watch(
  () => userStore.user,
  (user) => {
    if (!user) return
    profile.name = user.name
    profile.course = user.course
    profile.campus = user.campus
    profile.bio = user.bio
    profile.defaultUserPrompt = user.defaultUserPrompt ?? ''
  },
  { immediate: true },
)

async function saveProfile(): Promise<void> {
  isSaving.value = true

  const payload: UserUpdateMeReqInterface = {
    name: profile.name.trim(),
    course: profile.course.trim(),
    campus: profile.campus.trim(),
    bio: profile.bio.trim(),
    defaultUserPrompt: profile.defaultUserPrompt.trim(),
  }

  try {
    const { me } = await userStore.actUpdateMe(payload)
    applyProfile(me)
    toast.add({ severity: 'success', summary: 'Perfil atualizado.', life: 3000 })
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Não foi possível atualizar o perfil.',
      life: 3000,
    })
  } finally {
    isSaving.value = false
  }
}

async function uploadAvatar(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const image = input.files?.[0]
  if (!image) return

  if (!['image/png', 'image/jpeg'].includes(image.type)) {
    toast.add({
      severity: 'error',
      summary: 'Formato inválido. Escolha um arquivo PNG ou JPG.',
      life: 3000,
    })
    input.value = ''
    return
  }

  isUploadingAvatar.value = true
  try {
    const { me } = await userStore.actUpdateAvatar(image)
    applyProfile(me)
    toast.add({ severity: 'success', summary: 'Foto de perfil atualizada.', life: 3000 })
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Não foi possível enviar a foto de perfil.',
      life: 3000,
    })
  } finally {
    isUploadingAvatar.value = false
    input.value = ''
  }
}

function applyProfile(user: UserMeResInterface['me']): void {
  profile.name = user.name
  profile.course = user.course
  profile.campus = user.campus
  profile.bio = user.bio
  profile.defaultUserPrompt = user.defaultUserPrompt ?? ''
}
</script>

<template>
  <section class="mx-auto max-w-4xl space-y-6">
    <header class="border-b border-slate-200 pb-5">
      <p class="text-sm font-medium text-slate-500">Conta de estudante</p>
      <h1 class="mt-1 text-2xl font-semibold text-slate-900">Meu perfil</h1>
    </header>

    <form class="space-y-6" @submit.prevent="saveProfile">
      <section class="rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div class="flex min-w-0 items-center gap-4">
            <Avatar
              :username="userStore.user?.name"
              :src-img="userStore.user?.avatarUrl"
              class="h-16 w-16"
            />
            <div class="min-w-0">
              <h2 class="font-semibold text-slate-900">Foto de perfil</h2>
              <p class="mt-1 text-sm text-slate-500">Arquivos PNG ou JPG</p>
            </div>
          </div>
          <input
            ref="avatarInput"
            class="hidden"
            type="file"
            accept="image/png,image/jpeg"
            @change="uploadAvatar"
          />
          <Button
            type="button"
            :label="isUploadingAvatar ? 'Enviando...' : 'Enviar foto'"
            icon="pi pi-upload"
            severity="secondary"
            outlined
            :loading="isUploadingAvatar"
            :disabled="isUploadingAvatar"
            class="w-full sm:ml-auto sm:w-auto"
            @click="avatarInput?.click()"
          />
        </div>
      </section>

      <section class="rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
        <h2 class="text-base font-semibold text-slate-900">Dados pessoais</h2>

        <div class="mt-5 grid gap-5 sm:grid-cols-2">
          <label class="flex flex-col gap-2 text-sm font-medium text-slate-700" for="profile-name">
            Nome
            <InputText id="profile-name" v-model="profile.name" required maxlength="120" />
          </label>
          <label
            class="flex flex-col gap-2 text-sm font-medium text-slate-700"
            for="profile-course"
          >
            Curso
            <InputText id="profile-course" v-model="profile.course" required maxlength="120" />
          </label>
          <label
            class="flex flex-col gap-2 text-sm font-medium text-slate-700"
            for="profile-campus"
          >
            Campus
            <InputText id="profile-campus" v-model="profile.campus" required maxlength="120" />
          </label>
          <label class="flex flex-col gap-2 text-sm font-medium text-slate-700" for="profile-bio">
            Bio
            <Textarea
              id="profile-bio"
              v-model="profile.bio"
              required
              minlength="25"
              maxlength="200"
              rows="4"
              autoResize
            />
            <span class="text-right text-xs font-normal text-slate-500">{{ bioLength }}/200</span>
          </label>
        </div>

        <div class="mt-5">
          <label
            class="flex flex-col gap-2 text-sm font-medium text-slate-700"
            for="profile-prompt"
          >
            Prompt padrão de recomendação
            <Textarea
              id="profile-prompt"
              v-model="profile.defaultUserPrompt"
              maxlength="500"
              rows="4"
              autoResize
              placeholder="Descreva o que você costuma procurar"
            />
          </label>
          <p class="mt-2 text-right text-xs text-slate-500">
            {{ profile.defaultUserPrompt.length }}/500
          </p>
        </div>

        <div class="mt-6 flex justify-end border-t border-slate-100 pt-5">
          <Button
            type="submit"
            label="Salvar alterações"
            icon="pi pi-check"
            :loading="isSaving"
            :disabled="isSaving || isUploadingAvatar"
          />
        </div>
      </section>
    </form>
  </section>
</template>
