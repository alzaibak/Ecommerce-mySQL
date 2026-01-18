import React, { useState } from 'react'
import styled from "styled-components";
import { mobile ,tablet} from "../responsive";
import { Link } from 'react-router-dom';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';

const Container = styled.div`
height: 100vh;
width: 100vw;
background: linear-gradient(
    rgba(255,255,255,0.5),
    rgba(255,255,255,0.5)
), azure;
display:flex;
flex-wrap:wrap;
justify-content: center;
align-items: center;
`
const Section = styled.div`
width: 40%;
padding: 20px;
Background:white;
border-radius: 15px;
box-shadow: 2px 2px 2px 2px black;
${mobile({width: "70%"})};
${tablet({width: "70%"})};

`
const Title = styled.h1`
font-family: 'Nunito Sans';
font-style: normal;
font-weight: 700;
font-size: 25px;
line-height: 151%;
mix-blend-mode: darken;
text-align: center;
`
const Form = styled.div`
display:flex;
flex-wrap:wrap;
justify-content: center;
align-items: center;
`
const Input = styled.input`
flex:1;
min-width:40%;
margin:9px;
padding:5px;
background: #FFFFFF;
border: 1px solid #BCBAAE;
border-radius: 11px;
font-family: 'Abel';
font-weight: 400;
font-size: 15px;
line-height: 28px;
color: black;

`
const Agreement = styled.span`
margin:9px;
padding:5px;
font-family: 'Nunito Sans';
font-size: 14px;
`
const Button = styled.button`
padding: 7px 15px;
font-size: 20px;
background: rgba(255, 171, 7, 0.78);
border: 1px solid #FFBD5B;
border-radius: 7px;
transition: all ease-in-out 0.2s;
cursor: pointer;
width: 40%;
  &:hover{
        transform: scale(1.1);
        box-shadow: 2px 2px 2px black;
  }
`
const Error = styled.span`
color:red;
`
const Account = styled.span`
margin-top: 10px;
font-size: 13px;
width:100%;
text-align: center;
`


const Signup = () => {
    const [username, setUsername]= useState("");
    const [email, setEmail]= useState("");
    const [password, setPassword]= useState("");
    const [confirmPassword, setConfirmPassword]= useState("");
    const signUpController = (e)=>{
      if(username === ""|| email  === ""|| password  === ""||confirmPassword === ""){
        //document.getElemetById("error").style.display = "block";
        document.getElementById("err").innerText = "veiller remplier les chambre vide";

      }else if (password !== confirmPassword) {
        document.getElementById("err").innerText = "Password sont pas identique";
      }else{
        e.preventDefault();
        document.getElementById("err").innerText = ""
        try {
         fetch("http://localhost:5000/api/auth/register",{
         method:"post",
         crossDomain:"true",
         headers:{
           "Content-type": "application/json",
           Accept: "application/json",
           "Access-control-allow-origin": "*",
         }, body:JSON.stringify({
          username: username,
          email:email,
          password:password
               }),
        }).then((res)=>res.json()).then((data)=>{console.log(data,"Registered")});
        } catch (error) {
        }
      }
    }

  return (
    <Container>
        <Section>
            <Title>Créez votre compte</Title>
            <Form>
                <Input placeholder='Nom et prénom' type="text" onChange={(e)=>setUsername(e.target.value)}></Input>
                <Input placeholder='Email' type="email" onChange={(e)=>setEmail(e.target.value)}></Input>
                <Input placeholder='Mot de passe'  type="password" onChange={(e)=>setPassword(e.target.value)}></Input>
                <Input placeholder='Confirmer Mot de passe' type="password" onChange={(e)=>setConfirmPassword(e.target.value)}></Input>
                <Error id ="err"></Error>
                <Agreement>
                    Par cliquer sur inscription, j'accepte le traitement de mes données personnelles conformément à la <b> politique de confidentialité</b>
                </Agreement>
                <Button onClick={signUpController}>Inscription</Button>
                <Account>vous avez déja un compte? <Link to={'/login'} style={{color:"crimson", textDecoration:"none"}}>Connexion</Link></Account>
            </Form>
        </Section>
    </Container>
  )
}

export default Signup