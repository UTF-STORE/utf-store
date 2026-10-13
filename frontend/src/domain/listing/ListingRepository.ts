import type { AxiosPromise } from 'axios'
import BaseRepository from '@/domain/base/BaseRepository'
import ListingModel from '@/domain/listing/ListingModel'

export default class ListingRepository extends BaseRepository {
  protected _model = new ListingModel()

  findAll(): AxiosPromise {
    return this._httpClient.getBackClient().get(`/${this._model.name}`)
  }

  findOne(id: string): AxiosPromise {
    return this._httpClient.getBackClient().get(`/${this._model.name}/${id}`)
  }

  create(payload: Record<string, unknown>): AxiosPromise {
    return this._httpClient.getBackClient().post(`/${this._model.name}`, payload)
  }

  delete(id: string): AxiosPromise {
    return this._httpClient.getBackClient().delete(`/${this._model.name}/${id}`)
  }
}
