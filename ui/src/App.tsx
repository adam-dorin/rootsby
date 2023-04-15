import './App.css'
import { Navbar } from './components/navbar'

import { RenderPage } from './router'



function App() {
  return (
    <>
      <Navbar />
      <RenderPage/>
    </>
  )
}

export default App

