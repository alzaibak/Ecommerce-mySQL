import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import "./topbar.css";
import { NotificationsNone, Language, Settings, ExitToApp } from "@material-ui/icons";
import { logout } from "../../redux/userRedux";

export default function Topbar() {
  const dispatch = useDispatch();
  const history = useHistory();
  const currentUser = useSelector((state) => state.user.currentUser);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("persist:root");
    history.push("/login");
  };

  return (
    <div className="topbar">
      <div className="topbarWrapper">
        <div className="topLeft">
          <span className="logo">For Happy Days Admin</span>
        </div>
        <div className="topRight">
          <div className="topbarIconContainer">
            <NotificationsNone />
            <span className="topIconBadge">2</span>
          </div>
          <div className="topbarIconContainer">
            <Language />
            <span className="topIconBadge">2</span>
          </div>
          <div className="topbarIconContainer">
            <Settings />
          </div>
          <div className="topbarIconContainer" onClick={handleLogout} style={{ cursor: "pointer" }}>
            <ExitToApp />
          </div>
          {currentUser && (
            <span style={{ marginLeft: "10px", fontSize: "14px" }}>
              {currentUser.firstName} {currentUser.lastName}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
