
import React from 'react'
import Styled from "styled-components";
import {categories} from '../data'
import { ProductItems } from './ProductItems';
import { mobile } from "../responsive";

const Container = Styled.div`
margin-top:20px;
`
const CategoriesContent = Styled.div`
margin-top:20px;
display:flex;
flex-wrap:wrap;
padding: 20px;
justify-content: space-between;
${mobile({padding:"0px"})};
`
const HeaderTitle = Styled.h1`
font-style: normal;
font-weight: 800;
font-size: 34px;
letter-spacing: 0.18em;
color: #000000;
text-align: center;
width: 100%;
${mobile({display:"none"})};
`

export const Categories = () => {
  return (
    <Container>
      <HeaderTitle>NOS PRODUITES</HeaderTitle>
      <CategoriesContent>{categories.map(item =>(<ProductItems item ={item} key={item.id}/>))}</CategoriesContent>

    </Container>
  )
}

export default Categories

