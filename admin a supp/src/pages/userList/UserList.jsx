import "./userList.css";
import { DataGrid } from "@material-ui/data-grid";
import { DeleteOutline } from "@material-ui/icons";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { userRequest } from "../../requestMethods";

export default function UserList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await userRequest.get("/users");
        const users = res.data.map((user) => ({
          ...user,
          id: user.id,
          username: `${user.firstName} ${user.lastName}`,
        }));
        setData(users);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await userRequest.delete(`/users/${id}`);
        setData(data.filter((item) => item.id !== id));
      } catch (err) {
        alert("Failed to delete user");
        console.error(err);
      }
    }
  };
  
  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    {
      field: "username",
      headerName: "User",
      width: 200,
      renderCell: (params) => {
        return (
          <div className="userListUser">
            {params.row.username}
          </div>
        );
      },
    },
    { field: "email", headerName: "Email", width: 200 },
    {
      field: "isAdmin",
      headerName: "Admin",
      width: 120,
      renderCell: (params) => {
        return params.row.isAdmin ? "Yes" : "No";
      },
    },
    {
      field: "action",
      headerName: "Action",
      width: 150,
      renderCell: (params) => {
        return (
          <>
            <Link to={"/user/" + params.row.id}>
              <button className="userListEdit">Edit</button>
            </Link>
            <DeleteOutline
              className="userListDelete"
              onClick={() => handleDelete(params.row.id)}
            />
          </>
        );
      },
    },
  ];

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="userList">
      <DataGrid
        rows={data}
        disableSelectionOnClick
        columns={columns}
        getRowId={(row) => row.id}
        pageSize={8}
        checkboxSelection
      />
    </div>
  );
}
