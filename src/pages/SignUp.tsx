import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { setDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from 'firebase.config'
import { toast } from 'react-toastify'
import { IUser } from 'utils/SharedUtils'
import { ReactComponent as ArrowRightIcon } from 'assets/svg/keyboardArrowRightIcon.svg'
import visibilityIcon from 'assets/svg/visibilityIcon.svg'

const SignUp: React.FC = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [formData, setFormData] = useState<IUser>({} as IUser)

  const { name, email, password } = formData

  const navigate = useNavigate()

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prevState => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }))
  }

  const toggleShowPassword = () => setShowPassword(prevState => !prevState)

  const handleOnSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (
      name &&
      name.trim() !== '' &&
      email &&
      email.trim() !== '' &&
      password &&
      password.trim() !== ''
    ) {
      try {
        console.log(db)
        const auth = getAuth()

        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        const user = userCredential.user

        if (auth && auth.currentUser) {
          updateProfile(auth.currentUser, {
            displayName: name,
          })
        }

        // Prepare data to persist in database
        const formDataCopy = { ...formData }
        delete formDataCopy.password
        formDataCopy.timeStamp = serverTimestamp()

        await setDoc(doc(db, 'users', user.uid), formDataCopy)

        navigate('/')
      } catch (e) {
        toast.error('Something went wrong with registration')
      }
    }
  }

  return (
    <>
      <div className='pageContainer'>
        <header>
          <p className='pageHeader'>Welcome Back!</p>
        </header>

        <form onSubmit={handleOnSubmit}>
          <input
            type='text'
            className='nameInput'
            placeholder='Name'
            id='name'
            value={name}
            onChange={handleOnChange}
          />

          <input
            type='email'
            className='emailInput'
            placeholder='Email'
            id='email'
            value={email}
            onChange={handleOnChange}
          />

          <div className='passwordInputDiv'>
            <input
              type={showPassword ? 'text' : 'password'}
              className='passwordInput'
              placeholder='Password'
              id='password'
              value={password}
              onChange={handleOnChange}
            />
            <img
              src={visibilityIcon}
              alt='Show Password'
              className='showPassword'
              onClick={toggleShowPassword}
            />
          </div>

          <Link to='/forgot-password' className='forgotPasswordLink'>
            Forgot Password
          </Link>

          <div className='signUpBar'>
            <p className='signUpText'>Sign Up</p>
            <button className='signUpButton'>
              <ArrowRightIcon fill='#ffffff' width='34px' height='34px' />
            </button>
          </div>
        </form>

        {/* Google OAuth */}

        <Link to='/sign-in' className='registerLink'>
          Sign In Instead
        </Link>
      </div>
    </>
  )
}

export default SignUp
