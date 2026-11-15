<script setup lang="ts">
defineOptions({ name: 'ClientExplore' })

import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { useToast } from 'primevue/usetoast'
import DataView from 'primevue/dataview'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import Select from 'primevue/select'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Divider from 'primevue/divider'
import Carousel from 'primevue/carousel'

import { useListingStore } from '@/stores/listing'
import type ListingInterface from '@/domain/listing/types/ListingInterface'
import type ListingCategoriesResInterface from '@/domain/listing/types/res/ListingCategoriesResInterface'
import type { ListingCategoryNodeInterface } from '@/domain/listing/types/res/ListingCategoriesResInterface'

const DEFAULT_STATUS = 'ACTIVE'
const SEARCH_DEBOUNCE_MS = 400
const PAGE_SIZE = 12

const toast = useToast()
const listingStore = useListingStore()

const typeOptions = [
  { label: 'Venda', value: 'SELL' },
  { label: 'Doação', value: 'DONATE' },
]
const conditionOptions = [
  { label: 'Novo', value: 'NEW' },
  { label: 'Usado', value: 'USED' },
]
const statusOptions = [
  { label: 'Ativos', value: 'ACTIVE' },
  { label: 'Vendidos', value: 'SOLD' },
]

const STATUS_META: Record<string, { label: string; severity: 'success' | 'secondary' }> = {
  ACTIVE: { label: 'Ativo', severity: 'success' },
  SOLD: { label: 'Vendido', severity: 'secondary' },
}
const TYPE_LABEL: Record<string, string> = { SELL: 'Venda', DONATE: 'Doação' }
const CONDITION_LABEL: Record<string, string> = { NEW: 'Novo', USED: 'Usado' }

