import React,{ useEffect } from 'react';
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Login from '../components/Login';
import { useSelector } from 'react-redux';
import styled from "styled-components";
import {useNavigate} from "react-router-dom";


const Container = styled.div`
`
const UserInfo = styled.table`
width: 80vw;
margin: 20px;
UserInfo.thead{
  color:red;
}
`
const UserCommands = styled.div`
`
const User = () => {
  const  selector = useSelector((state)=>state.user.currantUser);
  const  user = selector.userInfo;
  const navigate = useNavigate();
  useEffect(()=>{
    if (selector === 'null') {
      navigate("/");
    }
  },[selector,navigate])
  
  return (
    <Container>
        <Login></Login>
        <Navbar></Navbar>
        <UserInfo>
            <thead>Vos coordonée</thead>
            <tr>
              <td>Email:</td>
              <td>{user.email}</td>
            </tr>
            <tr>
              <td>Username:</td>
              <td>{user.username}</td>
            </tr>
            <tr>
              <td>Password:</td>
              <td>{user.password}</td>
              <td>Changer</td>
            </tr>
        </UserInfo>
        <UserCommands>
          
        </UserCommands>
        <Footer></Footer>
    </Container>
  )
}

export default User