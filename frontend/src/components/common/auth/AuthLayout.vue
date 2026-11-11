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
    class="flex w-full min-w-0 max-w-5xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_70px_-20px_rgba(15,23,42,0.35)] lg:flex-row"
  >
    <aside
      class="relative hidden flex-col justify-between overflow-hidden bg-slate-900 p-10 text-white lg:flex lg:w-[46%] lg:shrink-0"
    >
      <div
        class="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl"
      />
      <div
        class="pointer-events-none absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl"
      />
      <slot name="brand" />
    </aside>

    <div class="flex min-w-0 flex-1 flex-col justify-center p-6 sm:p-10 lg:p-12">
      <div class="mb-8 text-center max-[340px]:min-h-[7.75rem] lg:text-left">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 sm:tracking-[0.3em]">
          {{ kicker }}
        </p>
        <h2 class="mt-2 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{{ title }}</h2>
        <p class="mt-1 text-sm text-slate-500">{{ subtitle }}</p>
      </div>

      <slot />
    </div>
  </section>
</template>
