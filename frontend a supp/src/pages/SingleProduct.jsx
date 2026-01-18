import React ,{ useEffect, useState } from 'react'
import styled from 'styled-components'
import Navbar from '../components/Navbar'
import Login from '../components/Login'
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Newsletter from '../components/Newsletter'
import Footer from '../components/Footer'
import { mobile ,tablet} from "../responsive";
import {useLocation} from 'react-router-dom';
import {publicURL} from '../siteURL';
import  {addingProduct, clearCart}  from "../Redux/cartRedux";
import { useDispatch , useSelector} from 'react-redux';



const Container = styled.div`
`
const SingleProductSection = styled.div`
margin: 20px;
display:flex;
flex-wrap: wrap;
${mobile({flexDirection: "column", padding:"0px"})};
`
const ImageSection = styled.div`
flex:1;
`
const Image = styled.img`
width:100%;
max-width: 100vw;
height:60vh;
object-fit:cover;
border-radius: 10px;
${mobile({width: "95vw", height:"40vh"})};
${tablet({width: "95vw", height:"40vh"})};

`
const InfoSection = styled.div`
width: 100%;
flex:1;
margin: 0px 25px;
${mobile({margin: " 0px"})};

`
const Title = styled.h1`
font-family: 'Nunito Sans';
font-style: normal;
font-weight: 700;
font-size: 35px;
line-height: 151%;
mix-blend-mode: darken;
text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
${mobile({fontSize: " 25px"})};

`
const Description = styled.p`
font-family: 'Poppins';
font-style: normal;
font-weight: 400;
font-size: 20px;
line-height: 150%;
color: rgba(0, 0, 0, 0.73);
`

const Price = styled.div`
margin: 8px 0px;
font-size: 35px;
`

const FilterSection = styled.div`
width:50%;
margin:11px 0px;
display:flex;
justify-content:space-between;
${mobile({width: " 100%"})};
`
const Filter = styled.div`
display:flex;
`
const FilterTitle = styled.span`
font-size:17px;
font-weight: 200;
font-size: 20px;
padding-right:5px;
`
const FilterColorOption = styled.div`
Width:22px;
height:22px;
border-radius:50%;
background-color: ${props=>props.color};
margin: 0px 5px;
cursor: pointer;
`
const FilterSize = styled.select`
padding: 2px 10px;
margin-left: 11px;
background-color: aliceblue;
border-radius: 5px;
cursor: pointer;
font-size: 15px;
transition: all ease-in-out 0.5s;
`
const FilterSizeOption = styled.option`

`
const AmountControllingSection = styled.div`
font-weight: 700;
display: flex;
align-items: center;
width: 50%;
font-size: 20px;
cursor: pointer;
width:100%;
`
const InitialAmount = styled.div`
width: 30px;
height:30px;
border-radius:10px;
border: 4px solid #FFBD5B;
display: flex;
margin: 0px 3px;
padding:5px;
justify-content: center;
align-content: center;
`

const Button = styled.button`
padding: 7px 15px;
margin-left:12px;
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
`
const ErrorMessage = styled.span`
color:red;
display: none;
font-weight:bold;
margin-bottom: 7px;
`
const SingleProduct = () => {
  const location = useLocation();
  const productID = location.pathname.split("/")[2];
  const [product, setProduct]= useState({});
  const [quantity, setQuantity]= useState(1);
  const [color, setColor]= useState("");
  const [size, setSize]= useState("");
  const dispatch = useDispatch();

  useEffect(()=>{
    const getProduct = async ()=>{
      try {
        const res = await publicURL.get("/products/find/"+productID);
        setProduct(res.data);
      } catch (error) {
      }
    }
    getProduct();
  },[productID]);

const quantityController = (type)=>{
      if (type==="descending") {
        quantity >1 && setQuantity(quantity-1);
      } else {
        setQuantity(quantity+1);
      }
    }

const productAddingToCart = ()=>{
  if( color ==="" || size ===""){
    document.getElementById('ErrorMessage').style.display="block";
  }else{
    document.getElementById('ErrorMessage').style.display="none";
    dispatch(addingProduct({...product, quantity, color, size}));
    //dispatch(clearCart())
  }

};

  return (
    <Container>
      <Login/>
      <Navbar/>
      <SingleProductSection>
        <ImageSection>
          <Image src={product.img}/>
        </ImageSection>
        <InfoSection>
          <Title> {product.title}</Title>
          <Description>{product.dec}</Description>
          <Price>$ {product.price}</Price>
          <FilterSection>
            <Filter>
              <FilterTitle>Couleur </FilterTitle>
              {product.color?.map((c)=>(
                <FilterColorOption color={c} key={c} onClick= {()=>setColor(c)}/>
               ))}
            </Filter>
            <Filter>
              <FilterTitle>Taille</FilterTitle>
              <FilterSize onClick={(e)=>setSize(e.target.value)}>
                {product.size?.map((t)=>(
                <FilterSizeOption key={t}>{t}</FilterSizeOption>
                ))}
              </FilterSize>
            </Filter>
          </FilterSection>
          <ErrorMessage id='ErrorMessage'>Veiller chossier la color et la taill</ErrorMessage>
          <AmountControllingSection>
            <RemoveIcon onClick ={()=>quantityController("descending")}/>
            <InitialAmount>{quantity}</InitialAmount>
            <AddIcon onClick= {()=>quantityController("ascending")}/>
            <Button onClick={productAddingToCart}>Ajouter au cart</Button>
          </AmountControllingSection>
        </InfoSection>
      </SingleProductSection>
      <Newsletter/>
      <Footer/>
    </Container>
  )
}

export default SingleProduct