import type { AxiosPromise } from 'axios'

import AuthRepository from '@/domain/auth/AuthRepository'
import type AuthSigninReqInterface from '@/domain/auth/types/req/AuthSigninReqInterface'
import type { AuthSigninResType } from '@/domain/auth/types/res/AuthSigninResType'
import type AuthSignupReqInterface from '@/domain/auth/types/req/AuthSignupReqInterface'
import type { AuthSignupResType } from '@/domain/auth/types/res/AuthSignupResType'
import type { AuthAmbientType } from '@/domain/auth/types/AuthAmbientType'

export default class AuthService {
  constructor(private _repository: AuthRepository = new AuthRepository()) {}

  signin(
    { email, password }: AuthSigninReqInterface,
    ambient: AuthAmbientType = 'client',
  ): AxiosPromise<AuthSigninResType> {
    return this._repository.signin({ email, password }, ambient)
  }

  signup(data: AuthSignupReqInterface): AxiosPromise<AuthSignupResType> {
    return this._repository.signup(data)
  }
}
