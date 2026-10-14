<script setup lang="ts">
defineOptions({ name: 'ClientPlaceholder' })

import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isFavorites = computed(() => route.name === 'client.favorites')
const title = computed(() => (isFavorites.value ? 'Favoritos' : 'Explorar anúncios'))
const message = computed(() =>
  isFavorites.value ? 'Você ainda não salvou anúncios.' : 'Nenhum anúncio disponível no momento.',
)
</script>

<template>
  <section class="space-y-6">
    <header class="border-b border-slate-200 pb-5">
      <h1 class="text-2xl font-semibold text-slate-900">{{ title }}</h1>
    </header>

    <div class="rounded-lg border border-slate-200 bg-white px-6 py-12 text-center">
      <i
        :class="isFavorites ? 'pi pi-heart' : 'pi pi-shopping-bag'"
        class="text-2xl text-slate-400"
        aria-hidden="true"
      />
      <p class="mt-3 text-sm text-slate-600">{{ message }}</p>
    </div>
  </section>
</template>