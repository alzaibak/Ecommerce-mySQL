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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (name === '' || object === '' || email === '' || message === '') {
      const errEl = document.getElementById("err");
      if (errEl) errEl.innerText = "Veuillez remplir tous les champs";
      return;
    }

    const errEl = document.getElementById("err");
    const successEl = document.getElementById("success");
    
    if (errEl) errEl.innerText = "";
    if (successEl) successEl.innerText = "";

    try {
      const res = await publicURL.post('/contact', {
        name: name,
        subject: object,
        email: email,
        message: message,
      });
      
      if (res.status === 200 || res.data?.message === "message sent" || res.data === "message sent") {
        if (successEl) {
          successEl.innerText = "Votre message a été bien envoyé";
        }
        if (errEl) errEl.innerText = "";
        // Reset form
        setName('');
        setObject('');
        setEmail('');
        setMessage('');
      } else {
        if (errEl) {
          errEl.innerText = "Réponse inattendue du serveur";
        }
      }
    } catch (error) {
      console.error("Contact form error:", error);
      if (errEl) {
        errEl.innerText = error.response?.data?.message || 
          "Un problème est survenu. Veuillez vérifier votre mail ou réessayer plus tard";
      }
      if (successEl) successEl.innerText = "";
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
                <form onSubmit={handleSubmit}>
                  <FirstLine>
                    <Input 
                      placeholder='Nom' 
                      value={name}
                      onChange={(e)=>setName(e.target.value)}
                      required
                    />
                    <Input 
                      placeholder='Object' 
                      value={object}
                      onChange={(e)=>setObject(e.target.value)}
                      required
                    />
                  </FirstLine>
                  <SecondLine>
                    <Email 
                      type="email"
                      placeholder='Email' 
                      value={email}
                      onChange={(e)=>setEmail(e.target.value)}
                      required
                    />
                    <Message 
                      placeholder='Message' 
                      value={message}
                      onChange={(e)=>setMessage(e.target.value)}
                      required
                    />
                  </SecondLine>
                  <Error id ="err"></Error>
                  <Success id ="success"></Success>
                  <Submit type="submit">Soumettre</Submit>
                </form>
            </Form>
        </LeftSection>
        <RightSection>
          <Image></Image>
        </RightSection>
    </Container>
  )
}

export default ContactForm