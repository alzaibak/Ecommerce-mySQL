import { useState } from "react";
import { useSelector } from "react-redux";
import { publicURL } from "../siteURL";

const PayButton = ({cartItems}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    //const user = useSelector(state=>state.user.currantUser?.userInfo?._id);
    
    const handlePayment = async () => {
        if (!cartItems || cartItems.length === 0) {
            setError("Your cart is empty");
            return;
        }

        setLoading(true);
        setError("");

        try {
            // Ensure cartItems have the correct format
            const formattedCartItems = cartItems.map(item => ({
                _id: item._id || item.id,
                title: item.title,
                desc: item.desc || item.description,
                img: item.img,
                price: parseFloat(item.price) || 0,
                quantity: parseInt(item.quantity) || 1,
                color: item.color || '',
                size: item.size || ''
            }));

            console.log("Sending to Stripe:", formattedCartItems);

            const res = await publicURL.post("/stripe/create-checkout-session", {
                cartItems: formattedCartItems,
                //userId: user,
            });

            if (res.data.url) {
                window.location.href = res.data.url;
            } else {
                setError("Failed to create checkout session - no URL returned");
                setLoading(false);
            }
        } catch (err) {
            console.error("Payment error:", err);
            setError(err.response?.data?.message || err.message || "Payment failed. Please try again.");
            setLoading(false);
        }
    }

  return (
    <div>
      {error && (
        <div style={{ 
          color: "red", 
          marginBottom: "10px", 
          fontSize: "12px",
          textAlign: "center" 
        }}>
          {error}
        </div>
      )}
      <button 
        onClick={handlePayment}
        disabled={loading || !cartItems || cartItems.length === 0}
        style={{
          width: "100%", 
          padding: "15px 10px",
          background: loading ? "#ccc" : "black",
          color: "white",
          fontSize: "14px",
          fontWeight: "bold",
          letterSpacing: "1px",
          cursor: loading ? "not-allowed" : "pointer",
          border: "none",
          borderRadius: "4px"
        }}
      >
        {loading ? "Processing..." : "Checkout"}
      </button>
    </div>
  )
}

export default PayButton