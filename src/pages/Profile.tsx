import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAuth, updateProfile } from 'firebase/auth'
import { updateDoc, doc } from 'firebase/firestore'
import { db } from 'firebase.config'
import { toast } from 'react-toastify'
import { IAuthUser } from 'utils/SharedUtils'

const Profile: React.FC = () => {
  const auth = getAuth()

  const [changeDetails, setChangeDetails] = useState<boolean>(false)
  const [formData, setFormData] = useState<IAuthUser>({
    name: auth.currentUser?.displayName == null ? undefined : auth.currentUser?.displayName,
    email: auth.currentUser?.email == null ? undefined : auth.currentUser?.email,
  })

  const { name, email } = formData

  const navigate = useNavigate()

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
      </main>
    </div>
  )
}

export default Profile
