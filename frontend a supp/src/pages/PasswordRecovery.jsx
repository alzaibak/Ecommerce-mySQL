import React from 'react'
import styled from "styled-components";
import { mobile ,tablet} from "../responsive";

const Container = styled.div`
height: 100vh;
width: 100vw;
background: linear-gradient(
    rgba(255,255,255,0.5),
    rgba(255,255,255,0.5)
), azure;
display:flex;
flex-wrap:wrap;
justify-content: center;
align-items: center;
`
const Section = styled.div`
width: 50%;
padding: 20px;
Background:white;
border-radius: 15px;
box-shadow: 2px 2px 2px 2px black;
${mobile({width: "70%"})};
${tablet({width: "70%"})};
`
const Title = styled.h1`
font-family: 'Nunito Sans';
font-style: normal;
font-weight: 700;
font-size: 25px;
line-height: 151%;
mix-blend-mode: darken;
text-align: center;
`
const Form = styled.div`
display:flex;
flex-direction:column;
`
const Input = styled.input`
flex:1;
min-width:40%;
margin:5px;
padding:5px;
background: #FFFFFF;
border: 1px solid #BCBAAE;
border-radius: 11px;
font-family: 'Abel';
font-weight: 400;
font-size: 15px;
line-height: 28px;
color: black;

`

const Button = styled.button`
width: 40%;
padding: 7px 15px;
margin:5px;
font-size: 20px;
background: rgba(255, 171, 7, 0.78);
border: 1px solid #FFBD5B;
border-radius: 7px;
transition: all ease-in-out 0.2s;
cursor: pointer;
  &:hover{
        transform: scale(1.1);
        box-shadow: 2px 2px 2px black;
  }

  ${mobile({width: "50%"})};
`

const Login = () => {
  return (
    <Container>
        <Section>
            <Title>Mot de passe oublié ?</Title>
            <Form>
                <Input placeholder='Email' type="email"></Input>
                <Input placeholder='email confirmation' type="email"></Input>
                <Button>Soumettre</Button>
            </Form>
        </Section>
    </Container>
  )
}

export default Login