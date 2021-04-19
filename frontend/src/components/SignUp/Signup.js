import React, { Component } from "react";
import { Link } from "react-router-dom";
import utils from "../../utils/utils";
import cookie from "react-cookies";
import { connect } from "react-redux";
import { signup, setError } from "../../redux/actions/authentication";

class SignUp extends Component {
  constructor(props) {
    super(props);
    const data = utils.isJWTValid(cookie.load("jwtToken"));
    if (data[0]) {
      // save name
      cookie.save("name", data[1], {
        path: "/",
        httpOnly: false,
        maxAge: 120000,
      });
      // save email
      cookie.save("email", data[2], {
        path: "/",
        httpOnly: false,
        maxAge: 120000,
      });
    }
    this.state = {
      name: "",
      email: "",
      password: "",
      tokenState: data[0],
    };
  }

  handleNameChange = (nameChangeEvent) => {
    if (
      /[~`!#$@%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/g.test(
        nameChangeEvent.target.value
      )
    ) {
      this.props.setError({
        error: true,
        errorMessage: "Name should not contain special characters",
      });
      this.setState({
        [nameChangeEvent.target.name]: "",
      });
    } else {
      this.props.setError({ error: null, errorMessage: null });
      this.setState({
        name: nameChangeEvent.target.value,
      });
    }
  };

  handlePasswordChange = (passwordChangeEvent) => {
    this.setState({
      password: passwordChangeEvent.target.value,
    });
  };

  handleEmailChange = (emailChangeEvent) => {
    if (
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        emailChangeEvent.target.value
      )
    ) {
      this.props.setError({ error: null, errorMessage: null });
      this.setState({
        email: emailChangeEvent.target.value,
      });
    } else {
      this.props.setError({ error: true, errorMessage: "Enter a valid email" });
      this.setState({
        email: "",
      });
    }
  };

  handleOnSubmit = async (submitEvent) => {
    submitEvent.preventDefault();
    const { error, errorMessage, tokenState, ...data } = this.state;
    this.props.signup(data);
  };

  render() {
    if (this.state.tokenState || this.props.error === false) {
      return utils.getRedirectComponent("/users/dashboard");
    } else {
      let renderError = null;
      if (this.props.error) {
        renderError = (
          <div style={{ color: "red" }}>{this.props.errorMessage}</div>
        );
      }
      return (
        <div>
          <div className="row" style={{ height: "100vh", padding: "10%" }}>
            <div className="col-5" style={{ paddingLeft: "10%" }}>
              <div className="row" style={{ height: "10%" }}></div>
              <div className="row" style={{ height: "90%" }}>
                <div className="col-12">
                  <h4 style={{ margin: "10px", color: "#20BF9F" }}>
                    Register Here!
                  </h4>
                  <form
                    style={{ margin: "10px" }}
                    id="Signup"
                    method="post"
                    onSubmit={this.handleOnSubmit}
                  >
                    <div className="form-group">
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        autoFocus
                        required
                        placeholder="Enter Name"
                        onChange={this.handleNameChange}
                      />
                    </div>
                    <div className="form-group">
                      <input
                        type="text"
                        className="form-control"
                        name="email"
                        required
                        placeholder="Enter Email"
                        onChange={this.handleEmailChange}
                      />
                    </div>
                    <div className="form-group">
                      <input
                        type="password"
                        className="form-control"
                        name="password"
                        required
                        placeholder="Enter Password"
                        onChange={this.handlePasswordChange}
                      />
                    </div>
                    <button
                      type="submit"
                      className="btn btn-success"
                      style={{ backgroundColor: "#20BF9F" }}
                      onSubmit={this.handleOnSubmit}
                    >
                      Sign Up
                    </button>
                  </form>
                  {renderError}
                  <br></br>
                  Already have an account?{" "}
                  {
                    <Link style={{ color: "#20BF9F" }} to="/login">
                      Login
                    </Link>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }
}

const mapStateToProps = (state) => {
  return {
    error: state.userProfileReducer.error,
    errorMessage: state.userProfileReducer.errorMessage,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    signup: (data) => dispatch(signup(data)),
    setError: (data) => dispatch(setError(data)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SignUp);
