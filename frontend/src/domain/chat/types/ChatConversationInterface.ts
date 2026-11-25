import type ChatListingInterface from '@/domain/chat/types/ChatListingInterface'
import type ChatMessageInterface from '@/domain/chat/types/ChatMessageInterface'
import type ChatUserInterface from '@/domain/chat/types/ChatUserInterface'

export default interface ChatConversationInterface {
  id: string
  listing: ChatListingInterface
  contact: ChatUserInterface
  lastMessage: ChatMessageInterface
}
