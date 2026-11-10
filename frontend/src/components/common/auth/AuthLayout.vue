<script setup lang="ts">
defineOptions({ name: 'CommonAuthLayout' })

interface Props {
  kicker: string
  title: string
  subtitle: string
}

defineProps<Props>()
</script>

<template>
  <section
    class="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_70px_-20px_rgba(15,23,42,0.35)] lg:grid-cols-[1.05fr_1fr]"
  >
    <aside
      class="relative hidden flex-col justify-between overflow-hidden bg-slate-900 p-10 text-white lg:flex"
    >
      <div
        class="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl"
      />
      <div
        class="pointer-events-none absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl"
      />
      <slot name="brand" />
    </aside>

    <div class="flex flex-col justify-center p-6 sm:p-10 lg:p-12">
      <div class="mb-8 text-center lg:text-left">
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
          {{ kicker }}
        </p>
        <h2 class="mt-2 text-2xl font-bold tracking-tight text-slate-900">{{ title }}</h2>
        <p class="mt-1 text-sm text-slate-500">{{ subtitle }}</p>
      </div>

      <slot />
    </div>
  </section>
</template>
