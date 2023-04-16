import './App.css'
import { Navbar } from './components/navbar'

import { RenderPage } from './router'



function App() {
  return (
    <div className='container mx-auto text-center'>
      <Navbar />
      <RenderPage/>
    </div>
  )
}

export default App

