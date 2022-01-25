import { FieldValue } from 'firebase/firestore'

export interface ISignInForm {
  email: string
  password: string | undefined
}

export interface ISignUpForm extends ISignInForm {
  name: string
  timeStamp: FieldValue
}
