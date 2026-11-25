import type { AxiosPromise } from 'axios'

import ChatRepository from '@/domain/chat/ChatRepository'
import type ChatFindMessagesReqInterface from '@/domain/chat/types/req/ChatFindMessagesReqInterface'
import type ChatConversationsResInterface from '@/domain/chat/types/res/ChatConversationsResInterface'
import type ChatMessageResInterface from '@/domain/chat/types/res/ChatMessageResInterface'
import type ChatMessagesResInterface from '@/domain/chat/types/res/ChatMessagesResInterface'

export default class ChatService {
  constructor(private _repository: ChatRepository = new ChatRepository()) {}

  findConversations(): AxiosPromise<ChatConversationsResInterface> {
    return this._repository.findConversations()
  }

  findMessages(params: ChatFindMessagesReqInterface): AxiosPromise<ChatMessagesResInterface> {
    return this._repository.findMessages(params)
  }

  markAsRead(messageId: string): AxiosPromise<ChatMessageResInterface> {
    return this._repository.markAsRead(messageId)
  }
}
