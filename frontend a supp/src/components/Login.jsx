
import React from 'react';
import 'material-icons/iconfont/material-icons.css';
import styled from 'styled-components';
import { mobile , tablet} from "../responsive";
import {Link} from 'react-router-dom';
import { useSelector } from 'react-redux';
import { logOut } from '../Redux/userRedux';
import { useDispatch } from 'react-redux';

const Container = styled.div`
height: 100%;
background: #212529;
margin: none;
padding:non;
display:flex;
flex-wrap: wrap;
color: #FFFFFF;
text-align: center;
margin-bottom: 10px;

`
const LeftDiv = styled.div`
width:100%;
display:flex;
min-width: 190px;
flex:1;
${mobile({display:"none"})}
`
const LeftInfo = styled.div`
margin :5px 13px;
font-size: 14px;
justify-content: center;
${tablet({margin: "0px 6px"})};
`
const RightDiv = styled.div`
width:100%;
min-width: 190px;
display:flex;
flex:1;
justify-content: flex-end;
${mobile({justifyContent: "center"})};
${tablet({justifyContent: "center", alignItems: "center"})};

`
const RightInfo = styled.div`
cursor: pointer;
margin :3px 13px;
font-weight:bold;
justify-content: center;
${tablet({margin: "0px 8px"})};
`

//Login bar code
const Login = () => {
  const  user = useSelector((state)=>state.user.currantUser);
  const dispatch = useDispatch();
  const LogoutController = (e)=>{
    dispatch(logOut(e));
  }
  return (
    <Container>
        <LeftDiv>
            <LeftInfo><span className="material-icons" style={{fontSize : "13px" , margin: "3px", verticalAlign: "bottom"}}>phone</span>0255124578</LeftInfo>
            <LeftInfo><span className="material-icons" style={{fontSize : "13px" , margin: "3px", verticalAlign: "bottom"}}>location_on</span>25 rue de la address</LeftInfo>
        </LeftDiv>
        {user === null ? 
        <RightDiv>
            <Link to= {`/login`} style={{color:"inherit", textDecoration:"none"}}>
               <RightInfo>Connexion</RightInfo>
            </Link>
            <Link to= {`/signup`} style={{color:"inherit", textDecoration:"none"}}>
            <RightInfo>Créer un compte</RightInfo> 

            </Link>
        </RightDiv>
        :<RightDiv>
            <Link to= {`/`} style={{color:"inherit", textDecoration:"none"}} >
               <RightInfo onClick={()=>LogoutController(user)}>Déconnexion</RightInfo>
            </Link>
        </RightDiv> 
        }
    </Container>

  )
}

export default Login;
