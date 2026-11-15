import axios from 'axios'

export default function getAuthErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) return 'Erro desconhecido. Tente novamente.'

  const message = error.response?.data?.message

  if (Array.isArray(message)) return message.join(' ')
  if (typeof message !== 'string' || !message) return 'Erro desconhecido. Tente novamente.'
  if (message === 'Invalid Credentials') return 'E-mail ou senha incorretos.'
  if (message === 'This email is a already in use') return 'Este e-mail já está cadastrado.'

  return message
}
