import type { AxiosPromise } from 'axios'
import BaseRepository from '@/domain/base/BaseRepository'
import UserModel from '@/domain/user/UserModel'
import type UserMeResInterface from '@/domain/user/types/res/UserMeResInterface'
import type UserFindAllResInterface from '@/domain/user/types/res/UserFindAllResInterface'
import type UserUpdateMeReqInterface from '@/domain/user/types/req/UserUpdateMeReqInterface'

export type FindAllResponse = {
  data: UserFindAllResInterface[]
}

export default class UserRepository extends BaseRepository {
  protected _model = new UserModel()

  me(): AxiosPromise<UserMeResInterface> {
    return this._httpClient.getBackClient().get(`/${this._model.name}/me`)
  }

  updateMe(payload: UserUpdateMeReqInterface): AxiosPromise<UserMeResInterface> {
    return this._httpClient.getBackClient().patch(`/${this._model.name}/me`, payload)
  }

  updateAvatar(image: File): AxiosPromise<UserMeResInterface> {
    const formData = new FormData()
    formData.append('image', image)

    return this._httpClient.getBackClient().post(`/${this._model.name}/me/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  }

  findAll(): AxiosPromise<FindAllResponse> {
    return this._httpClient.getBackClient().get(`/${this._model.name}`)
  }

  delete(id: string): AxiosPromise {
    return this._httpClient.getBackClient().delete(`/${this._model.name}/${id}`)
  }
}
