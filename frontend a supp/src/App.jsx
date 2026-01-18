import Login from "./pages/Login";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import SingleProduct from "./pages/SingleProduct";
import Carte from "./pages/Carte";
import Products from "./pages/Products";
import Contact from "./pages/Contact";
import Success from "./pages/SuccessPayment";
import User from "./pages/User";
import Error from "./pages/Error";
import PasswordRecovery from "./pages/PasswordRecovery";
import { useSelector } from 'react-redux';
import ScrollToTop from './scrollingToTop';
import {
    BrowserRouter as Router,
    Routes,
    Route } from "react-router-dom";

const App = () =>{
    const  user = useSelector((state)=>state.user.currantUser);
    return (

        <Router>
            <ScrollToTop />
            <Routes>
                <Route exact path="/" element={<Home/>}/>
                <Route exact path="/products" element={<Products/>}/>
                <Route exact path="/products/:category" element={<Products/>}/>
                <Route exact path="/product/:id" element={<SingleProduct/>}/>
                <Route exact path="/cart" element={<Carte/>}/>
                <Route exact path="/login" element={<Login/>}/>
                <Route exact path="/signup" element={<Signup/>}/>
                <Route exact path="/PasswordRecovery" element={<PasswordRecovery/>}/>
                <Route exact path="/contact" element={<Contact/>}/>
                <Route exact path="/successPayment" element={<Success/>}/>
                <Route exact path="/user/:id" element={<User/>}/>
                <Route exact path="*" element={<Error/>}/>
            </Routes>
        </Router>
    )
};

export default App;

