import { defineStore } from 'pinia'

import ChatRealtimeService from '@/domain/chat/ChatRealtimeService'
import ChatService from '@/domain/chat/ChatService'
import type ChatConversationInterface from '@/domain/chat/types/ChatConversationInterface'
import type ChatMessageInterface from '@/domain/chat/types/ChatMessageInterface'
import type ChatSendMessageReqInterface from '@/domain/chat/types/req/ChatSendMessageReqInterface'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'

const CHAT_REALTIME_SERVICE = new ChatRealtimeService()

let messagesRequestId = 0

export const useChatStore = defineStore('chat', {
  state: () => ({
    conversations: [] as ChatConversationInterface[],
    messages: [] as ChatMessageInterface[],
    activeListingId: null as string | null,
    activeContactId: null as string | null,
    conversationsLoading: false,
    messagesLoading: false,
    connected: false,
    socketError: null as string | null,
  }),

  actions: {
    actConnect(): void {
      const authStore = useAuthStore()

      if (!authStore.token || this.connected) return

      CHAT_REALTIME_SERVICE.connect(authStore.token, {
        onConnect: () => {
          this.connected = true
          this.socketError = null
        },
        onDisconnect: () => {
          this.connected = false
        },
        onError: (message: string) => {
          this.socketError = message
        },
        onNewMessage: (message: ChatMessageInterface) => {
          this.actReceiveMessage(message)
        },
      })
    },

    actDisconnect(): void {
      CHAT_REALTIME_SERVICE.disconnect()
      this.connected = false
    },

    actSetActiveConversation(listingId: string | null, contactId: string | null): void {
      this.activeListingId = listingId
      this.activeContactId = contactId

      if (!listingId || !contactId) {
        this.messages = []
        this.messagesLoading = false
      }
    },

    async actFindConversations(): Promise<ChatConversationInterface[]> {
      const CHAT_SERVICE = new ChatService()

      this.conversationsLoading = true

      try {
        const { data } = await CHAT_SERVICE.findConversations()
        this.conversations = data.conversations ?? []
        return this.conversations
      } finally {
        this.conversationsLoading = false
      }
    },

    async actFindMessages(listingId: string, contactId: string): Promise<void> {
      const CHAT_SERVICE = new ChatService()
      const requestId = ++messagesRequestId

      this.messages = []
      this.messagesLoading = true

      try {
        const { data } = await CHAT_SERVICE.findMessages({ listingId, userId: contactId })

        if (
          requestId !== messagesRequestId ||
          this.activeListingId !== listingId ||
          this.activeContactId !== contactId
        )
          return

        const messagesReceivedDuringLoad = this.messages
        const mergedMessages = new Map<string, ChatMessageInterface>()

        for (const message of [...(data.messages ?? []), ...messagesReceivedDuringLoad]) {
          mergedMessages.set(message.id, message)
        }

        this.messages = [...mergedMessages.values()].sort((a, b) =>
          a.createdAt.localeCompare(b.createdAt),
        )
        await this.actMarkActiveConversationAsRead()
      } finally {
        if (requestId === messagesRequestId) this.messagesLoading = false
      }
    },

    actSendMessage(payload: ChatSendMessageReqInterface): void {
      CHAT_REALTIME_SERVICE.sendMessage(payload)
    },

    async actMarkAsRead(messageId: string): Promise<void> {
      const CHAT_SERVICE = new ChatService()
      const { data } = await CHAT_SERVICE.markAsRead(messageId)

      this.actApplyReadMessage(data.message)
    },

    async actMarkActiveConversationAsRead(): Promise<void> {
      const userStore = useUserStore()
      const userId = userStore.user?.id

      if (!userId) return

      const unreadMessages = this.messages.filter(
        (message) => message.receiverId === userId && !message.isRead,
      )

      await Promise.allSettled(unreadMessages.map((message) => this.actMarkAsRead(message.id)))
    },

    actReceiveMessage(message: ChatMessageInterface): void {
      const userStore = useUserStore()
      const userId = userStore.user?.id

      if (!userId) return

      this.actUpsertConversation(message, userId)

      if (!this.actBelongsToActiveConversation(message)) return

      this.actAppendMessage(message)

      if (message.receiverId === userId && !message.isRead) {
        void this.actMarkAsRead(message.id)
      }
    },

    actUpsertConversation(message: ChatMessageInterface, userId: string): void {
      const contact = message.senderId === userId ? message.receiver : message.sender
      const conversation: ChatConversationInterface = {
        id: `${message.listingId}:${contact.id}`,
        listing: message.listing,
        contact,
        lastMessage: message,
      }

      this.conversations = [
        conversation,
        ...this.conversations.filter((item) => item.id !== conversation.id),
      ].sort((a, b) => b.lastMessage.createdAt.localeCompare(a.lastMessage.createdAt))
    },

    actAppendMessage(message: ChatMessageInterface): void {
      if (this.messages.some((item) => item.id === message.id)) return

      this.messages = [...this.messages, message].sort((a, b) =>
        a.createdAt.localeCompare(b.createdAt),
      )
    },

    actApplyReadMessage(message: ChatMessageInterface): void {
      this.messages = this.messages.map((item) =>
        item.id === message.id ? { ...item, isRead: message.isRead } : item,
      )

      this.conversations = this.conversations.map((conversation) =>
        conversation.lastMessage.id === message.id
          ? { ...conversation, lastMessage: message }
          : conversation,
      )
    },

    actBelongsToActiveConversation(message: ChatMessageInterface): boolean {
      if (message.listingId !== this.activeListingId) return false

      return (
        message.senderId === this.activeContactId || message.receiverId === this.activeContactId
      )
    },
  },
})
