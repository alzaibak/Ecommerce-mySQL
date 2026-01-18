import React from 'react'
import styled from 'styled-components'
import 'material-icons/iconfont/material-icons.css';
import {Link} from 'react-router-dom';

const Container = styled.div`
flex: 1;
margin: 5px;
min-width: 350px;
max-width: 100vw;
height: 350px;
display: flex;
justify-content: center;
align-items: center;
position: relative;
`

const Image = styled.img`
height: 75%;

`

const Info = styled.div`
height: 100%;
width: 100%;
position: absolute;
left: 0;
top: 0;
background-color: rgba(0,0,0,0.2);
display: flex;
justify-content: center;
align-items: center;
opacity: 0;
border-radius: 15px;


    &:hover {
        opacity: 1;
        cursor: pointer;
        transition: all ease-in-out 0.4s;
    }
`
const Icon = styled.div`
width: 40px;
height: 40px;
background-color: white;
border-radius: 50%;
display: flex;
justify-content: center;
align-items: center;
margin: 0px 6px;

    &:hover {
        background-color: #F5F5F5;
        cursor: pointer;
        transform: scale(1.2);
        transition: all ease-in-out 0.2s;
    }
`

const TitleAndPrice = styled.div`
position: absolute;
left: 0;
bottom: 0;
display: ruby-base;
width: 100%;
text-align: center;
`
const Price = styled.div`
font-family: 'Playfair Display';
font-style: normal;
font-weight: 500;
font-size: 18px;
color: #383838;

`
const Buy = styled.div`
font-family: 'Poppins';
font-style: normal;
font-weight: 500;
font-size: 18px;
line-height: 150%;
color: #FFAB07;
font-weight: bold;
cursor: pointer;

    &:hover {
    transform: scale(1.1);
    transition: all ease-in-out 0.2s;
    }

`
const SingleProduct = ({item}) => {
    
  return (
    <Container>
            <Image src={item.img}/>
            <Info>
                <Icon>
                <Link to= {`/cart`} style={{color:"inherit", textDecoration:"none"}}>
                    <span className="material-icons-outlined">shopping_cart</span>
                    </Link>
                </Icon>
                <Link to= {`/product/${item._id}`} style={{color:"inherit", textDecoration:"none"}}>
                    <Icon >
                        <span className="material-icons-outlined">search</span>
                    </Icon>
                </Link>
                <Icon>
                <span className="material-icons-outlined">favorite_border</span>
                </Icon>
            </Info>

            <TitleAndPrice>
               <Price >{item.title}<br /> <b> €{item.price}</b></Price>
               <Link to= {`/product/${item._id}`} style={{color:"inherit", textDecoration:"none"}}>
               <Buy><span  className="material-icons-outlined" style={{fontSize:'14px'}}>add</span>Acheter maintenant</Buy>
               </Link>
            </TitleAndPrice>
    </Container>
  )
}

export default SingleProduct