<script setup lang="ts">
defineOptions({ name: 'ClientChat' })

import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import Textarea from 'primevue/textarea'

import Avatar from '@/components/common/Avatar.vue'
import type ChatConversationInterface from '@/domain/chat/types/ChatConversationInterface'
import type ChatListingInterface from '@/domain/chat/types/ChatListingInterface'
import type ChatMessageInterface from '@/domain/chat/types/ChatMessageInterface'
import type ChatUserInterface from '@/domain/chat/types/ChatUserInterface'
import { useChatStore } from '@/stores/chat'
import { useListingStore } from '@/stores/listing'
import { useUserStore } from '@/stores/user'

const MAX_MESSAGE_LENGTH = 2000

const route = useRoute()
const router = useRouter()
const toast = useToast()
const chatStore = useChatStore()
const listingStore = useListingStore()
const userStore = useUserStore()

const listingId = computed(() => (route.params.listingId as string | undefined) ?? null)
const contactId = computed(() => (route.params.contactId as string | undefined) ?? null)
const hasActiveConversation = computed(() => !!listingId.value && !!contactId.value)

const fallbackContact = ref<ChatUserInterface | null>(null)
const fallbackListing = ref<ChatListingInterface | null>(null)

const activeConversation = computed<ChatConversationInterface | null>(() => {
  if (!listingId.value || !contactId.value) return null

  return (
    chatStore.conversations.find(
      (conversation) =>
        conversation.listing.id === listingId.value && conversation.contact.id === contactId.value,
    ) ?? null
  )
})

const activeContact = computed<ChatUserInterface | null>(
  () => activeConversation.value?.contact ?? fallbackContact.value,
)
const activeListing = computed<ChatListingInterface | null>(
  () => activeConversation.value?.listing ?? fallbackListing.value,
)

const draft = ref('')
const messagesContainer = ref<HTMLElement | null>(null)

const canSend = computed(
  () =>
    !!draft.value.trim() &&
    draft.value.length <= MAX_MESSAGE_LENGTH &&
    hasActiveConversation.value &&
    chatStore.connected &&
    !chatStore.messagesLoading,
)

const timeFormatter = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' })
const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

function formatTime(value: string): string {
  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? '' : timeFormatter.format(date)
}

function formatConversationTime(value: string): string {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return ''
  if (date.toDateString() === new Date().toDateString()) return timeFormatter.format(date)

  return dateFormatter.format(date)
}

function isMine(message: ChatMessageInterface): boolean {
  return message.senderId === userStore.user?.id
}

function isUnread(conversation: ChatConversationInterface): boolean {
  const userId = userStore.user?.id

  return (
    !!userId && conversation.lastMessage.receiverId === userId && !conversation.lastMessage.isRead
  )
}

function preview(conversation: ChatConversationInterface): string {
  const prefix = conversation.lastMessage.senderId === userStore.user?.id ? 'Você: ' : ''

  return `${prefix}${conversation.lastMessage.content}`
}

async function scrollToBottom(): Promise<void> {
  await nextTick()

  const container = messagesContainer.value
  if (container) container.scrollTop = container.scrollHeight
}

async function loadConversations(): Promise<void> {
  try {
    await chatStore.actFindConversations()
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Erro ao carregar conversas',
      detail: 'Não foi possível carregar suas conversas.',
      life: 3000,
    })
  }
}

async function ensureConversationContext(listing: string, contact: string): Promise<void> {
  if (activeConversation.value) return

  try {
    const { listing: data } = await listingStore.actFindOneListing(listing)

    fallbackContact.value = {
      id: data.seller.id,
      name: data.seller.name,
      email: data.seller.email,
      avatarUrl: data.seller.avatarUrl,
      isVerified: data.seller.isVerified,
    }
    fallbackListing.value = {
      id: data.id,
      title: data.title,
      status: data.status,
    }
  } catch {
    fallbackContact.value = {
      id: contact,
      name: 'Estudante',
      email: '',
      avatarUrl: null,
      isVerified: false,
    }
    fallbackListing.value = {
      id: listing,
      title: '',
      status: '',
    }
  }
}

async function loadMessages(listing: string, contact: string): Promise<void> {
  try {
    await chatStore.actFindMessages(listing, contact)
    await scrollToBottom()
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Erro ao carregar mensagens',
      detail: 'Não foi possível carregar o histórico desta conversa.',
      life: 3000,
    })
  }
}

async function syncActiveConversation(): Promise<void> {
  const listing = listingId.value
  const contact = contactId.value

  chatStore.actSetActiveConversation(listing, contact)
  fallbackContact.value = null
  fallbackListing.value = null
  draft.value = ''

  if (!listing || !contact) return

  await ensureConversationContext(listing, contact)
  await loadMessages(listing, contact)
}

