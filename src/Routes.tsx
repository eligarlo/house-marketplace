import { useRoutes } from 'react-router-dom'
import Explore from 'pages/Explore'
import Offers from 'pages/Offers'
import Profile from 'pages/Profile'
import SignIn from 'pages/SignIn'
import SignUp from 'pages/SignUp'
import ForgotPassword from 'pages/ForgotPassword'

const Routes: React.FC = () => {
  const routes = useRoutes([
    {
      path: '/',
      element: <Explore />,
    },
    {
      path: '/offers',
      element: <Offers />,
    },
    {
      path: '/profile',
      element: <Profile />,
    },
    {
      path: '/sign-in',
      element: <SignIn />,
    },
    {
      path: '/sign-up',
      element: <SignUp />,
    },
    {
      path: '/forgot-password',
      element: <ForgotPassword />,
    },
  ])

  return routes
}

export default Routes
