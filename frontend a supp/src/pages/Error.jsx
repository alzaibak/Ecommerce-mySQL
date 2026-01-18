import React from 'react'
import styled from 'styled-components'
import Navbar from '../components/Navbar'
import Login from '../components/Login'
import Footer from '../components/Footer'

const Container = styled.div`


`
const WelcomingTitle = styled.h1`
font-family: 'Nunito Sans';
font-weight: 700;
font-size: 35px;
letter-spacing: 0.09em;
color: rgb(255, 171, 7);
text-shadow: 2px 2px 2px black ;
height: 100vh;
width: 100vw;
display: flex;
justify-content: center;
align-items: center;
background-color: whitesmoke;`

const Products = () => {
  return (
    <Container>
        <Login/>
        <Navbar/>
            <WelcomingTitle>Le page demandé non trouvée</WelcomingTitle>
         <Footer/>
    </Container>
  )
}

export default Products