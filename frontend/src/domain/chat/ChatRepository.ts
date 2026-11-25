import type { AxiosPromise } from 'axios'

import BaseRepository from '@/domain/base/BaseRepository'
import ChatModel from '@/domain/chat/ChatModel'
import type ChatFindMessagesReqInterface from '@/domain/chat/types/req/ChatFindMessagesReqInterface'
import type ChatConversationsResInterface from '@/domain/chat/types/res/ChatConversationsResInterface'
import type ChatMessageResInterface from '@/domain/chat/types/res/ChatMessageResInterface'
import type ChatMessagesResInterface from '@/domain/chat/types/res/ChatMessagesResInterface'

export default class ChatRepository extends BaseRepository {
  protected _model = new ChatModel()

  findConversations(): AxiosPromise<ChatConversationsResInterface> {
    return this._httpClient.getBackClient().get(`/${this._model.name}/conversations`)
  }

  findMessages({
    listingId,
    userId,
  }: ChatFindMessagesReqInterface): AxiosPromise<ChatMessagesResInterface> {
    return this._httpClient.getBackClient().get(`/${this._model.name}/messages`, {
      params: { listingId, userId },
    })
  }

  markAsRead(messageId: string): AxiosPromise<ChatMessageResInterface> {
    return this._httpClient.getBackClient().patch(`/${this._model.name}/messages/${messageId}/read`)
  }
}
