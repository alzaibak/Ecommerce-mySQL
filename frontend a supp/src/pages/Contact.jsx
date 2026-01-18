import React from 'react'
import styled from 'styled-components'
import Navbar from '../components/Navbar'
import Login from '../components/Login'
import Newsletter from '../components/Newsletter'
import Footer from '../components/Footer'
import Contact from '../components/ContactForm'
import Image from '../images/cloth.jpg'

const Container = styled.div`


`
const WelcomingSlider = styled.div`
background: url(${Image});
background-position: center;
background-size: cover;
background-repeat: no-repeat;
margin-top: 15px;
min-height:40vh;
position:relative;
`
const WelcomingTitle = styled.h1`
font-family: 'Nunito Sans';
font-weight: 700;
font-size: 45px;
line-height: 151%;
letter-spacing: 0.09em;
color: rgb(255, 171, 7);
text-shadow: 2px 2px 2px black ;
height: 100%;
width: 100%;
position: absolute;
display: flex;
justify-content: center;
align-items: center;
margin:0px;
background-color: rgba(0.1,0.1,0.1,0.4);
`

const Products = () => {
  return (
    <Container>
        <Login/>
        <Navbar/>
        <WelcomingSlider>
            <WelcomingTitle>Nos contacter</WelcomingTitle>
        </WelcomingSlider>
        <Contact/>
        <Newsletter/>
        <Footer/>
    </Container>
  )
}

export default Products