import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from 'firebase.config'
import { v4 as uuidv4 } from 'uuid'
import Spinner from 'components/Spinner'
import { IListing } from 'utils/SharedUtils'
import { toast } from 'react-toastify'

const CreateListing: React.FC = () => {
  const [geolocationEnabled, setGeolocationEnabled] = useState<boolean>(true)
  const [isLoading, setLoading] = useState<boolean>(false)
  const [files, setFiles] = useState<[]>([])
  const [formData, setFormData] = useState<IListing>({
    type: 'rent',
    name: '',
    bathrooms: 1,
    bedrooms: 1,
    regularPrice: 0,
    discountedPrice: 0,
    furnished: false,
    geolocation: { lat: 0, lng: 0 },
    imageUrls: [],
    location: '',
    offer: false,
    parking: false,
  })

  const {
    type,
    name,
    bathrooms,
    bedrooms,
    regularPrice,
    discountedPrice,
    furnished,
    geolocation,
    imageUrls,
    offer,
    parking,
  } = formData

  let { location } = formData

  const auth = getAuth()
  const navigate = useNavigate()
  const isMounted = useRef<boolean>(true)

  useEffect(() => {
    if (isMounted) {
      onAuthStateChanged(auth, user => {
        if (user) {
          setFormData({ ...formData, userRef: user.uid })
        } else {
          navigate('/sign-in')
        }
      })
    }

    return () => {
      isMounted.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted, auth, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (discountedPrice && discountedPrice >= regularPrice) {
      setLoading(false)
      return toast.error('Discounted price needs to be less than regular price')
    }

    if (imageUrls.length > 6) {
      setLoading(false)
      return toast.error('Max 6 images')
    }

    if (geolocationEnabled) {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${location}&key=${process.env.REACT_APP_GEOLOCATION_KEY}`
      )
      const data = await response.json()

      geolocation.lat = data.results[0]?.geometry.location.lat ?? 0
      geolocation.lng = data.results[0]?.geometry.location.lng ?? 0

      location = data.status === 'ZERO_RESULTS' ? undefined : data.results[0]?.formatted_address

      if (location === undefined || location.includes('undefined')) {
        setLoading(false)
        return toast.error('Please enter a correct address')
      }
    }

    // Store images in firebase
    const storeImage = async (image: File) => {
      return new Promise((resolve, reject) => {
        const storage = getStorage()
        const fileName = `${auth.currentUser?.uid}-${image.name}-${uuidv4()}`

        const storageRef = ref(storage, 'images/' + fileName)
        const uploadTask = uploadBytesResumable(storageRef, image)

        uploadTask.on(
          'state_changed',
          snapshot => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            console.log('Upload is ' + progress + '% done')
            switch (snapshot.state) {
              case 'paused':
                console.log('Upload is paused')
                break
              case 'running':
                console.log('Upload is running')
                break
            }
          },
          error => {
            switch (error.code) {
              case 'storage/unauthorized':
                reject('unauthorized')
                break
              case 'storage/canceled':
                reject('canceled')
                break
              case 'storage/unknown':
                reject('storage not found')
                break
            }
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then(downloadURL => {
              resolve(downloadURL)
            })
          }
        )
      })
    }

    const imgUrls = await Promise.all([...files].map(image => storeImage(image))).catch(error => {
      setLoading(false)
      return toast.error('Images not uploaded')
    })

    console.log(imgUrls)
    console.log(formData)

    const formDataCopy = {
      ...formData,
      imageUrls: imgUrls,
      timestamp: serverTimestamp(),
    }

    console.log(formDataCopy)
    !formDataCopy.offer && delete formDataCopy.discountedPrice

    const docRef = await addDoc(collection(db, 'listings'), formDataCopy)
    setLoading(false)
    toast.success('Listing saved')
    navigate(`/category/${formDataCopy.type}/${docRef.id}`)
  }

  const onMutate = (e: any) => {
    let boolean: null | boolean = null

    if (e.target.value === 'true') {
      boolean = true
    }
    if (e.target.value === 'false') {
      boolean = false
    }

    // Files
    if (e.target.files) {
      setFiles(e.target.files)
    }

    if (!e.target.files) {
      if (e.target.id === 'lat') {
        // Latitude
        setFormData(prevState => ({
          ...prevState,
          geolocation: { lat: e.target.value, lng: geolocation.lng },
        }))
      } else if (e.target.id === 'lng') {
        // Longitude
        setFormData(prevState => ({
          ...prevState,
          geolocation: { lat: geolocation.lat, lng: e.target.value },
        }))
      } else {
        // Text/Booleans/Numbers
        setFormData(prevState => ({
          ...prevState,
          [e.target.id]: boolean ?? e.target.value,
        }))
      }
    }
  }

  if (isLoading) {
    return <Spinner />
  }

  return (
    <div className='profile'>
      <header>
        <p className='pageHeader'>Create a Listing</p>
      </header>

      <main>
        <form onSubmit={handleSubmit}>
          <label className='formLabel'>Sell / Rent</label>
          <div className='formButtons'>
            <button
              type='button'
              className={type === 'sale' ? 'formButtonActive' : 'formButton'}
              id='type'
              value='sale'
              onClick={onMutate}
            >
              Sell
            </button>
            <button
              type='button'
              className={type === 'rent' ? 'formButtonActive' : 'formButton'}
              id='type'
              value='rent'
              onClick={onMutate}
            >
              Rent
            </button>
          </div>

          <label className='formLabel'>Name</label>
          <input
            className='formInputName'
            type='text'
            id='name'
            value={name}
            onChange={onMutate}
            maxLength={32}
            minLength={10}
            required
          />

          <div className='formRooms flex'>
            <div>
              <label className='formLabel'>Bedrooms</label>
              <input
                className='formInputSmall'
                type='number'
                id='bedrooms'
                value={bedrooms}
                onChange={onMutate}
                min='1'
                max='50'
                required
              />
            </div>
            <div>
              <label className='formLabel'>Bathrooms</label>
              <input
                className='formInputSmall'
                type='number'
                id='bathrooms'
                value={bathrooms}
                onChange={onMutate}
                min='1'
                max='50'
                required
              />
            </div>
          </div>

          <label className='formLabel'>Parking spot</label>
          <div className='formButtons'>
            <button
              className={parking ? 'formButtonActive' : 'formButton'}
              type='button'
              id='parking'
              value='true'
              onClick={onMutate}
              // min='1'
              // max='50'
            >
              Yes
            </button>
            <button
              className={!parking && parking !== null ? 'formButtonActive' : 'formButton'}
              type='button'
              id='parking'
              value='false'
              onClick={onMutate}
            >
              No
            </button>
          </div>

          <label className='formLabel'>Furnished</label>
          <div className='formButtons'>
            <button
              className={furnished ? 'formButtonActive' : 'formButton'}
              type='button'
              id='furnished'
              value='true'
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              className={!furnished && furnished !== null ? 'formButtonActive' : 'formButton'}
              type='button'
              id='furnished'
              value='false'
              onClick={onMutate}
            >
              No
            </button>
          </div>

          <label className='formLabel'>Address</label>
          <textarea
            className='formInputAddress'
            id='location'
            value={location}
            onChange={onMutate}
            required
          />

          {!geolocationEnabled && (
            <div className='formLatLng flex'>
              <div>
                <label className='formLabel'>Latitude</label>
                <input
                  className='formInputSmall'
                  type='number'
                  id='lat'
                  value={geolocation.lat}
                  onChange={onMutate}
                  required
                />
              </div>
              <div>
                <label className='formLabel'>Longitude</label>
                <input
                  className='formInputSmall'
                  type='number'
                  id='lng'
                  value={geolocation.lng}
                  onChange={onMutate}
                  required
                />
              </div>
            </div>
          )}

          <label className='formLabel'>Offer</label>
          <div className='formButtons'>
            <button
              className={offer ? 'formButtonActive' : 'formButton'}
              type='button'
              id='offer'
              value='true'
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              className={!offer && offer !== null ? 'formButtonActive' : 'formButton'}
              type='button'
              id='offer'
              value='false'
              onClick={onMutate}
            >
              No
            </button>
          </div>

          <label className='formLabel'>Regular Price</label>
          <div className='formPriceDiv'>
            <input
              className='formInputSmall'
              type='number'
              id='regularPrice'
              value={regularPrice}
              onChange={onMutate}
              min='50'
              max='750000000'
              required
            />
            {type === 'rent' && <p className='formPriceText'>$ / Month</p>}
          </div>

          {offer && (
            <>
              <label className='formLabel'>Discounted Price</label>
              <input
                className='formInputSmall'
                type='number'
                id='discountedPrice'
                value={discountedPrice}
                onChange={onMutate}
                min='50'
                max='750000000'
                required={offer}
              />
            </>
          )}

          <label className='formLabel'>Images</label>
          <p className='imagesInfo'>The first image will be the cover (max 6).</p>
          <input
            className='formInputFile'
            type='file'
            id='imageUrls'
            onChange={onMutate}
            max='6'
            accept='.jpg,.png,.jpeg'
            multiple
            required
          />
          <button type='submit' className='primaryButton createListingButton'>
            Create Listing
          </button>
        </form>
      </main>
    </div>
  )
}

export default CreateListing
