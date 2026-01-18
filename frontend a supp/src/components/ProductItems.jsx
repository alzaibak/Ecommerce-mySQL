import React from 'react'
import Styled from "styled-components";
import { mobile } from "../responsive";
import { Link } from "react-router-dom";

const Container = Styled.div`
flex:1;
min-width: 250px;
max-width: 100vw;
display: flex;
margin:10px;
position: relative;
max-height:50vh;
`

const Img = Styled.img`
width: 100%;
height:100%;
border-radius: 20px;
object-fit:cover;
opacity: 0.75;
${mobile({height:"30vh"})};
`
const Info = Styled.div`
position: absolute;
top: 0;
left: 0;
justify-content: center;
height: 100%;
width: 100%;
align-items: center;
display: flex;
flex-direction: column;
`
const Title = Styled.h1`
font-weight: 700;
font-size: 29px;
letter-spacing: 1px;
font-family: 'Poppins';
margin-bottom: 5px;
color: #000000;

`
const Button = Styled.div`
background: #000000;
border-radius: 8px;
font-family: 'Poppins';
font-style: normal;
font-weight: 500;
font-size: 15px;
line-height: 150%;
letter-spacing: 1px;
color: #FFFFFF;
padding:8px 15px;
cursor: pointer;
`

export const ProductItems = ({item}) => {
  return (
    <Container>
      <Link to ={`/products/${item.cat}`} style={{width: "100%"}}>
      <Img src={item.image}/>
      <Info>
        <Title>{item.title}</Title>
        <Button>obtenir maintenant</Button>
      </Info>
      </Link>
    </Container>
  )
}
