import { io, type Socket } from 'socket.io-client'

import type ChatMessageInterface from '@/domain/chat/types/ChatMessageInterface'
import type ChatSendMessageReqInterface from '@/domain/chat/types/req/ChatSendMessageReqInterface'

export interface ChatRealtimeHandlers {
  onConnect: () => void
  onDisconnect: () => void
  onError: (message: string) => void
  onNewMessage: (message: ChatMessageInterface) => void
}

interface ChatNewMessagePayload {
  message: ChatMessageInterface
}

interface ChatSocketErrorPayload {
  message?: string
}

const DEFAULT_SOCKET_ERROR = 'Não foi possível manter a conexão em tempo real.'

export default class ChatRealtimeService {
  private _socket: Socket | null = null

  public connect(token: string, handlers: ChatRealtimeHandlers): void {
    this.disconnect()

    const socket = io(this.getNamespaceUrl(), {
      auth: { token },
      transports: ['websocket', 'polling'],
    })

    socket.on('connect', handlers.onConnect)
    socket.on('disconnect', handlers.onDisconnect)
    socket.on('connect_error', (error: Error) => handlers.onError(error.message))
    socket.on('chat:error', (error: ChatSocketErrorPayload) =>
      handlers.onError(error.message ?? DEFAULT_SOCKET_ERROR),
    )
    socket.on('message:new', ({ message }: ChatNewMessagePayload) => handlers.onNewMessage(message))

    this._socket = socket
  }

  public disconnect(): void {
    this._socket?.disconnect()
    this._socket = null
  }

  public sendMessage({ receiverId, listingId, content }: ChatSendMessageReqInterface): void {
    if (!this._socket?.connected) {
      throw new Error('Chat em tempo real desconectado. Aguarde a reconexão.')
    }

    this._socket.emit('message:send', { receiverId, listingId, content })
  }

  private getNamespaceUrl(): string {
    const socketUrl = import.meta.env.VITE_SOCKET_URL as string | undefined

    if (socketUrl) return socketUrl.replace(/\/+$/, '')

    const apiUrl = import.meta.env.VITE_API_URL as string | undefined

    if (!apiUrl || apiUrl.startsWith('/')) return `${window.location.origin}/chat`

    return `${apiUrl.replace(/\/+$/, '')}/chat`
  }
}