function openConversation(conversation: ChatConversationInterface): void {
  router.push({
    name: 'client.chat.conversation',
    params: {
      listingId: conversation.listing.id,
      contactId: conversation.contact.id,
    },
  })
}

function backToList(): void {
  router.push({ name: 'client.chat' })
}

function handleSend(): void {
  const content = draft.value.trim()

  if (!canSend.value || !content || !listingId.value || !contactId.value) return

  try {
    chatStore.actSendMessage({
      receiverId: contactId.value,
      listingId: listingId.value,
      content,
    })
    draft.value = ''
    void scrollToBottom()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erro ao enviar mensagem',
      detail: error instanceof Error ? error.message : 'Tente novamente mais tarde.',
      life: 3000,
    })
  }
}

watch(
  () => chatStore.messages.length,
  () => {
    void scrollToBottom()
  },
)

watch([listingId, contactId], () => {
  void syncActiveConversation()
})

onMounted(async () => {
  chatStore.actConnect()
  await loadConversations()
  await syncActiveConversation()
})

onBeforeUnmount(() => {
  chatStore.actSetActiveConversation(null, null)
  chatStore.actDisconnect()
})
</script>

<template>
  <section
    class="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
  >
    <div class="flex h-[calc(100dvh-7rem)] min-h-[30rem] lg:h-[calc(100dvh-3rem)]">
      <aside
        class="w-full shrink-0 flex-col border-slate-100 lg:flex lg:w-80! lg:border-r xl:w-96!"
        :class="hasActiveConversation ? 'hidden lg:flex' : 'flex'"
      >
        <header class="border-b border-slate-100 p-5">
          <h1 class="text-xl font-bold tracking-tight text-slate-900">Mensagens</h1>
          <p class="mt-0.5 text-sm text-slate-500">
            Conversas vinculadas aos seus anúncios e interesses.
          </p>

          <div class="mt-3 flex items-center gap-2 text-xs text-slate-500">
            <span
              class="h-[0.5rem] w-[0.5rem] rounded-full"
              :class="chatStore.connected ? 'bg-emerald-500' : 'bg-amber-500'"
            />
            {{ chatStore.connected ? 'Conectado em tempo real' : 'Conectando...' }}
          </div>
        </header>

        <div
          v-if="chatStore.conversationsLoading"
          class="flex flex-1 items-center justify-center gap-2 p-6 text-slate-500"
        >
          <i class="pi pi-spin pi-spinner" />
          <span class="text-sm">Carregando conversas...</span>
        </div>

        <div
          v-else-if="!chatStore.conversations.length"
          class="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center"
        >
          <i class="pi pi-comments text-3xl text-slate-300" aria-hidden="true" />
          <div>
            <p class="font-semibold text-slate-700">Nenhuma conversa ainda</p>
            <p class="mt-1 text-sm text-slate-500">
              Interesse-se por um anúncio para iniciar uma conversa com o anunciante.
            </p>
          </div>
          <Button
            label="Explorar anúncios"
            icon="pi pi-search"
            outlined
            size="small"
            @click="router.push({ name: 'client.listings' })"
          />
        </div>

        <ul v-else class="flex-1 overflow-y-auto">
          <li v-for="conversation in chatStore.conversations" :key="conversation.id">
            <button
              type="button"
              class="flex w-full items-start gap-3 border-b border-slate-50 px-4 py-3 text-left transition-colors hover:bg-slate-50"
              :class="activeConversation?.id === conversation.id ? 'bg-slate-100/80' : ''"
              @click="openConversation(conversation)"
            >
              <Avatar
                :username="conversation.contact.name"
                :src-img="conversation.contact.avatarUrl"
                class="max-w-11! max-h-11! shrink-0 rounded-full object-cover"
              />

              <div class="min-w-0 flex-1">
                <div class="flex items-baseline justify-between gap-2">
                  <span class="truncate text-sm font-semibold text-slate-900">
                    {{ conversation.contact.name }}
                  </span>
                  <span class="shrink-0 text-[11px] text-slate-400">
                    {{ formatConversationTime(conversation.lastMessage.createdAt) }}
                  </span>
                </div>

                <p class="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-500">
                  <i class="pi pi-tag text-[10px]" aria-hidden="true" />
                  {{ conversation.listing.title }}
                </p>

                <p
                  class="mt-1 truncate text-sm"
                  :class="
                    isUnread(conversation) ? 'font-semibold text-slate-900' : 'text-slate-500'
                  "
                >
                  {{ preview(conversation) }}
                </p>
              </div>

              <span
                v-if="isUnread(conversation)"
                class="mt-1 h-[0.625rem] w-[0.625rem] shrink-0 rounded-full bg-emerald-500"
                aria-label="Mensagem não lida"
              />
            </button>
          </li>
        </ul>
      </aside>

      <div
        class="min-w-0 flex-1 flex-col"
        :class="hasActiveConversation ? 'flex' : 'hidden lg:flex'"
      >
        <template v-if="hasActiveConversation">
          <header class="flex items-center gap-3 border-b border-slate-100 p-4">
            <Button
              icon="pi pi-arrow-left"
              text
              rounded
              severity="secondary"
              class="lg:hidden"
              aria-label="Voltar para as conversas"
              @click="backToList"
            />

            <Avatar
              :username="activeContact?.name"
              :src-img="activeContact?.avatarUrl"
              class="max-w-10! max-h-10! shrink-0 rounded-full object-cover"
            />

            <div class="min-w-0">
              <p class="truncate text-sm font-semibold text-slate-900">
                {{ activeContact?.name ?? 'Conversa' }}
              </p>
              <p v-if="activeListing?.title" class="truncate text-xs text-slate-500">
                <i class="pi pi-tag mr-1 text-[10px]" aria-hidden="true" />{{ activeListing.title }}
              </p>
            </div>

            <span
              class="ml-auto shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium"
              :class="
                chatStore.connected
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-amber-50 text-amber-700'
              "
            >
              {{ chatStore.connected ? 'Online' : 'Conectando' }}
            </span>
          </header>

          <p
            v-if="chatStore.socketError"
            class="border-b border-amber-100 bg-amber-50 px-4 py-2 text-xs text-amber-700"
          >
            {{ chatStore.socketError }}
          </p>

          <div
            ref="messagesContainer"
            class="flex-1 space-y-3 overflow-y-auto bg-slate-50/60 p-4"
            aria-live="polite"
          >
            <div
              v-if="chatStore.messagesLoading"
              class="flex items-center justify-center gap-2 py-10 text-slate-500"
            >
              <i class="pi pi-spin pi-spinner" />
              <span class="text-sm">Carregando mensagens...</span>
            </div>

            <div
              v-else-if="!chatStore.messages.length"
              class="flex flex-col items-center justify-center gap-2 py-10 text-center text-slate-500"
            >
              <i class="pi pi-send text-2xl text-slate-300" aria-hidden="true" />
              <p class="text-sm">Envie a primeira mensagem sobre este anúncio.</p>
            </div>

            <template v-else>
              <div
                v-for="message in chatStore.messages"
                :key="message.id"
                class="flex"
                :class="isMine(message) ? 'justify-end' : 'justify-start'"
              >
                <div
                  class="max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm"
                  :class="
                    isMine(message)
                      ? 'rounded-br-md bg-slate-900 text-white'
                      : 'rounded-bl-md border border-slate-100 bg-white text-slate-700'
                  "
                >
                  <p class="whitespace-pre-line break-words text-sm">{{ message.content }}</p>

                  <div
                    class="mt-1 flex items-center justify-end gap-1 text-[10px]"
                    :class="isMine(message) ? 'text-slate-300' : 'text-slate-400'"
                  >
                    <span>{{ formatTime(message.createdAt) }}</span>
                    <template v-if="isMine(message)">
                      <i
                        :class="message.isRead ? 'pi pi-check-circle' : 'pi pi-check'"
                        aria-hidden="true"
                      />
                      <span>{{ message.isRead ? 'Lida' : 'Enviada' }}</span>
                    </template>
                  </div>
                </div>
              </div>
            </template>
          </div>

          <footer class="border-t border-slate-100 p-3">
            <div class="flex items-end gap-2">
              <Textarea
                v-model="draft"
                rows="1"
                auto-resize
                :maxlength="MAX_MESSAGE_LENGTH"
                placeholder="Escreva uma mensagem..."
                aria-label="Escreva uma mensagem"
                class="w-full"
                @keydown.enter.exact.prevent="handleSend"
              />

              <Button
                icon="pi pi-send"
                rounded
                :disabled="!canSend"
                aria-label="Enviar mensagem"
                @click="handleSend"
              />
            </div>

            <p class="mt-1 text-right text-[10px] text-slate-400">
              {{ draft.length }}/{{ MAX_MESSAGE_LENGTH }}
            </p>
          </footer>
        </template>

        <div
          v-else
          class="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center text-slate-500"
        >
          <i class="pi pi-comments text-4xl text-slate-200" aria-hidden="true" />
          <div>
            <p class="font-semibold text-slate-700">Selecione uma conversa</p>
            <p class="mt-1 text-sm">Escolha uma conversa na lista para continuar o papo.</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
