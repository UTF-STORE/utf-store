import type ChatListingInterface from '@/domain/chat/types/ChatListingInterface'
import type ChatUserInterface from '@/domain/chat/types/ChatUserInterface'

export default interface ChatMessageInterface {
  id: string
  senderId: string
  receiverId: string
  listingId: string
  content: string
  isRead: boolean
  createdAt: string
  sender: ChatUserInterface
  receiver: ChatUserInterface
  listing: ChatListingInterface
}
