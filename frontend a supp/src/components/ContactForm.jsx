import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Img from '../images/map.png';
import { publicURL } from "../siteURL";

const Container = styled.div`
font-family: 'Poppins';
display: flex;
flex-wrap: wrap;
width:100%;
`
const LeftSection = styled.div`
flex:1;
margin:20px;
min-height: 50vh;
min-width: 350px;
`
const RightSection = styled.div`
flex:1;
margin:20px;
padding:50px;
min-height: 50vh;
min-width: 350px;
`
const Image = styled.div`
background-image: url(${Img});
background-size: cover;
background-position: center;
min-height: 50vh;
width:100%;
border-radius: 15px;
`
const Header = styled.h1`
font-size: 20px;
line-height: 28px;
text-align: center;
color: #FFAB07;
`
const Paragraph = styled.div`
font-family: 'Abel';
font-weight: 400;
text-align: center;
font-size: 14px;
line-height: 28px;
color: #000000;
`
const CompanyEmail = styled.div`
font-size: 15px;
line-height: 28px;
text-align: center;
color: #222222;
`
const Phone = styled.div`
font-size: 15px;
text-align: center;
color: #222222;
`
const Form = styled.div`
background: #FFFFFF;

`
const FirstLine = styled.div`
display:flex;
width:100%;
`
const SecondLine = styled.div`
display:flex;
flex-direction: column;
width:100%;
`
const Input = styled.input`
flex:1;
box-sizing: border-box;
align-items: flex-start;
padding: 10px 15px;
height: 48px;
border: 1px solid #BCBAAE;
border-radius: 11px;
margin-left: 20px;
margin-top: 20px;
`
const Email = styled.input`
flex:1;
padding: 10px 15px;
height: 48px;
border: 1px solid #BCBAAE;
border-radius: 11px;
margin-left: 20px;
margin-top: 20px;
`
const Message = styled.textarea`
border: 1px solid #BCBAAE;
border-radius: 11px;
font-family: 'Abel';
font-weight: 400;
font-size: 14px;
padding: 10px 15px;
border-radius: 11px;
margin-left: 20px;
margin-top: 20px;
height: 98px;
`
const Error = styled.div`
color: red;
margin-left: 20px;
margin-top: 10px;
`
const Success = styled.div`
color: green;
margin-left: 20px;
margin-top: 10px;
`
const Submit = styled.button`
align-items: flex-start;
padding: 10px 15px;
width: 114.37px;
background: rgba(255, 171, 7, 0.78);
border: 1px solid #FFBD5B;
border-radius: 16px;
margin-left: 20px;
margin-top: 10px;
cursor: pointer;
  &:hover{
        transform: scale(1.1);
        box-shadow: 2px 2px 2px black;
  }
`
const ContactForm = () => {
  const [name,setName]= useState('');
  const [object,setObject]= useState('');
  const [email,setEmail]= useState('');
  const [message,setMessage]= useState('');

  const handleSubmit = ()=>{
    
   if (name ===''||object ===''||email===''||message ==='') {
    document.getElementById("err").innerText = "veiller remplier les chambre vide";
    } else{
      document.getElementById("err").innerText = "";
      try {
        publicURL.post('/contact',{
          name: name,
          subject: object,
          email: email,
          message: message,
        }).then((res)=>{
          if (res.status === 200) {
            document.getElementById("success").innerText = "votre message a été bien envoyer";
            document.getElementById("err").innerText = "";
          }
       }).catch(()=>document.getElementById("err").innerText = "Un problème est survenu. veuillez vérifier votre mail ou réessayer plus tard",
       document.getElementById("success").innerText = ""

       )
      } catch (error) {
        console.log(error);
      }
    }
  }

  return (
    <Container>
        <LeftSection>
            <Header>For happy days</Header>
            <Paragraph>Ne hesité pas à nous contacter à tous moment</Paragraph>
            <CompanyEmail> <b> Email:</b>forhappydays@gmail.com </CompanyEmail>
            <Phone><b>Telephone:</b>0589745956</Phone>
            <Form>
                <FirstLine>
                  <Input placeholder='Nom' onChange={(e)=>setName(e.target.value)}></Input>
                  <Input placeholder='object' onChange={(e)=>setObject(e.target.value)}></Input>
                </FirstLine>
                <SecondLine>
                  <Email placeholder='Email' onChange={(e)=>setEmail(e.target.value)}></Email>
                  <Message placeholder='Message' onChange={(e)=>setMessage(e.target.value)}></Message>
                </SecondLine>
                <Error id ="err"></Error>
                <Success id ="success"></Success>
                <Submit onClick={handleSubmit}>Soumettre</Submit>
            </Form>
        </LeftSection>
        <RightSection>
          <Image></Image>
        </RightSection>
    </Container>
  )
}

export default ContactForm