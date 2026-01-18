import React, { useState } from 'react'
import styled from 'styled-components'
import Navbar from '../components/Navbar'
import Login from '../components/Login'
import AllProducts from '../components/AllProducts'
import Footer from '../components/Footer'
import Image from '../images/cloth.jpg'
import { mobile , tablet} from "../responsive";
import {useLocation} from "react-router-dom";

// Styling the page
const Container = styled.div``
const WelcomingSlider = styled.div`
background: url(${Image});
background-position: center;
background-size: cover;
background-repeat: no-repeat;
margin-top: 15px;
min-height:30vh;
position:relative;
${mobile({minHeight: "20vh"})};
${tablet({minHeight: "20vh"})};
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
${mobile({fontSize: "30px"})}
${tablet({fontSize: "30px"})}
`
const Title = styled.h1`
font-family: 'Nunito Sans';
font-weight: 700;
font-size: 45px;
letter-spacing: 0.09em;
color: rgb(255, 171, 7);
text-shadow: 1px 1px 1px black ;
margin-left:40px;
${mobile({fontSize: "30px"})}
${tablet({fontSize: "30px"})}
`
const ProductFiltration = styled.div`
margin: 20px;
display:flex;
justify-content: space-between;
${mobile({ margin:"5px", display:"flex", flexDirection:"column"})};
${tablet({ margin:"5px", display:"flex", flexDirection:"column"})};
`
const Filter = styled.div`
margin:20px;
${mobile({margin: "10px"})};
${tablet({margin: "15px"})};

`
const FilterText = styled.span`
font-family: 'Poppins';
font-weight: bold;
font-size: 22px;
line-height: 150%;
text-align: center;
color: black;
${mobile({fontSize: "15px"})};
${tablet({fontSize: "18px"})};
`

const Choose = styled.select`
margin-left:10px;
font-weight: 500;
font-size: 15px;
line-height: 150%;
color: black;
letter-spacing: 0.09em;
text-align: center;
width: auto;
border-radius: 3px;
padding: 6px;
${mobile({fontSize: "13px", padding:"3px"})};
${tablet({fontSize: "12px", padding:"3px"})};
`
const Option = styled.option``
// Getting and setting filter values for each choose (size color and products)
const Products = () => {
  const location = useLocation();
  const cat = location.pathname.split("/")[2];
  const [filters, setFilter] = useState({});
  const [sort, setSort] = useState("newest");
  
  const filterController = (e) =>{
    const value = e.target.value;
    setFilter({
      ...filters,
      [e.target.name]:value,
    });
  };
  
  return (
    <Container>
        <Login/>
        <Navbar/>
        <WelcomingSlider>
            <WelcomingTitle>Nos produit</WelcomingTitle>
        </WelcomingSlider>
        <Title>{cat}</Title>
        <ProductFiltration>
            <Filter>
              <FilterText> Filtrer par:</FilterText>
              <Choose name='color' onChange={filterController}>
                <Option disabled>Color</Option>
                <Option>white</Option>
                <Option>yellow</Option>
                <Option>red</Option>
                <Option>blue</Option>
              </Choose>
              <Choose name='size' onChange={filterController}>
                <Option disabled>Taill</Option>
                <Option>XL</Option>
                <Option>L</Option>
                <Option>S</Option>
                <Option>XS</Option>
              </Choose>
            </Filter>
            <Filter>
              <FilterText>Trier par:</FilterText>
              <Choose  onChange={(e)=> setSort(e.target.value)}>
                <Option value = "newest">Newest</Option>
                <Option value = "ascending">Lower price</Option>
                <Option value = "descending">higher price</Option>
              </Choose>
            </Filter>
        </ProductFiltration>
        <AllProducts cat = {cat} filters = {filters} sort = {sort}/>
        <Footer/>
    </Container>
  )
}

export default Products