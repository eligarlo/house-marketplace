import { BrowserRouter as Router } from 'react-router-dom'
import Navbar from 'components/layout/Navbar'
import Routes from 'Routes'

const App: React.FC = () => {
  return (
    <>
      <Router>
        <Routes />
        <Navbar />
      </Router>
    </>
  )
}

export default App
