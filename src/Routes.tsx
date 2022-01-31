import { useRoutes } from 'react-router-dom'
import Explore from 'pages/Explore'
import Offers from 'pages/Offers'
import Category from 'pages/Category'
import Profile from 'pages/Profile'
import SignIn from 'pages/SignIn'
import SignUp from 'pages/SignUp'
import ForgotPassword from 'pages/ForgotPassword'
import PrivateRoute from 'components/PrivateRoute'

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
      path: '/category/:categoryName',
      element: <Category />,
    },
    {
      path: '/profile',
      element: <PrivateRoute />,
      children: [{ path: '/profile', element: <Profile /> }],
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
