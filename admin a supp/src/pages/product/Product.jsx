import { Link, useLocation } from "react-router-dom";
import "./product.css";
import Chart from "../../components/Chart";
import { productData } from "../../dummyData";
import { Publish } from "@material-ui/icons";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useMemo, useState } from "react";
import { userRequest } from "../../requestMethods";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import app from "../../firebase";
import { updateProduct } from "../../redux/apiCalls";

export default function Product() {
  const location = useLocation();
  const productId = location.pathname.split("/")[2];
  const dispatch = useDispatch();
  const [pStats, setPStats] = useState([]);
  const [inputs, setInputs] = useState({});
  const [file, setFile] = useState(null);

  const product = useSelector((state) =>
    state.product.products.find((product) => 
      product._id === productId || product.id === parseInt(productId)
    )
  );

  useEffect(() => {
    if (product) {
      setInputs({
        title: product.title,
        desc: product.desc || product.description,
        price: product.price,
        inStock: product.inStock,
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const name = e.target ? e.target.name : e.name;
    const value = e.target ? e.target.value : e.value;
    setInputs((prev) => {
      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Use productId from URL (it's already the correct format)
    const backendId = productId;
    
    if (file) {
      const fileName = new Date().getTime() + file.name;
      const storage = getStorage(app);
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
        },
        (error) => {
          console.error("Upload error:", error);
          alert("Failed to upload image");
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
            const updatedProduct = { ...inputs, img: downloadURL };
            try {
              await updateProduct(backendId, updatedProduct, dispatch);
              setTimeout(() => {
                alert("Product updated successfully!");
                window.location.reload();
              }, 1000);
            } catch (error) {
              console.error("Error updating product:", error);
            }
          }).catch((error) => {
            console.error("Error getting download URL:", error);
            alert("Failed to get image URL");
          });
        }
      );
    } else {
      try {
        await updateProduct(backendId, inputs, dispatch);
        setTimeout(() => {
          alert("Product updated successfully!");
          window.location.reload();
        }, 1000);
      } catch (error) {
        console.error("Error updating product:", error);
      }
    }
  };

  const MONTHS = useMemo(
    () => [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Agu",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    []
  );

  useEffect(() => {
    const getStats = async () => {
      try {
        const res = await userRequest.get("orders/income?pid=" + productId);
        const list = res.data.sort((a,b)=>{
            return a._id - b._id
        })
        list.map((item) =>
          setPStats((prev) => [
            ...prev,
            { name: MONTHS[item._id - 1], Sales: item.total },
          ])
        );
      } catch (err) {
        console.log(err);
      }
    };
    getStats();
  }, [productId, MONTHS]);

  if (!product) {
    return <div className="product">Product not found</div>;
  }

  return (
    <div className="product">
      <div className="productTitleContainer">
        <h1 className="productTitle">Product</h1>
        <Link to="/newproduct">
          <button className="productAddButton">Create</button>
        </Link>
      </div>
      <div className="productTop">
        <div className="productTopLeft">
          <Chart data={pStats} dataKey="Sales" title="Sales Performance" />
        </div>
        <div className="productTopRight">
          <div className="productInfoTop">
            <img src={product.img} alt="" className="productInfoImg" />
            <span className="productName">{product.title}</span>
          </div>
          <div className="productInfoBottom">
            <div className="productInfoItem">
              <span className="productInfoKey">id:</span>
              <span className="productInfoValue">{product._id}</span>
            </div>
            <div className="productInfoItem">
              <span className="productInfoKey">sales:</span>
              <span className="productInfoValue">5123</span>
            </div>
            <div className="productInfoItem">
              <span className="productInfoKey">in stock:</span>
              <span className="productInfoValue">{product.inStock}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="productBottom">
        <form className="productForm" onSubmit={handleSubmit}>
          <div className="productFormLeft">
            <label>Product Name</label>
            <input 
              type="text" 
              name="title"
              defaultValue={product.title}
              onChange={handleChange}
            />
            <label>Product Description</label>
            <input 
              type="text" 
              name="desc"
              defaultValue={product.desc || product.description} 
              onChange={handleChange}
            />
            <label>Price</label>
            <input 
              type="number" 
              name="price"
              defaultValue={product.price} 
              onChange={handleChange}
            />
            <label>In Stock</label>
            <select 
              name="inStock" 
              id="idStock"
              value={inputs.inStock !== undefined ? String(inputs.inStock) : String(product.inStock)}
              onChange={(e) => handleChange({ target: { name: 'inStock', value: e.target.value === 'true' } })}
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          <div className="productFormRight">
            <div className="productUpload">
              <img src={product.img} alt="" className="productUploadImg" />
              <label htmlFor="file">
                <Publish />
              </label>
              <input 
                type="file" 
                id="file" 
                style={{ display: "none" }}
                onChange={(e) => setFile(e.target.files[0])}
              />
            </div>
            <button type="submit" className="productButton">Update</button>
          </div>
        </form>
      </div>
    </div>
  );
}
