import { useState, useEffect } from "react";
import "./newProduct.css";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import app from "../../firebase";
import { addProduct } from "../../redux/apiCalls";
import { useDispatch } from "react-redux";
import { publicRequest } from "../../requestMethods";

export default function NewProduct() {
  const [inputs, setInputs] = useState({});
  const [file, setFile] = useState(null);
  const [cat, setCat] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await publicRequest.get("/categories");
        setCategories(res.data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setInputs((prev) => {
      return { ...prev, [e.target.name]: e.target.value };
    });
  };
  const handleCat = (e) => {
    const value = e.target.value;
    if (value.includes(",")) {
      // Legacy comma-separated input
      setCat(value.split(",").map(c => c.trim()));
      setSelectedCategories([]);
    } else {
      // Single category selection
      setCat([value]);
      setSelectedCategories([value]);
    }
  };

  const handleCategorySelect = (e) => {
    const categoryIds = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedCategories(categoryIds);
    setCat(categoryIds);
  };

  const handleClick = (e) => {
    e.preventDefault();
    
    if (!file) {
      alert("Please select an image file");
      return;
    }

    if (!inputs.title || !inputs.price) {
      alert("Please fill in title and price");
      return;
    }

    const fileName = new Date().getTime() + file.name;
    const storage = getStorage(app);
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    // Register three observers:
    // 1. 'state_changed' observer, called any time the state changes
    // 2. Error observer, called on failure
    // 3. Completion observer, called on successful completion
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Observe state change events such as progress, pause, and resume
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
        switch (snapshot.state) {
          case "paused":
            console.log("Upload is paused");
            break;
          case "running":
            console.log("Upload is running");
            break;
          default:
        }
      },
      (error) => {
        // Handle unsuccessful uploads
      },
      () => {
        // Handle successful uploads on complete
        // For instance, get the download URL: https://firebasestorage.googleapis.com/...
        getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
          const product = { 
            ...inputs, 
            img: downloadURL, 
            categories: cat.length > 0 ? cat : []
          };
          try {
            await addProduct(product, dispatch);
            // Reset form after successful creation
            setInputs({});
            setFile(null);
            setCat([]);
            setSelectedCategories([]);
            window.location.href = "/products";
          } catch (error) {
            console.error("Error adding product:", error);
          }
        }).catch((error) => {
          console.error("Error getting download URL:", error);
          alert("Failed to get image URL");
        });
      }
    );
  };

  return (
    <div className="newProduct">
      <h1 className="addProductTitle">New Product</h1>
      <form className="addProductForm">
        <div className="addProductItem">
          <label>Image</label>
          <input
            type="file"
            id="file"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>
        <div className="addProductItem">
          <label>Title</label>
          <input
            name="title"
            type="text"
            placeholder="Apple Airpods"
            onChange={handleChange}
          />
        </div>
        <div className="addProductItem">
          <label>Description</label>
          <input
            name="desc"
            type="text"
            placeholder="description..."
            onChange={handleChange}
          />
        </div>
        <div className="addProductItem">
          <label>Price</label>
          <input
            name="price"
            type="number"
            placeholder="100"
            onChange={handleChange}
          />
        </div>
        <div className="addProductItem">
          <label>Categories</label>
          {categories.length > 0 ? (
            <select 
              multiple 
              onChange={handleCategorySelect}
              style={{ padding: "10px", minHeight: "100px" }}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          ) : (
            <input 
              type="text" 
              placeholder="jeans,skirts (comma-separated)" 
              onChange={handleCat} 
            />
          )}
          <small style={{ color: "#666", marginTop: "5px", display: "block" }}>
            {categories.length > 0 
              ? "Hold Ctrl/Cmd to select multiple categories" 
              : "Enter categories separated by commas"}
          </small>
        </div>
        <div className="addProductItem">
          <label>Stock</label>
          <select name="inStock" onChange={handleChange}>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
        <button onClick={handleClick} className="addProductButton">
          Create
        </button>
      </form>
    </div>
  );
}
