import React from 'react'
import Navbar from '../components/Navbar'
import Login from '../components/Login'
import Slider from '../components/Slider'
import Categories  from '../components/Categories'
import Newsletter from '../components/Newsletter'
import Footer from '../components/Footer'

const Home = () => {
  return (
    <div>
      <Login/>
      <Navbar/>
      <Slider/>
      <Categories/>
      <Newsletter/>
      <Footer/>

    </div>
  )
}

export default Home