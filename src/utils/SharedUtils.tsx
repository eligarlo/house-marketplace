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

export interface IListing {
  id?: string
  userRef?: string
  bathrooms: number
  bedrooms: number
  regularPrice: number
  discountedPrice: number | undefined
  furnished: boolean
  geolocation: IGeolocation
  imageUrls: string[]
  location: string | undefined
  name: string
  offer: boolean
  parking: boolean
  timestamp?: FieldValue
  type: string
}

export interface IGeolocation {
  lat: number | any
  lng: number | any
}

export interface IImageUpload {
  name: string
}
