import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAuth, updateProfile } from 'firebase/auth'
import {
  updateDoc,
  doc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc,
} from 'firebase/firestore'
import { db } from 'firebase.config'
import { toast } from 'react-toastify'
import { IAuthUser, IListing } from 'utils/SharedUtils'
import arrowRight from 'assets/svg/keyboardArrowRightIcon.svg'
import homeIcon from 'assets/svg/homeIcon.svg'
import Spinner from 'components/Spinner'
import ListingItem from 'components/ListingItem'

const Profile: React.FC = () => {
  const auth = getAuth()

  const [listings, setListings] = useState<IListing[]>([] as IListing[])
  const [loading, setLoading] = useState<boolean>(true)
  const [changeDetails, setChangeDetails] = useState<boolean>(false)
  const [formData, setFormData] = useState<IAuthUser>({
    name: auth.currentUser?.displayName == null ? undefined : auth.currentUser?.displayName,
    email: auth.currentUser?.email == null ? undefined : auth.currentUser?.email,
  })

  const { name, email } = formData

  const navigate = useNavigate()

  useEffect(() => {
    const fetchUserListings = async () => {
      const listingsRef = collection(db, 'listings')
      const q = query(
        listingsRef,
        where('userRef', '==', auth.currentUser?.uid),
        orderBy('timestamp', 'desc')
      )

      const querySnap = await getDocs(q)

      let listings = [] as IListing[]

      querySnap.forEach(doc => {
        const data = doc.data() as IListing
        return listings.push({
          id: doc.id,
          ...data,
        })
      })

      setListings(listings)
      setLoading(false)
    }

    fetchUserListings()
  }, [auth.currentUser?.uid])

  const handleOnLogout = (): void => {
    auth.signOut()
    navigate('/')
  }

  const handleOnChangeDetails = (): void => {
    changeDetails && handleOnSubmit()
    setChangeDetails(prevState => !prevState)
  }

  const handleOnSubmit = async (): Promise<void> => {
    try {
      if (auth && auth.currentUser) {
        // Update display name in firebase
        if (auth.currentUser?.displayName !== name) {
          await updateProfile(auth.currentUser, {
            displayName: name,
          })
          // Update in firestore
          const userRef = doc(db, 'users', auth.currentUser.uid)
          await updateDoc(userRef, { name })

          toast.success('Profile updated')
        }
      }
    } catch (error) {
      toast.error('Could not update profile details')
    }
  }

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFormData(prevState => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }))
  }

  const handleOnDelete = async (listingId: string): Promise<void> => {
    if (window.confirm('Are you sure you want to delete?')) {
      setLoading(true)
      const docRef = doc(db, 'listings', listingId)
      await deleteDoc(docRef)

      const updatedListings = listings.filter(listing => listing.id !== listingId)
      setListings(updatedListings)
      setLoading(false)
      toast.success('Successfully deleted listing')
    }
  }

  if (loading) {
    return <Spinner />
  }

  return (
    <div className='profile'>
      <header className='profileHeader'>
        <p className='pageHeader'>My Profile</p>
        <button type='button' className='logOut' onClick={handleOnLogout}>
          Logout
        </button>
      </header>

      <main>
        <div className='profileDetailsHeader'>
          <p className='profileDetailsText'>Personal Details</p>
          <p className='changePersonalDetails' onClick={handleOnChangeDetails}>
            {changeDetails ? 'done' : 'change'}
          </p>
        </div>

        <div className='profileCard'>
          <form>
            <input
              type='text'
              id='name'
              className={!changeDetails ? 'profileName' : 'profileNameActive'}
              disabled={!changeDetails}
              value={name}
              onChange={handleOnChange}
            />
            <input type='email' id='email' className='profileEmail' disabled={true} value={email} />
          </form>
        </div>

        <Link to='/create-listing' className='createListing'>
          <img src={homeIcon} alt='home' />
          <p>Sell or rent your home</p>
          <img src={arrowRight} alt='arrow right' />
        </Link>

        {!loading && listings?.length > 0 && (
          <>
            <p className='listingText'>Your listings</p>
            <ul className='listingsList'>
              {listings.map(listing => (
                <ListingItem key={listing.id} listing={listing} onDelete={handleOnDelete} />
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  )
}

export default Profile
