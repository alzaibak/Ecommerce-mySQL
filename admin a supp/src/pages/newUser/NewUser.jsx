import "./newUser.css";
import { useState } from "react";
import { userRequest } from "../../requestMethods";
import { useHistory } from "react-router-dom";

export default function NewUser() {
  const [inputs, setInputs] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const history = useHistory();

  const handleChange = (e) => {
    setInputs((prev) => {
      return { ...prev, [e.target.name]: e.target.value };
    });
  };

  const handleClick = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!inputs.firstName || !inputs.lastName || !inputs.email || !inputs.password) {
      setError("Please fill all required fields");
      return;
    }

    try {
      await userRequest.post("/users", {
        firstName: inputs.firstName,
        lastName: inputs.lastName,
        email: inputs.email,
        password: inputs.password,
        isAdmin: inputs.isAdmin === "true"
      });
      setSuccess("User created successfully!");
      setTimeout(() => {
        history.push("/users");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create user");
    }
  };

  return (
    <div className="newUser">
      <h1 className="newUserTitle">New User</h1>
      <form className="newUserForm">
        <div className="newUserItem">
          <label>First Name *</label>
          <input 
            type="text" 
            name="firstName"
            placeholder="John" 
            onChange={handleChange}
          />
        </div>
        <div className="newUserItem">
          <label>Last Name *</label>
          <input 
            type="text" 
            name="lastName"
            placeholder="Smith" 
            onChange={handleChange}
          />
        </div>
        <div className="newUserItem">
          <label>Email *</label>
          <input 
            type="email" 
            name="email"
            placeholder="john@gmail.com" 
            onChange={handleChange}
          />
        </div>
        <div className="newUserItem">
          <label>Password *</label>
          <input 
            type="password" 
            name="password"
            placeholder="password" 
            onChange={handleChange}
          />
        </div>
        <div className="newUserItem">
          <label>Admin</label>
          <select 
            className="newUserSelect" 
            name="isAdmin" 
            id="isAdmin"
            onChange={handleChange}
          >
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </div>
        {error && <div style={{ color: "red", margin: "10px 0" }}>{error}</div>}
        {success && <div style={{ color: "green", margin: "10px 0" }}>{success}</div>}
        <button className="newUserButton" onClick={handleClick}>Create</button>
      </form>
    </div>
  );
}
