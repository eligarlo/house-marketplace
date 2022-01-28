import { FieldValue } from 'firebase/firestore'

export interface IUser {
  email: string
  password?: string | undefined
  name: string
  timeStamp?: FieldValue
}

export interface IAuthUser {
  name: string | undefined
  email: string | undefined
}
