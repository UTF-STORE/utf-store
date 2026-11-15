import type { AxiosPromise } from 'axios'

import UserRepository, { type FindAllResponse } from '@/domain/user/UserRepository'
import type UserMeResInterface from '@/domain/user/types/res/UserMeResInterface'
import type UserUpdateMeReqInterface from '@/domain/user/types/req/UserUpdateMeReqInterface'

export default class UserService {
  constructor(private _repository: UserRepository = new UserRepository()) {}

  me(): AxiosPromise<UserMeResInterface> {
    return this._repository.me()
  }

  updateMe(payload: UserUpdateMeReqInterface): AxiosPromise<UserMeResInterface> {
    return this._repository.updateMe(payload)
  }

  updateAvatar(image: File): AxiosPromise<UserMeResInterface> {
    return this._repository.updateAvatar(image)
  }

  findAll(): AxiosPromise<FindAllResponse> {
    return this._repository.findAll()
  }

  delete(id: string): AxiosPromise {
    return this._repository.delete(id)
  }
}
