import React from 'react'
import styled from 'styled-components'
import 'material-icons/iconfont/material-icons.css';
import { mobile , tablet} from "../responsive";

const Container = styled.div`
min-height: 40vh;
height: auto;
margin: 10px 7%;
display: flex;
flex-wrap: wrap;
background: rgba(255, 171, 7, 0.49);
border-radius: 16px;
align-content: center;
justify-content: center;
text-align: center;
${mobile({margin:"5px 3%"})};
${tablet({minHeight:"30vh"})};
`

const TitleAndDescription = styled.div`
min-width: 200px;
flex: 1;
`
const Title = styled.div`
font-family: 'Poppins';
font-style: normal;
font-weight: 800;
font-size: 40px;
line-height: 130%;
letter-spacing: 0.03em;
color: #000000;
${mobile({fontSize:"30px"})};
${tablet({fontSize:"30px"})};
`
const Description = styled.div`
font-family: 'Poppins';
font-style: normal;
font-weight: 400;
font-size: 18px;
line-height: 150%;
letter-spacing: 0.03em;
color: #000000;
`
const InputContainer = styled.div`
display:flex;
flex: 1;
min-width: 200px;
justify-content: center;
align-items: center;
padding: 10px 16px;
margin-bottom: 20px;
`
const Input = styled.input`
border: none;
border-radius: 4px;
width: 40%;
height: 44px;
background: rgba(232, 232, 232, 0.74);
flex:8;
outline:none;
`
const Button = styled.button`
height: 44px;
background: #FFAB07;
border-radius: 4px;
flex:1;
cursor: pointer;
        &:hover {
          transform: scale(1.1);
          transition: all ease-in-out 0.2s;
          box-shadow: 1px 1px 1px black;
        }
`
const Newsletter = () => {
  return (
    <Container>
        <TitleAndDescription>
            <Title> Obtenir notre Dernières offres</Title>
            <Description> Abonnez-vous à la newsletter</Description>
        </TitleAndDescription>
        <InputContainer>
          <Input  placeholder='Votre email'/>
          <Button>
          <span className="material-icons-outlined">send</span> 
          </Button>
        </InputContainer>

    </Container>
  )
}
export default Newsletter