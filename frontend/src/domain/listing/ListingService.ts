import type { AxiosPromise } from 'axios'
import ListingRepository from '@/domain/listing/ListingRepository'

export default class ListingService {
  constructor(private _repository: ListingRepository = new ListingRepository()) {}

  findAll(): AxiosPromise {
    return this._repository.findAll()
  }

  findOne(id: string): AxiosPromise {
    return this._repository.findOne(id)
  }

  create(payload: Record<string, unknown>): AxiosPromise {
    return this._repository.create(payload)
  }

  delete(id: string): AxiosPromise {
    return this._repository.delete(id)
  }
}
