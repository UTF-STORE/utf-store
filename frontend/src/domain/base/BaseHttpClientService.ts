import axios, { type AxiosInstance, type CreateAxiosDefaults } from 'axios'
import { useAuthStore } from '@/stores/auth'
import type { AuthAmbientType } from '@/domain/auth/types/AuthAmbientType'

export default class BaseHttpClientService {
  protected _store

  constructor() {
    this._store = useAuthStore()
  }

  public getHttpClient(config: CreateAxiosDefaults = {}): AxiosInstance {
    return axios.create(config)
  }

  public getBackClient(ambient: AuthAmbientType = 'client'): AxiosInstance {
    return this.getClient(import.meta.env.VITE_API_URL, this._store.token || '', ambient)
  }

  private getClient(baseURL: string, token: string, ambient: AuthAmbientType): AxiosInstance {
    const config: CreateAxiosDefaults = {
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        ambient,
      },
    }

    const httpClient = this.getHttpClient(config)
    this._store.actVerifyAuthentication(httpClient)
    return httpClient
  }
}
