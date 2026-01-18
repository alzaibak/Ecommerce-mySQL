
import React, { useEffect, useState } from 'react'
import Styled from "styled-components";
import { ProductItems } from './ProductItems';
import { mobile } from "../responsive";
import { publicURL } from "../siteURL";

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
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const catRes = await publicURL.get("/categories");
        setCategories(catRes.data);
        
        // Fetch all products
        const prodRes = await publicURL.get("/products");
        setProducts(prodRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Group products by category
  const getProductsByCategory = (categoryName) => {
    return products.filter(product => {
      if (!product.categories) return false;
      const cats = Array.isArray(product.categories) 
        ? product.categories 
        : JSON.parse(product.categories || "[]");
      return cats.includes(categoryName);
    });
  };

  if (loading) {
    return <Container><HeaderTitle>NOS PRODUITES</HeaderTitle><div>Loading...</div></Container>;
  }

  return (
    <Container>
      <HeaderTitle>NOS PRODUITES</HeaderTitle>
      <CategoriesContent>
        {categories.map(category => {
          const categoryProducts = getProductsByCategory(category.name);
          if (categoryProducts.length === 0) return null;
          
          return (
            <ProductItems 
              item={{
                id: category.id,
                title: category.name,
                img: categoryProducts[0]?.img || "",
                cat: category.name
              }} 
              key={category.id}
            />
          );
        })}
      </CategoriesContent>
    </Container>
  )
}

export default Categories

