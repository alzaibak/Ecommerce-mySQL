import React ,{ useEffect, useState } from 'react'
import styled from 'styled-components'
import SingleProduct from './SingleProduct'
import axios  from 'axios'

const Container = styled.div`
padding: 20px;
display: flex;
flex-wrap:wrap;
justify-content: space-between;
`
const Text = styled.div`
font-family: 'Nunito Sans';
font-weight: bold;
font-size: 15px;
color: rgb(255,171,7);
text-align: center;
width:100%
}
`
const AllProducts = ({cat,filters,sort}) => {
 //fetching and filtering and sorting all products data using axios
 const [fetchProducts, setProducts] = useState([]);
 const [filteredProducts, setFilteredProducts] = useState(fetchProducts);
 const count = filteredProducts.length;
 // getting products by category using useEffect function
 useEffect(()=>{
    const getProducts = async ()=>{
      try {
        const res = await axios.get(
          cat
          ? `http://localhost:5000/api/products/?category=${cat}`
          : `http://localhost:5000/api/products/`);
            setProducts(res.data);
      } catch (error) {
      }
     
    }
    getProducts();
 },[cat]);

  // filtering products (size and color) by clicking on filters using useEffect function
  useEffect(()=>{
      setFilteredProducts(
        fetchProducts.filter(item=>Object.entries(filters).every(([key,value])=>
        item[key].includes(value)))
      )
  },[fetchProducts, filters]);
  
  

  // sorting products (lower price, higher price, newest) by clicking on filters using useEffect function
  useEffect(()=>{
    if (sort === "newest") {
      setFilteredProducts((previous)=>
      [...previous].sort((a,b)=> a.createdAt - b.createdAt)
      )
    } else if (sort === "ascending") {
      setFilteredProducts((previous)=>
      [...previous].sort((a,b)=> a.price- b.price)
      )
    } else {
      setFilteredProducts((previous)=>
      [...previous].sort((a,b)=> b.price- a.price)
      )
    }
  },[sort]);
  
  return (
    <Container>
      {count !== 0 ? filteredProducts.map((item)=>(
           <SingleProduct item = {item} key ={item._id}/>
        )): <Text>No produit trouvé, veiller chose un autre creter</Text>}
    </Container>
  )
}

export default AllProducts