function statusMeta(status: string): { label: string; severity: 'success' | 'secondary' } {
  return STATUS_META[status] ?? { label: status, severity: 'secondary' }
}
function typeLabel(type: string): string {
  return TYPE_LABEL[type] ?? type
}
function conditionLabel(condition: string): string {
  return CONDITION_LABEL[condition] ?? condition
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
function formatPrice(listing: Pick<ListingInterface, 'price' | 'type'>): string {
  if (listing.type === 'DONATE') return 'Doação'
  return currencyFormatter.format(Number(listing.price))
}

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' })
function formatDate(value: string): string {
  return dateFormatter.format(new Date(value))
}

function coverImage(listing: ListingInterface): string | undefined {
  return listing.images[0]?.url
}

// ---- Filtros ----------------------------------------------------------------

const search = ref('')
const typeFilter = ref<string | null>(null)
const conditionFilter = ref<string | null>(null)
const statusFilter = ref<string>(DEFAULT_STATUS)
const selectedParentId = ref<string | null>(null)
const selectedChildId = ref<string | null>(null)

const hasActiveFilters = computed(
  () =>
    !!search.value.trim() ||
    !!typeFilter.value ||
    !!conditionFilter.value ||
    statusFilter.value !== DEFAULT_STATUS ||
    !!selectedParentId.value,
)

function clearFilters(): void {
  search.value = ''
  typeFilter.value = null
  conditionFilter.value = null
  statusFilter.value = DEFAULT_STATUS
  selectedParentId.value = null
  selectedChildId.value = null
}

// ---- Categorias -------------------------------------------------------------

const categories = ref<ListingCategoryNodeInterface[]>([])
const categoriesLoading = ref(false)

const rootCategories = computed(() => categories.value.filter((category) => !category.parentId))
const selectedParent = computed(
  () => rootCategories.value.find((category) => category.id === selectedParentId.value) ?? null,
)
const subCategories = computed(() => selectedParent.value?.children ?? [])

// A API filtra por uma única categoria (igualdade). Ao escolher uma categoria
// principal sem subcategoria, buscamos ela e as filhas e juntamos o resultado.
const activeCategoryIds = computed<(string | undefined)[]>(() => {
  if (selectedChildId.value) return [selectedChildId.value]
  if (selectedParent.value) {
    return [selectedParent.value.id, ...subCategories.value.map((category) => category.id)]
  }
  return [undefined]
})

function selectParent(id: string | null): void {
  selectedParentId.value = id
  selectedChildId.value = null
}

function selectChild(id: string | null): void {
  selectedChildId.value = id
}

async function fetchCategories(): Promise<void> {
  categoriesLoading.value = true
  try {
    const data = (await listingStore.actFindAllCategories()) as ListingCategoriesResInterface
    categories.value = data.categories ?? []
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

// ---- Listagem ---------------------------------------------------------------

const listings = ref<ListingInterface[]>([])
const loading = ref(false)
const first = ref(0)

let lastRequestId = 0

async function fetchListings(): Promise<void> {
  const requestId = ++lastRequestId
  loading.value = true

  try {
    const term = search.value.trim()
    const responses = await Promise.all(
      activeCategoryIds.value.map((categoryId) =>
        listingStore.actFindPublicListings({
          categoryId,
          type: typeFilter.value ?? undefined,
          condition: conditionFilter.value ?? undefined,
          status: statusFilter.value,
          search: term || undefined,
        }),
      ),
    )

    if (requestId !== lastRequestId) return

    const unique = new Map<string, ListingInterface>()
    for (const response of responses) {
      for (const listing of response.listings) unique.set(listing.id, listing)
    }

    listings.value = [...unique.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    first.value = 0
  } catch {
    if (requestId !== lastRequestId) return
    toast.add({
      severity: 'error',
      summary: 'Erro ao carregar anúncios',
      detail: 'Não foi possível carregar os anúncios.',
      life: 3000,
    })
  } finally {
    if (requestId === lastRequestId) loading.value = false
  }
}

let searchTimer: ReturnType<typeof setTimeout> | undefined

watch(search, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(fetchListings, SEARCH_DEBOUNCE_MS)
})

watch([typeFilter, conditionFilter, statusFilter, selectedParentId, selectedChildId], () => {
  clearTimeout(searchTimer)
  fetchListings()
})

onMounted(() => {
  fetchCategories()
  fetchListings()
})

onBeforeUnmount(() => clearTimeout(searchTimer))

// ---- Detalhes ---------------------------------------------------------------

const selectedAd = ref<ListingInterface | null>(null)
const detailsVisible = ref(false)
const detailLoading = ref(false)

async function openDetails(listing: ListingInterface): Promise<void> {
  selectedAd.value = null
  detailsVisible.value = true
  detailLoading.value = true

  try {
    const { listing: fresh } = await listingStore.actFindOneListing(listing.id)
    selectedAd.value = fresh
  } catch {
    detailsVisible.value = false
    toast.add({
      severity: 'error',
      summary: 'Erro ao carregar anúncio',
      detail: 'Não foi possível carregar os detalhes do anúncio.',
      life: 3000,
    })
  } finally {
    detailLoading.value = false
  }
}
</script>

<template>
  <section class="space-y-6">
    <header
      class="bg-white rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100"
    >
      <h1 class="text-xl font-bold text-slate-900 tracking-tight">Explorar anúncios</h1>
      <p class="text-sm text-slate-500 mt-0.5">
        Encontre itens e doações publicados por outros estudantes.
      </p>
    </header>

    <div
      class="bg-white rounded-2xl p-4 sm:p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 space-y-4"
    >
      <IconField class="w-full">
        <InputIcon class="pi pi-search text-slate-400" />
        <InputText
          v-model="search"
          placeholder="Busque por título ou descrição"
          aria-label="Buscar anúncios"
          class="w-full rounded-xl bg-slate-50 border-none px-10 py-3 text-slate-700 focus:ring-2 focus:ring-slate-200"
        />
      </IconField>

      <nav aria-label="Categorias" class="space-y-2">
        <div class="flex gap-2 overflow-x-auto pb-1">
          <Button
            label="Todas"
            size="small"
            rounded
            :outlined="!!selectedParentId"
            class="shrink-0"
            :aria-pressed="!selectedParentId"
            @click="selectParent(null)"
          />
          <Button
            v-for="category in rootCategories"
            :key="category.id"
            :label="category.name"
            size="small"
            rounded
            :outlined="selectedParentId !== category.id"
            class="shrink-0"
            :aria-pressed="selectedParentId === category.id"
            @click="selectParent(category.id)"
          />
          <span
            v-if="categoriesLoading && !rootCategories.length"
            class="flex items-center gap-2 text-sm text-slate-400"
          >
            <i class="pi pi-spin pi-spinner" /> Carregando categorias...
          </span>
        </div>

        <div v-if="subCategories.length" class="flex gap-2 overflow-x-auto pb-1">
          <Button
            :label="`Tudo em ${selectedParent?.name}`"
            size="small"
            rounded
            severity="secondary"
            :outlined="!!selectedChildId"
            class="shrink-0"
            @click="selectChild(null)"
          />
          <Button
            v-for="category in subCategories"
            :key="category.id"
            :label="category.name"
            size="small"
            rounded
            severity="secondary"
            :outlined="selectedChildId !== category.id"
            class="shrink-0"
            @click="selectChild(category.id)"
          />
        </div>
      </nav>

      <div class="grid! grid-cols-1! gap-3 sm:grid-cols-2! lg:grid-cols-4!">
        <Select
          v-model="typeFilter"
          :options="typeOptions"
          option-label="label"
          option-value="value"
          placeholder="Todos os tipos"
          show-clear
          class="w-full rounded-xl bg-slate-50 border-none shadow-none"
        />
        <Select
          v-model="conditionFilter"
          :options="conditionOptions"
          option-label="label"
          option-value="value"
          placeholder="Qualquer condição"
          show-clear
          class="w-full rounded-xl bg-slate-50 border-none shadow-none"
        />
        <Select
          v-model="statusFilter"
          :options="statusOptions"
          option-label="label"
          option-value="value"
          class="w-full rounded-xl bg-slate-50 border-none shadow-none"
        />
        <Button
          label="Limpar filtros"
          icon="pi pi-filter-slash"
          severity="secondary"
          outlined
          class="w-full rounded-xl"
          :disabled="!hasActiveFilters"
          @click="clearFilters"
        />
      </div>
    </div>

    <div
      class="bg-white rounded-2xl p-4 sm:p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100"
    >
      <DataView
        v-model:first="first"
        :value="listings"
        data-key="id"
        paginator
        :rows="PAGE_SIZE"
        layout="grid"
        :loading="loading"
      >
        <template #empty>
          <div class="py-12 text-center text-slate-500">
            <i class="pi pi-shopping-bag mb-3 text-2xl text-slate-400" aria-hidden="true" />
            <p>
              {{
                loading
                  ? 'Carregando anúncios...'
                  : hasActiveFilters
                    ? 'Nenhum anúncio encontrado para esses filtros.'
                    : 'Nenhum anúncio disponível no momento.'
              }}
            </p>
          </div>
        </template>

        <template #grid="{ items }">
          <div class="grid! grid-cols-1! gap-6 sm:grid-cols-2! lg:grid-cols-3! 2xl:grid-cols-4!">
            <article
              v-for="ad in items as ListingInterface[]"
              :key="ad.id"
              role="button"
              tabindex="0"
              class="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white transition hover:shadow-md"
              @click="openDetails(ad)"
              @keydown.enter="openDetails(ad)"
              @keydown.space.prevent="openDetails(ad)"
            >
              <div class="relative h-48 overflow-hidden bg-slate-50 p-4">
                <img
                  v-if="coverImage(ad)"
                  :src="coverImage(ad)"
                  :alt="ad.title"
                  loading="lazy"
                  class="h-full w-full object-cover rounded-xl transition duration-300 group-hover:scale-105"
                />
                <div v-else class="flex h-full w-full items-center justify-center text-slate-300">
                  <i class="pi pi-image text-3xl" />
                </div>
                <Tag
                  v-if="ad.status !== DEFAULT_STATUS"
                  :value="statusMeta(ad.status).label"
                  :severity="statusMeta(ad.status).severity"
                  class="absolute left-6 top-6"
                />
              </div>

              <div class="flex flex-1 flex-col p-5">
                <h2 class="font-bold text-slate-900 text-lg tracking-tight line-clamp-1">
                  {{ ad.title }}
                </h2>

                <p class="mt-1 font-semibold text-slate-700">{{ formatPrice(ad) }}</p>

                <div class="mt-2 flex flex-wrap gap-1.5">
                  <Tag :value="typeLabel(ad.type)" severity="secondary" />
                  <Tag :value="conditionLabel(ad.condition)" severity="secondary" />
                </div>

                <p v-if="ad.location" class="mt-3 line-clamp-1 text-xs font-medium text-slate-500">
                  <i class="pi pi-map-marker mr-1 text-[10px]" />{{ ad.location }}
                </p>

                <div class="mt-auto pt-4">
                  <div class="border-t border-slate-100 pt-4 flex items-center justify-between">
                    <span class="line-clamp-1 text-xs font-bold text-slate-700">
                      {{ ad.seller.name }}
                    </span>
                    <span
                      class="ml-2 line-clamp-1 shrink-0 text-[10px] uppercase font-bold text-slate-400"
                    >
                      {{ ad.category.name }}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </template>
      </DataView>
    </div>

    <Dialog v-model:visible="detailsVisible" modal dismissable-mask class="w-full max-w-4xl m-4">
      <template #header>
        <span
          v-if="selectedAd"
          class="block max-w-[90%] truncate text-lg font-semibold text-slate-900"
        >
          {{ selectedAd.title }}
        </span>
        <span v-else class="text-lg font-semibold text-slate-400">Carregando...</span>
      </template>

      <div v-if="detailLoading" class="flex items-center justify-center gap-2 py-16 text-slate-500">
        <i class="pi pi-spin pi-spinner text-2xl" />
        <span>Carregando detalhes...</span>
      </div>

      <div v-else-if="selectedAd" class="flex flex-col gap-4">
        <Carousel
          v-if="selectedAd.images.length"
          :value="selectedAd.images"
          :num-visible="1"
          :num-scroll="1"
          :circular="selectedAd.images.length > 1"
          :show-navigators="selectedAd.images.length > 1"
        >
          <template #item="{ data }">
            <div class="overflow-hidden rounded-xl bg-slate-100">
              <img :src="data.url" :alt="selectedAd.title" class="max-h-72 w-full object-contain" />
            </div>
          </template>
        </Carousel>
        <div
          v-else
          class="flex h-48 w-full items-center justify-center rounded-xl bg-slate-100 text-slate-300"
        >
          <i class="pi pi-image text-5xl" />
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <Tag
            :value="statusMeta(selectedAd.status).label"
            :severity="statusMeta(selectedAd.status).severity"
          />
          <Tag :value="selectedAd.category.name" severity="info" />
          <Tag :value="typeLabel(selectedAd.type)" severity="secondary" />
          <Tag :value="conditionLabel(selectedAd.condition)" severity="secondary" />
        </div>

        <p class="text-2xl font-semibold text-slate-900">{{ formatPrice(selectedAd) }}</p>

        <p v-if="selectedAd.description" class="whitespace-pre-line text-slate-600">
          {{ selectedAd.description }}
        </p>
        <p v-else class="text-slate-400 italic">Sem descrição.</p>

        <Divider />

        <dl class="grid! grid-cols-1! gap-3 text-sm sm:grid-cols-2!">
          <div>
            <dt class="text-slate-500">Anunciante</dt>
            <dd class="font-medium text-slate-900">
              {{ selectedAd.seller.name }}
              <span class="block text-xs font-normal text-slate-500">
                {{ selectedAd.seller.course }} · {{ selectedAd.seller.campus }}
              </span>
            </dd>
          </div>
          <div>
            <dt class="text-slate-500">Localização</dt>
            <dd class="font-medium text-slate-900">{{ selectedAd.location ?? 'Não informada' }}</dd>
          </div>
          <div>
            <dt class="text-slate-500">Publicado em</dt>
            <dd class="font-medium text-slate-900">{{ formatDate(selectedAd.createdAt) }}</dd>
          </div>
        </dl>
      </div>
    </Dialog>
  </section>
</template>
