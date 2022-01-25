import { BrowserRouter as Router } from 'react-router-dom'
import Navbar from 'components/layout/Navbar'
import Routes from 'Routes'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const App: React.FC = () => {
  return (
    <>
      <Router>
        <Routes />
        <Navbar />
      </Router>
      <ToastContainer />
    </>
  )
}

export default App
