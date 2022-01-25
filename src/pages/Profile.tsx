import { useState, useEffect } from 'react'
import { getAuth, User } from 'firebase/auth'

interface IProfileProps {}

const Profile: React.FC<IProfileProps> = ({}) => {
  const [user, setUser] = useState<User | null>({} as User | null)

  const auth = getAuth()
  useEffect(() => {
    setUser(auth.currentUser)
  }, [])

  return user ? <h1>{user.displayName}</h1> : <h1>Not Logged In</h1>
}

export default Profile
