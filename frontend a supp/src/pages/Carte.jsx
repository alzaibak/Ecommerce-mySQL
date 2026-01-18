import styled from 'styled-components';
import Login from '../components/Login';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Delete from '@mui/icons-material/Delete';
import { mobile , tablet} from "../responsive";
import { useSelector } from 'react-redux';
import { clearCart, deletingProduct, decreasingQuantity, increasingQuantity} from "../Redux/cartRedux";
import { useDispatch } from 'react-redux';
import {Link} from 'react-router-dom';
import PayButton from '../components/PayButton';

 

const Container = styled.div``

const Wrapper = styled.div`
min-height:50vh;
padding: 20px;

`
const Title = styled.h1`
font-weight:300;
text-align: center;
`
const TopSection = styled.div`
padding-top-20px;
display: flex;
justify-items: center;
justify-content:space-between;
${mobile({justifyContent: "space-around"})};
`
const TopButton = styled.button`
padding:10px;
cursor: pointer;
font-weight:600;
border-radius:5px;
cursor: pointer;
border: ${props=>props.type === "filled" && "none"};
background: ${props=>props.type === "filled" ? "black": "transparent"};
color: ${props=>props.type === "filled" &&  "white"};
`

const TopTexts = styled.div`
${mobile({display: "none"})};
`
const TopText = styled.span`
text-decoration: underline;
font-weight: 500;
cursor: pointer;
margin: 0px 10px;
${tablet({display: "flex", flexDirection: "column"})};
`
const BottomSection = styled.div`
display:flex;
flex-wrap:wrap;
justify-content: space-between;
margin-top: 20px;
${mobile({flexDirection:"column"})};
${tablet({flexDirection:"column"})};
`
const ProductInfo = styled.div`
display:flex;
flex:3;
flex-direction:column;
`

const ProductDetails = styled.div`
flex:3;
display:flex;
flex-wrap:wrap;

`
const ProductSummery = styled.div`
flex: 1;
border:0.5px solid lightgrey;
border-radius:10px;
padding:20px;
height: max-content;
`
const Image = styled.img`
width: 200px;
${mobile({fontSize: "13px", padding:"3px", width: "150px"})};
`
const Details = styled.div`
flex:1;
display:flex;
padding:20px;
flex-direction: column;
justify-content: space-around;
min-width: 130px;
`
const ProductName = styled.div`
`
const ProductId = styled.span`
`
const ProductColor = styled.div`
width:20px;
height: 20px;
border-radius:50%;
background-color: ${(props)=> props.color};
`
const ProductSize = styled.span`
`
const ProductPriceSection = styled.div`
flex:1;
display: flex;
justify-content: center;
align-items: center;
flex-direction:column;
align-items: flex-start;
${mobile({alignItems: "center"})};
`

const ProductAmountContainer = styled.div`
display:flex;
align-items:Centre;
cursor: pointer;

`
const ProductAmount = styled.div`
text-align: center;
font-size: 24px;
width: 30px;
height:30px;
border-radius:10px;
border: 2px solid #FFBD5B;
${mobile({margin: "0px 8px"})};

`
const ProductPrice = styled.div`
font-size: 30px;
font-weight:200;
margin-top:20px;
`
const SeparatingLine = styled.h1`
background-color:#eee;
border:none;
height:2px;
`
const SummerTitle = styled.h1`
text-align:centre;
`
const SummerItem = styled.div`
margin: 30px 0px;
display:flex;
justify-content:space-between;
font-weight: ${props=> props.type === "total" && "600"};
font-size: ${props=> props.type === "total" && "24px"};
`
const SummeryItemTitle = styled.span`
`
const SummeryItemPrice = styled.span`
`
const EmptyCartText = styled.div`
padding:15px 10px;
font-size: 17px;
font-weight: bold;
letter-spacing: 1px;
color: rgb(255, 171, 7);
font-weight: bold;
`
const ProductDelete = styled.span`
opacity: 0.5;
display: flex;
align-content: center;
cursor: pointer;

&:hover{
opacity: 0.8;
transition: ease-in-out 0.3s;
}
`



const Carte = () => {
    const cart = useSelector(state=>state.cart);
    const cartQuantity = cart.quantity;

    const dispatch = useDispatch();

    const quantityIncreasing = (product)=>{
            dispatch(increasingQuantity(product));
          }
    const quantityDecreasing = (product)=>{
            dispatch(decreasingQuantity(product));
    }
    const clearAllProd = ()=>{
    dispatch(clearCart());
    }
    const DeletSingle = (products)=>{
        dispatch(deletingProduct(products));
        }

    return (
    <Container>
        <Login/>
        <Navbar/>
        <Wrapper>
            <Title>Your bag</Title>
            <TopSection>
            <Link to= {`/products`} style={{color:"inherit", textDecoration:"none"}}>
                <TopButton>Continue shopping</TopButton>
             </Link>
                <TopTexts>
                   <TopText>Shopping bag ({cart.quantity})</TopText>
                    <TopText onClick ={()=>clearAllProd()}>Vider votre panier</TopText>
                </TopTexts>
            </TopSection>
            <BottomSection>
                <ProductInfo>
                    {cartQuantity !== 0 ? cart.products.map(product=>(
                    <ProductDetails>
                    <Link to= {`/product/${product._id}`} style={{color:"inherit", textDecoration:"none"}}>
                        <Image src={product.img}/>
                    </Link>
                        <Details>
                            <ProductName><b>Produit:</b> {product.title}</ProductName>
                            <ProductId><b>ID:</b> {product._id}</ProductId>
                            <ProductColor color={product.color}/>
                            <ProductSize><b>Size:</b> {product.size}</ProductSize>
                            <ProductDelete onClick ={()=>DeletSingle(product)}><Delete/>remove</ProductDelete>
                        </Details>
                        <ProductPriceSection >
                            <ProductAmountContainer>
                                <AddIcon onClick ={()=>quantityIncreasing(product)}  style={{height: "100%"}}/>
                                <ProductAmount >{product.quantity}</ProductAmount>
                                <RemoveIcon onClick ={()=>quantityDecreasing(product)} style={{height: "100%"}} />
                            </ProductAmountContainer>
                            <ProductPrice>{product.price * product.quantity} €</ProductPrice>
                        </ProductPriceSection>
                    </ProductDetails>
                    )): <EmptyCartText> Votre Panier est Vide</EmptyCartText>}
<SeparatingLine></SeparatingLine>
                </ProductInfo>
                <ProductSummery>
                    <SummerTitle>Order Summary</SummerTitle>
                    <SummerItem>
                        <SummeryItemTitle>Subtotal:</SummeryItemTitle>
                        <SummeryItemPrice>€ {cartQuantity ===0 ? 0: cart.total}</SummeryItemPrice>
                    </SummerItem>
                    <SummerItem>
                        <SummeryItemTitle>Estimated shipping:</SummeryItemTitle>
                        <SummeryItemPrice>€ 5.4</SummeryItemPrice>
                    </SummerItem>
                    <SummerItem>
                        <SummeryItemTitle>Shipping Discount:</SummeryItemTitle>
                        <SummeryItemPrice>€ -5.4</SummeryItemPrice>
                    </SummerItem>
                    <SummerItem type='total'>
                        <SummeryItemTitle >Total:</SummeryItemTitle>
                        <SummeryItemPrice>€ {cart.total}</SummeryItemPrice>
                    </SummerItem>
                <PayButton cartItems = {cart.products} style={{color:"red"}}>Checkout now</PayButton>
                </ProductSummery>
            </BottomSection>
        </Wrapper>
        <Footer/>
    </Container>
  )
}

export default Carte