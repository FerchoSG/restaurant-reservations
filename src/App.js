import React from 'react'
import './styles/App.css'
import './styles/responsive.css'
import {AuthProvider} from './context/AuthContext'
import Routes from './Routes'

function App() {

  return (
    <AuthProvider>
      <div className="App">
        <Routes/>
      </div>
    </AuthProvider>
  )
}

export default App