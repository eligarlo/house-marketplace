import { useEffect, useState, useRef } from 'react'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

export const useAuthStatus = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
  const [checkingStatus, setCheckingStatus] = useState<boolean>(false)
  const isMounted = useRef<boolean>(true)

  useEffect(() => {
    if (isMounted) {
      const auth = getAuth()
      onAuthStateChanged(auth, user => {
        if (user) {
          setIsLoggedIn(true)
          // check why setIsLoggedIn not updating to true
          console.log('isLoggedIn', isLoggedIn)
        }
        setCheckingStatus(false)
      })
    }

    return () => {
      isMounted.current = false
    }
  }, [isMounted])

  return { isLoggedIn, checkingStatus }
}

export default useAuthStatus
