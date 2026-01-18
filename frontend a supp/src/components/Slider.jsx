import React from 'react'
import Styled from 'styled-components'
import 'material-icons/iconfont/material-icons.css';
import ImgSrc from '../images/clothes.jpg';
import { mobile , tablet} from "../responsive";
import {Link} from 'react-router-dom';

const Container = Styled.div`
margin-top: 15px;
width: auto;
height:60vh;
background-image: url(${ImgSrc});
background-size: cover;
background-repeat: no-repeat;
background-position: center;
position: relative;
${mobile({display:"none"})};
${tablet({height:"30vh"})};
`
const SectionCollector = Styled.div`
display: flex;
flex-direction: column;
justify-content: center;
align-items: first baseline;
height: 100%;
margin-left: 5%;
text-align: center;
max-width: 400px;
${tablet({})};
`
const SlideTitle = Styled.h1`
margin: 5px;
max-width: 400px;
font-weight: bold;
font-size: 35px;
letter-spacing: 0.09em;
color: #FFAB07;
mix-blend-mode: darken;
text-shadow: 0px 1px 1px rgba(0, 0, 0, 0.25);
${tablet({fontSize:"25px"})};
`
const SubTitle = Styled.p`
font-style: normal;
font-weight: 400;
font-size: 24px;
letter-spacing: 0.09em;
color: #000000;
margin: 5px;
${tablet({fontSize:"15px"})};

`
const Button = Styled.button`
background: #000000;
border-radius: 9px;
color:#FFFFFF;
cursor: pointer;
font-size: 15px;
padding: 10px 40px;
${tablet({fontSize:"13px"})};
&:hover {
  transform: scale(1.1);
  transition: all ease-in-out 0.2s;
  box-shadow: 2px 2px 2px #FFAB07;
  background-color:#FFAB07;
  ;
}
`
function Slider() {
  return (

<Container>
  <SectionCollector>
    <SlideTitle>Nouveau collection 2020</SlideTitle>
    <SubTitle>vous touvez votre bonheur ici</SubTitle>
    <Link to= {`/products`} style={{color:"inherit", textDecoration:"none"}}>
        <Button> Aller au magasin <span className="material-icons" style={{fontSize : "13px" , verticalAlign: "middle"}}>arrow_forward</span></Button>  
    </Link>
  </SectionCollector>
</Container>

)
}

export default Slider