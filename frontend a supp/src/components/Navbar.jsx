
import React from 'react';
import 'material-icons/iconfont/material-icons.css';
import styled from 'styled-components';
import { Badge } from '@mui/material';
import { mobile , tablet} from "../responsive";
import {Link} from 'react-router-dom';
import {useSelector, useDispatch} from 'react-redux';
import { logOut } from '../Redux/userRedux';




//navbar style
const Container = styled.div`
margin-top: 12px;
width: 100%;
${mobile({marginTop:"0px"})};
${tablet({marginTop: "0px"})};
`

const NavbarSection = styled.div`
padding: 10px 20px;
display: flex;
justify-content: space-between;
alignment-items; centre;
${mobile({padding:"5px 0px"})};
${tablet({padding:"5px 0px", marginRight:"6px"})};

`
const LeftNavbar = styled.div`
flex: 1;
display:flex;
justify-content: center;
align-items: center;
height: 100%;
text-align:Centre;
${mobile({flex:"0.7"})};

`
const MiddleNavbar = styled.div`
font-weight:500;
font-size: 16px;
display: flex;
list-style: none;
flex:1;
${mobile({display:"none"})};
`

const RightNavbar = styled.div`
display: flex;
flex:1;
height: 100%;
justify-content: flex-end;
${mobile({justifyContent: "flex-start"})};

`
const LOGO = styled.div`
cursor: pointer;
Margin-left:5%;
font-weight:bold;
font-size: 16px;
width: 100%;
${mobile({fontSize:"13px", marginLeft: "0px"})};
`
const SearchBox = styled.div`
border: solid 1px grey;
border-radius: 10px;
display:flex;
alignment: centre;
margin: 0px 10px;
cursor: pointer;
background: rgba(232, 232, 232, 0.74);
${mobile({margin: "0px"})};

`
const MenuList = styled.div`
cursor: pointer;
alignment: centre;
margin: 0px 10px;
${tablet({margin: "0px 4px"})};
`

const CartIcon = styled.div`
cursor: pointer;
font-size: 15px;
margin-left: 8px;
`

const Input = styled.input`
border-radius: 10px;
outline: none;
background: #E8E8E8;
border: none;
${mobile({width: "70px", fontSize:"11px"})}
${tablet({width: "70px", fontSize:"11px"})}
`
//navbar code
const Navbar = () => {
const quantity = useSelector(state=>state.cart.quantity);
const  user = useSelector((state)=>state.user.currantUser);
const dispatch = useDispatch();
const LogoutController = (e)=>{
  dispatch(logOut(e));
}
return (
    <Container>
      <NavbarSection>
        <LeftNavbar>
          <Link to= {`/`} style={{color:"inherit", textDecoration:"none"}}>
            <LOGO>For Happy Days</LOGO>
          </Link>
        </LeftNavbar>

        <MiddleNavbar>
          <Link to= {`/`} style={{color:"inherit", textDecoration:"none"}}>
            <MenuList><li style={{color:"#FFAB07"}}>Accueil</li></MenuList>
          </Link>
          <Link to= {`/products`} style={{color:"inherit", textDecoration:"none"}}>
              <MenuList><li>Magasin</li></MenuList>
          </Link>
          <Link to= {`/contact`} style={{color:"inherit", textDecoration:"none"}}>
          <MenuList><li>Contacter</li></MenuList>
          </Link>
        </MiddleNavbar>

        <RightNavbar>
            <SearchBox>
              <span className="material-icons" >search</span>
              <Input placeholder='Recherche Rapid'></Input>
            </SearchBox>
            <CartIcon>
              <Link to= {`/cart`} style={{color:"inherit", textDecoration:"none"}}>
                    <Badge badgeContent={quantity} color = "info">
                        <span className="material-icons" >add_shopping_cart</span>
                    </Badge>
              </Link>
            </CartIcon>
            {user != null ? 
            <CartIcon>
              <Link to= {`/user/${user.userInfo._id}`} style={{color:"inherit", textDecoration:"none"}}>
                  <span className="material-icons">person_outline</span>
              </Link>
              <Link  to= {`/`} onClick={()=>LogoutController(user)} style={{color:"inherit", textDecoration:"none"}}>
                  <span className="material-icons">logout</span>
              </Link>
            </CartIcon>
            :null}
        </RightNavbar>
      </NavbarSection>
    </Container>

  )
}

export default Navbar;
