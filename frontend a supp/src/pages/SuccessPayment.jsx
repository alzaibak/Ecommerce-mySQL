import React, { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom';
import styled from "styled-components";
import Login from '../components/Login';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Image from '../images/cloth.jpg';



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
const WelcomingTitle = styled.p`
font-family: 'Nunito Sans';
font-weight: 700;
font-size: 25px;
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
const Info = styled.h3`
display: flex;
justify-content: center;
align-items: center;
font-family: 'Nunito Sans';
font-weight: 700;
font-size: 19px;
letter-spacing: 0.09em;
margin: 35px;
font-weight: bold;
word-wrap: anywhere;
text-align: center;
background: lightgreen;
box-shadow: 2px 2px 2px black;
min-height: 20vh;
`
const SuccessPayment = () => {
  const [getParams] = useSearchParams();
  const seasonId = getParams.get('session_id');
  console.log(seasonId)
  const navigate = useNavigate();
  useEffect(()=>{
    if (seasonId === null) {
      navigate("/");
    }
  })
  
  return (
    <Container>
      <Login/>
      <Navbar/>
      <WelcomingSlider>
            <WelcomingTitle>merci de votre confiance et à très bientôt</WelcomingTitle>
        </WelcomingSlider>
      <Info>votre command est bien confirmer, vous allez recevoir votre recu dans les 24 heures dans votre boit mail</Info>
      <Footer/>
    </Container>

  )
}

export default SuccessPayment