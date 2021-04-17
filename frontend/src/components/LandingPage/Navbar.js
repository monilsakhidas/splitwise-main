import React, { Component } from "react";
import { Link } from "react-router-dom";
import cookie from "react-cookies";
import utils from "../../utils/utils";
import splitwiselogo from "../../images/splitwise-logo.png";

class Navbar extends Component {
  render() {
    const [isTokenValid, name, email] = utils.isJWTValid(
      cookie.load("jwtToken")
    );
    if (isTokenValid) {
      return (
        <div>
          <nav
            class="navbar navbar-expand-lg navbar-dark"
            style={{ backgroundColor: "#20BF9F" }}
          >
            <Link to="/">
              <img
                style={{ marginLeft: "100px" }}
                src={splitwiselogo}
                width="60"
                height="50"
              />
            </Link>
            <h2
              style={{
                color: "black",
                marginTop: "5px",
                marginLeft: "5px",
                color: "white",
              }}
            >
              <Link to="/" style={{ textDecoration: "none" }}>
                <strong style={{ color: "white", fontSize: 25 }}>
                  Splitwise
                </strong>
              </Link>
            </h2>
            <li
              class="nav-item dropdown"
              style={{
                "margin-left": "950px",
                "margin-top": "-20px",
                color: "#20BF9F",
              }}
            >
              <Link
                class="nav-link dropdown-toggle"
                to="#"
                id="navbarDropdown"
                role="button"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
                style={{ color: "white" }}
              >
                <em>{name}</em>
              </Link>
              <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                <Link class="dropdown-item" to="/users/update">
                  Your Profile
                </Link>
                <div class="dropdown-divider"></div>
                <Link class="dropdown-item" to="/groups/create">
                  New Group
                </Link>
                <Link class="dropdown-item" to="/groups/mygroups">
                  Groups/Invitations
                </Link>
                <Link class="dropdown-item" to="/users/activity">
                  Recent Activity
                </Link>
                <Link class="dropdown-item" to="/users/dashboard">
                  Dashboard
                </Link>
                <div class="dropdown-divider"></div>
                <Link class="dropdown-item" to="/logout">
                  Logout
                </Link>
              </div>
            </li>
            <div class="collapse navbar-collapse" id="navbarNav">
              <ul class="navbar-nav ml-auto">
                <li class="nav-item">
                  <Link
                    class="nav-link"
                    to="/logout"
                    style={{ color: "white" }}
                  >
                    Logout
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>
      );
    } else {
      return (
        <div>
          <nav
            class="navbar navbar-expand-lg navbar-dark"
            style={{ backgroundColor: "#20BF9F" }}
          >
            <Link to="/">
              <img
                style={{ marginLeft: "170px" }}
                src={splitwiselogo}
                width="60"
                height="50"
              />
            </Link>

            <h2
              style={{
                color: "black",
                marginTop: "5px",
                marginLeft: "5px",
                color: "white",
              }}
            >
              <Link to="/" style={{ textDecoration: "none" }}>
                <strong style={{ color: "white", fontSize: 25 }}>
                  Splitwise
                </strong>
              </Link>
            </h2>
            <button
              class="navbar-toggler"
              type="button"
              data-toggle="collapse"
              data-target="#navbarNav"
              aria-controls="navbarNav"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
              <ul class="navbar-nav ml-auto">
                <li class="nav-item">
                  <Link
                    class="nav-link"
                    to="/login"
                    style={{ color: "white", "margin-right": "0px" }}
                  >
                    Login
                  </Link>
                </li>
                <li class="nav-item">
                  <Link
                    class="nav-link"
                    to="/signup"
                    style={{ color: "white", "margin-right": "100px" }}
                  >
                    Signup
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>
      );
    }
  }
}

export default Navbar;
