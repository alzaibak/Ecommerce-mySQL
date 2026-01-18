import Sidebar from "./components/sidebar/Sidebar";
import RightNavbar from "./components/rightNavbar/RightNavbar";
import Topbar from "./components/topbar/Topbar";
import "./App.css";
import Home from "./pages/home/Home";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import UserList from "./pages/userList/UserList";
import User from "./pages/user/User";
import NewUser from "./pages/newUser/NewUser";
import ProductList from "./pages/productList/ProductList";
import Product from "./pages/product/Product";
import NewProduct from "./pages/newProduct/NewProduct";
import Login from "./pages/login/Login";
import OrderList from "./pages/orderList/OrderList";
import CategoryList from "./pages/categoryList/CategoryList";
import { useSelector } from "react-redux";

function App() {
  const admin = useSelector((state) => state.user.currentUser?.isAdmin);
  const currentUser = useSelector((state) => state.user.currentUser);
  
  return (
    <Router>
      <Switch>
        <Route path="/login">
          {currentUser && admin ? <Redirect to="/" /> : <Login />}
        </Route> 
        {!currentUser || !admin ? (
          <Redirect to="/login" />
        ) : (
          <>
            <Topbar />
            <div className="container">
              <Sidebar />
              <div className="mainContent">
                <Route exact path="/">
                  <Home />
                </Route>
                <Route path="/users">
                  <UserList />
                </Route>
                <Route path="/user/:userId">
                  <User />
                </Route>
                <Route path="/newUser">
                  <NewUser />
                </Route>
                <Route path="/products">
                  <ProductList />
                </Route>
                <Route path="/product/:productId">
                  <Product />
                </Route>
                <Route path="/newproduct">
                  <NewProduct />
                </Route>
                <Route path="/orders">
                  <OrderList />
                </Route>
                <Route path="/categories">
                  <CategoryList />
                </Route>
              </div>
              <RightNavbar />
            </div>
          </>
        )}
      </Switch>
    </Router>
  );
}

export default App;
