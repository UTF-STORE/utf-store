<script setup lang="ts">
defineOptions({ name: 'CreateAdView' })

import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import Button from 'primevue/button'

import { useListingStore } from '@/stores/listing'

const listingStore = useListingStore()

const router = useRouter()
const toast = useToast()

const loading = ref(false)
const categoriesLoading = ref(false)

const form = ref({
  title: '',
  description: '',
  price: '',
  categoryId: '',
  type: 'SELL',
  condition: 'NEW',
  location: '',
})

const typeOptions = [
  { label: 'Venda', value: 'SELL' },
  { label: 'Doação', value: 'DONATE' },
]

const conditionOptions = [
  { label: 'Novo', value: 'NEW' },
  { label: 'Usado', value: 'USED' },
]

const categoryOptions = ref<{ label: string; value: string }[]>([])

async function fetchCategories(): Promise<void> {
  categoriesLoading.value = true
  try {
    const data = await listingStore.actFindAllCategories()
    const list: { id: string; name: string }[] = Array.isArray(data)
      ? data
      : (data?.categories ?? [])
    categoryOptions.value = list.map((category) => ({ label: category.name, value: category.id }))
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Erro ao carregar categorias',
      detail: 'Não foi possível carregar as categorias.',
      life: 3000,
    })
  } finally {
    categoriesLoading.value = false
  }
}

function goToAds(): void {
  router.push({ name: 'admin.ads' })
}

async function onSubmit(): Promise<void> {
  if (!form.value.title || !form.value.price || !form.value.categoryId) {
    toast.add({
      severity: 'warn',
      summary: 'Campos obrigatórios',
      detail: 'Preencha o título, o preço e a categoria do anúncio.',
      life: 3000,
    })
    return
  }

  const price = Number(String(form.value.price).replace(',', '.'))
  if (Number.isNaN(price) || price < 0) {
    toast.add({
      severity: 'warn',
      summary: 'Preço inválido',
      detail: 'Informe um preço válido, por exemplo 59,90.',
      life: 3000,
    })
    return
  }

  loading.value = true
  try {
    await listingStore.actCreateListing({
      categoryId: form.value.categoryId,
      title: form.value.title,
      description: form.value.description || undefined,
      price: price.toFixed(2),
      condition: form.value.condition,
      type: form.value.type,
      location: form.value.location || undefined,
    })

    toast.add({
      severity: 'success',
      summary: 'Anúncio criado',
      detail: 'O anúncio foi cadastrado com sucesso!',
      life: 3000,
    })

    goToAds()
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Erro ao criar',
      detail: 'Não foi possível salvar o anúncio.',
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}

onMounted(fetchCategories)
</script>

<template>
  <section class="max-w-3xl mx-auto space-y-6">
    <header
      class="flex items-center justify-between bg-white rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100"
    >
      <div>
        <h1 class="text-xl font-bold text-slate-900 tracking-tight">Novo Anúncio</h1>
        <p class="text-sm text-slate-500 mt-0.5">
          Preencha os dados para publicar um item ou serviço.
        </p>
      </div>
      <Button
        label="Voltar"
        icon="pi pi-arrow-left"
        severity="secondary"
        outlined
        class="rounded-xl"
        @click="goToAds"
      />
    </header>

    <div
      class="bg-white rounded-2xl p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100"
    >
      <form class="space-y-5" @submit.prevent="onSubmit">
        <div class="flex flex-col gap-1.5">
          <label for="title" class="text-sm font-semibold text-slate-700">Título do Anúncio</label>
          <InputText
            id="title"
            v-model="form.title"
            placeholder="Ex: Notebook Gamer"
            class="w-full rounded-xl bg-slate-50 border-slate-200 px-4 py-3 text-slate-700"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="flex flex-col gap-1.5">
            <label for="price" class="text-sm font-semibold text-slate-700">Preço (R$)</label>
            <InputText
              id="price"
              v-model="form.price"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              class="w-full rounded-xl bg-slate-50 border-slate-200 px-4 py-3 text-slate-700"
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="category" class="text-sm font-semibold text-slate-700">Categoria</label>
            <Select
              id="category"
              v-model="form.categoryId"
              :options="categoryOptions"
              :loading="categoriesLoading"
              option-label="label"
              option-value="value"
              placeholder="Selecione a categoria"
              class="w-full rounded-xl bg-slate-50 border-slate-200"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="flex flex-col gap-1.5">
            <label for="type" class="text-sm font-semibold text-slate-700">Tipo</label>
            <Select
              id="type"
              v-model="form.type"
              :options="typeOptions"
              option-label="label"
              option-value="value"
              class="w-full rounded-xl bg-slate-50 border-slate-200"
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="condition" class="text-sm font-semibold text-slate-700">Condição</label>
            <Select
              id="condition"
              v-model="form.condition"
              :options="conditionOptions"
              option-label="label"
              option-value="value"
              class="w-full rounded-xl bg-slate-50 border-slate-200"
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="location" class="text-sm font-semibold text-slate-700">Localização</label>
            <InputText
              id="location"
              v-model="form.location"
              placeholder="Ex: Dois Vizinhos, PR"
              class="w-full rounded-xl bg-slate-50 border-slate-200 px-4 py-3 text-slate-700"
            />
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label for="description" class="text-sm font-semibold text-slate-700">Descrição</label>
          <Textarea
            id="description"
            v-model="form.description"
            rows="4"
            placeholder="Descreva os detalhes..."
            class="w-full rounded-xl bg-slate-50 border-slate-200 p-4 text-slate-700"
          />
        </div>

        <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" label="Cancelar" severity="secondary" text @click="goToAds" />
          <Button
            type="submit"
            label="Salvar Anúncio"
            icon="pi pi-check"
            :loading="loading"
            class="rounded-xl px-6"
          />
        </div>
      </form>
    </div>
  </section>
</template>
