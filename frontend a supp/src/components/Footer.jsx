import React from 'react'
import styled from 'styled-components';
import FacebookOutlinedIcon from '@mui/icons-material/FacebookOutlined';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import { mobile} from "../responsive";


const Container = styled.div`
position: absolute;
min-height: 20vh;
height: auto;
display: flex;
flex-wrap: wrap;
margin-top:40px;
background: #000000;
align-content: center;
justify-content: center;
text-align: center;
width: 100%;
${mobile({marginTop:"10px", flexDirection:"column"})};
`
const LeftDiv = styled.div`
flex:1;
min-width: 200px;
`
const LOGO = styled.h1`
font-family: 'Poppins';
font-style: normal;
font-weight: 800;
font-size: 30px;
line-height: 150%;
text-align: center;
letter-spacing: 0.03em;
color: #FFFFFF;
padding: 10px 0px;
${mobile({padding:"2px"})};

`
const CompanyDescription = styled.div`
font-family: 'Poppins';
font-style: normal;
font-weight: 400;
font-size: 15px;
line-height: 150%;
letter-spacing: 0.03em;
color: #B7B7B7;
padding: 10px 0px;
${mobile({padding:"3px"})};
`
const Icons = styled.div`
display:flex;
color:#FFAB07;
justify-content: center;
${mobile({justifyContent:"space-around"})};
`
const MiddleDiv = styled.div`
flex:1;
min-width: 200px;
`

const MiddleTitle = styled.h1`
font-family: 'Poppins';
font-style: normal;
font-weight: 700;
font-size: 17px;
line-height: 150%;
letter-spacing: 0.03em;
color: #FFFFFF;
padding: 10px 0px;
${mobile({padding:"3px 0px"})};
`
const MiddleList = styled.div`
font-family: 'Poppins';
font-style: normal;
font-weight: 400;
font-size: 15px;
line-height: 150%;
letter-spacing: 0.03em;
color: #B7B7B7;
padding: 10px 0px;
${mobile({padding:"5px 0px"})};

`
const RightDiv = styled.div`
flex:1;
min-width: 200px;
`
const RightTitle = styled.h1`
font-family: 'Poppins';
font-style: normal;
font-weight: 700;
font-size: 17px;
line-height: 150%;
letter-spacing: 0.03em;
color: #FFFFFF;
padding: 10px 0px;
${mobile({padding:"5px 0px"})};

`
const RightList = styled.div`
font-family: 'Poppins';
font-style: normal;
font-weight: 400;
font-size: 15px;
line-height: 150%;
letter-spacing: 0.03em;
color: #B7B7B7;
padding: 10px 0px;
`

const Footer = () => {
  return (
    <Container>
        <LeftDiv>
            <LOGO>LOGO</LOGO>
            <CompanyDescription>Le client est au cœur de notre modèle d'affaires unique, qui inclut le design.</CompanyDescription>
            <Icons>
                <FacebookOutlinedIcon/>
                <InstagramIcon/>
                <TwitterIcon/>
            </Icons>
        </LeftDiv>
        <MiddleDiv>
            <MiddleTitle>ACHATS</MiddleTitle>
            <MiddleList>Vetement</MiddleList>
            <MiddleList>Chaussures</MiddleList>
            <MiddleList>Chaussures</MiddleList>
        </MiddleDiv>
        <RightDiv>
            <RightTitle>INFO</RightTitle>
            <RightList>Nous contacter</RightList>
            <RightList>A propos de nous</RightList>
            <RightList>Methode de payment</RightList>
        </RightDiv>
    </Container>
  )
}

export default Footer