<script setup lang="ts">
defineOptions({ name: 'PrivateViewLayout' })

import { computed, onBeforeMount, ref } from 'vue'

import Navbar from '@/components/private/Navbar.vue'
import Sidebar from '@/components/private/Sidebar.vue'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'

const authStore = useAuthStore()
const userStore = useUserStore()

const sidebarOpen = ref(false)

const adminNavigation = [
  {
    label: 'Usuários',
    icon: 'pi pi-users',
    to: '/app/users',
  },
  {
    label: 'Anúncios',
    icon: 'pi pi-bell',
    to: '/app/ads',
  },
]

const clientNavigation = [
  { label: 'Explorar', icon: 'pi pi-home', to: '/app/home' },
  { label: 'Favoritos', icon: 'pi pi-heart', to: '/app/favorites' },
  { label: 'Meu perfil', icon: 'pi pi-user-edit', to: '/app/profile' },
]

const isClient = computed(() => userStore.user?.role === 'client')
const navigation = computed(() => (isClient.value ? clientNavigation : adminNavigation))
const title = computed(() => (isClient.value ? 'UTF Store' : 'UTF-Store Admin'))

function logout() {
  authStore.$reset()
}

onBeforeMount(() => {
  if (!userStore.user) userStore.actMe()
})
</script>

<template>
  <div class="min-h-screen bg-[#f1f5f9] lg:flex">
    <Sidebar
      v-model:open="sidebarOpen"
      :user="userStore.user"
      :navigation="navigation"
      :title="title"
      :subtitle="isClient ? 'Compra e venda entre estudantes' : ''"
      @logout="logout"
    />

    <div class="flex min-h-screen min-w-0 flex-1 flex-col">
      <div class="lg:hidden">
        <Navbar
          :user="userStore.user"
          :title="title"
          @menu-click="sidebarOpen = true"
          @logout="logout"
        />
      </div>

      <main class="flex-1 space-y-6 p-4">
        <slot />
        <router-view />
      </main>
    </div>
  </div>
</template>
