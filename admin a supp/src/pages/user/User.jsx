import {
  CalendarToday,
  LocationSearching,
  MailOutline,
  PermIdentity,
  PhoneAndroid,
  Publish,
} from "@material-ui/icons";
import { Link, useParams, useHistory } from "react-router-dom";
import { useState, useEffect } from "react";
import { userRequest } from "../../requestMethods";
import "./user.css";

export default function User() {
  const { userId } = useParams();
  const history = useHistory();
  const [user, setUser] = useState(null);
  const [inputs, setInputs] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await userRequest.get(`/users/find/${userId}`);
        setUser(res.data);
        setInputs({
          firstName: res.data.firstName || '',
          lastName: res.data.lastName || '',
          email: res.data.email || '',
          isAdmin: res.data.isAdmin || false
        });
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Failed to load user");
      } finally {
        setLoading(false);
      }
    };
    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const handleChange = (e) => {
    setInputs((prev) => {
      return { ...prev, [e.target.name]: e.target.value };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await userRequest.put(`/users/${userId}`, inputs);
      setSuccess("User updated successfully!");
      setTimeout(() => {
        history.push("/users");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user");
    }
  };

  if (loading) {
    return <div className="user">Loading...</div>;
  }

  if (!user) {
    return <div className="user">User not found</div>;
  }

  return (
    <div className="user">
      <div className="userTitleContainer">
        <h1 className="userTitle">Edit User</h1>
        <Link to="/newUser">
          <button className="userAddButton">Create</button>
        </Link>
      </div>
      <div className="userContainer">
        <div className="userShow">
          <div className="userShowTop">
            <img
              src="https://images.pexels.com/photos/1152994/pexels-photo-1152994.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500"
              alt=""
              className="userShowImg"
            />
            <div className="userShowTopTitle">
              <span className="userShowUsername">{user.firstName} {user.lastName}</span>
              <span className="userShowUserTitle">{user.isAdmin ? "Admin" : "User"}</span>
            </div>
          </div>
          <div className="userShowBottom">
            <span className="userShowTitle">Account Details</span>
            <div className="userShowInfo">
              <PermIdentity className="userShowIcon" />
              <span className="userShowInfoTitle">ID: {user.id}</span>
            </div>
            <div className="userShowInfo">
              <CalendarToday className="userShowIcon" />
              <span className="userShowInfoTitle">Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
            <span className="userShowTitle">Contact Details</span>
            <div className="userShowInfo">
              <MailOutline className="userShowIcon" />
              <span className="userShowInfoTitle">{user.email}</span>
            </div>
            <div className="userShowInfo">
              <LocationSearching className="userShowIcon" />
              <span className="userShowInfoTitle">Admin: {user.isAdmin ? "Yes" : "No"}</span>
            </div>
          </div>
        </div>
        <div className="userUpdate">
          <span className="userUpdateTitle">Edit</span>
          <form className="userUpdateForm" onSubmit={handleSubmit}>
            <div className="userUpdateLeft">
              <div className="userUpdateItem">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={inputs.firstName}
                  onChange={handleChange}
                  className="userUpdateInput"
                  required
                />
              </div>
              <div className="userUpdateItem">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={inputs.lastName}
                  onChange={handleChange}
                  className="userUpdateInput"
                  required
                />
              </div>
              <div className="userUpdateItem">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={inputs.email}
                  onChange={handleChange}
                  className="userUpdateInput"
                  required
                />
              </div>
              <div className="userUpdateItem">
                <label>Admin</label>
                <select
                  name="isAdmin"
                  value={inputs.isAdmin}
                  onChange={(e) => setInputs({...inputs, isAdmin: e.target.value === 'true'})}
                  className="userUpdateInput"
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>
            </div>
            <div className="userUpdateRight">
              {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}
              {success && <div style={{ color: "green", marginBottom: "10px" }}>{success}</div>}
              <button type="submit" className="userUpdateButton">Update</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
