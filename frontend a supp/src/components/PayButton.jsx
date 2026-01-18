import { useSelector } from "react-redux";
import { publicURL } from "../siteURL";

const PayButton = ({cartItems}) => {
    //const user = useSelector(state=>state.user.currantUser.userInfo._id);
    const handlePayment = ()=>{
        publicURL.post("/stripe/create-checkout-session",{
            cartItems,
            //userId: user,

        }).then((res)=>{
            if (res.data.url){
                window.location.href = res.data.url;
            }
         })
         .catch((err)=>console.log(err.message))
    }

  return (
    <button onClick={()=>handlePayment()} 
    style={{width:"100%", 
    padding:"15px 10px",
     background:"black",
        color:"white",
        fontSize: "14px",
        fontWeight: "bold",
        letterSpacing: "1px",
        cursor: "pointer",}}>Checkout</button>
  )
}

export default PayButton