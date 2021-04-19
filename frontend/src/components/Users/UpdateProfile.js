import React, { Component } from "react";
import cookie from "react-cookies";
import utils from "../../utils/utils";
import Select from "react-select";
import config from "../../config/config";
import axios from "axios";
import defaultProfileImage from "../../images/profile_placeholder.jpg";
import { connect } from "react-redux";
import {
  setError,
  updateUserProfile,
} from "../../redux/actions/authentication";

let currencies = [];
class UpdateProfile extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tokenState: utils.isJWTValid(cookie.load("jwtToken"))[0],
      name: "",
      email: "",
      number: "",
      currencyId: "",
      currencyLabel: "",
      timezone: "",
      language: "",
      image: null,
      wasImageUpdated: false,
      rawImagePath: null,
      imagePathForImageTag: null,
      wasPageJustRefreshed: true,
    };
    // Initializing as an empty list
    this.currency = [];
  }

  handleEmailChange = (emailChangeEvent) => {
    if (
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        emailChangeEvent.target.value
      )
    ) {
      this.props.setError({ error: null, errorMessage: null });
      this.setState({
        email: emailChangeEvent.target.value,
        wasPageJustRefreshed: false,
      });
    } else {
      this.props.setError({ error: true, errorMessage: "Enter a valid email" });
      this.setState({
        email: "",
      });
    }
  };

  handleTimezoneChange = (timezoneChangeEvent) => {
    this.setState({
      timezone: timezoneChangeEvent.value,
      wasPageJustRefreshed: false,
    });
  };

  handleCurrencyChange = (currencyChangeEvent) => {
    this.setState({
      currencyId: currencyChangeEvent.value,
      wasPageJustRefreshed: false,
    });
  };

  handleLanguageChange = (languageChangeEvent) => {
    this.setState({
      language: languageChangeEvent.value,
      wasPageJustRefreshed: false,
    });
  };

  handleNumberChange = (numberChangeEvent) => {
    if (
      /[~`!#$@%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/g.test(
        numberChangeEvent.target.value
      )
    ) {
      this.props.setError({
        error: true,
        errorMessage: "Enter a valid number without any special characters",
      });
      this.setState({
        [numberChangeEvent.target.name]: "",
        wasPageJustRefreshed: false,
      });
    } else {
      this.props.setError({ error: null, errorMessage: null });
      this.setState({
        number: numberChangeEvent.target.value,
        wasPageJustRefreshed: false,
      });
    }
  };
  handleNameChange = (nameChangeEvent) => {
    if (
      /[~`!#$@%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/g.test(
        nameChangeEvent.target.value
      )
    ) {
      this.props.setError({
        error: true,
        errorMessage: "Enter a valid name without any special characters",
      });
      this.setState({
        [nameChangeEvent.target.name]: "",
        wasPageJustRefreshed: false,
      });
    } else {
      this.props.setError({ error: null, errorMessage: null });
      this.setState({
        name: nameChangeEvent.target.value,
        wasPageJustRefreshed: false,
      });
    }
  };

  handleImageChange = (onImageChangeEvent) => {
    this.setState({
      wasImageUpdated: true,
      imagePathForImageTag: URL.createObjectURL(
        onImageChangeEvent.target.files[0]
      ),
      image: onImageChangeEvent.target.files[0],
      wasPageJustRefreshed: false,
    });
  };
  handleOnSubmit = (submitEvent) => {
    submitEvent.preventDefault();
    if (!this.props.error) {
      // construct New form data
      let formData = new FormData();

      // Append image if it was updated
      if (this.state.wasImageUpdated) {
        formData.append(
          "profileImage",
          this.state.image,
          this.state.image.name
        );
      } else {
        formData.append("image", this.state.rawImagePath);
      }

      // Append other data
      formData.append("language", this.state.language);
      formData.append("email", this.state.email);
      formData.append("timezone", this.state.timezone);
      formData.append("number", this.state.number);
      formData.append("currencyId", this.state.currencyId);
      formData.append("name", this.state.name);

      this.props.updateUserProfile(formData);
      this.setState({ wasPageJustRefreshed: false });

      // axios
      //   .put(config.BACKEND_URL + "/users/profile", formData, {
      //     headers: Object.assign(
      //       utils.getJwtHeader(cookie.load("jwtToken")),
      //       utils.getFormDataHeader()
      //     ),
      //   })
      //   .then((res) => {
      //     if (res.status === 200) {
      //       // Update cookies
      //       if (cookie.load("email") !== this.state.email) {
      //         cookie.remove("email", {
      //           path: "/",
      //         });
      //         cookie.save("email", this.state.email, {
      //           path: "/",
      //           httpOnly: false,
      //           maxAge: 120000,
      //         });
      //       }
      //       if (cookie.load("name") !== this.state.name) {
      //         cookie.remove("name", {
      //           path: "/",
      //         });
      //         cookie.save("name", this.state.name, {
      //           path: "/",
      //           httpOnly: false,
      //           maxAge: 120000,
      //         });
      //       }
      //       // Set new jwt token
      //       axios
      //         .post(
      //           config.BACKEND_URL + "/users/login",
      //           {},
      //           { headers: utils.getJwtHeader(cookie.load("jwtToken")) }
      //         )
      //         .then((res) => {
      //           if (res.status === 200) {
      //             // Remove outdated Jwt cookie
      //             cookie.remove("jwtToken", {
      //               path: "/",
      //             });
      //             // Insert updated Jwt cookie
      //             cookie.save("jwtToken", res.data.token, {
      //               path: "/",
      //               httpOnly: false,
      //               maxAge: 120000,
      //             });
      //             window.location.reload();
      //           }
      //         })
      //         .catch((error) => {
      //           console.log(error);
      //         });
      //       // forward to same page
      //       //window.location.reload();
      //     }
      //   })
      //   .catch((error) => {
      //     if (error.response && error.response.status === 401) {
      //       return utils.getRedirectComponent("/login");
      //     } else if (error.response && error.response.status === 400) {
      //       this.props.setError({
      //         error: true,
      //         errorMessage: error.response.data.errorMessage,
      //       });
      //     } else {
      //       console.log(error.response);
      //     }
      //   });
    } else {
      this.props.setError({
        error: true,
        errorMessage: "Enter value for all required fields",
      });
    }
  };

  // Component did mount
  async componentDidMount() {
    try {
      const currencyResponse = await axios.get(
        config.BACKEND_URL + "/masters/currencies",
        {
          headers: utils.getJwtHeader(cookie.load("jwtToken")),
        }
      );

      currencies = await currencyResponse.data.currencyList.map((currency) => {
        return {
          label: currency.name + "(" + currency.symbol + ")",
          value: currency._id,
        };
      });

      this.setState({
        email: this.props.email,
        name: this.props.name,
        timezone: this.props.timezone,
        language: this.props.language,
        number: this.props.number,
        currencyId: this.props.currency._id,
        currencyLabel:
          this.props.currency.name + "(" + this.props.currency.symbol + ")",
        image:
          this.props.image == null
            ? utils.getProfileImageUrl()
            : utils.getProfileImageUrl(this.props.image),
        rawImagePath: this.props.image,
        imagePathForImageTag:
          this.props.image == null
            ? utils.getProfileImageUrl()
            : utils.getProfileImageUrl(this.props.image),
      });
    } catch (error) {
      if (error.response && error.response.status === 401) {
        this.setState({
          tokenState: false,
        });
      } else {
        console.log(error);
      }
    }
  }

  // Render method
  render() {
    if (this.state.tokenState) {
      // Check and set error according to the value of Render error flag
      let renderError = null;
      if (!this.state.wasPageJustRefreshed && this.props.error) {
        renderError = (
          <div style={{ color: "red", marginLeft: "-200px" }}>
            {this.props.errorMessage}
          </div>
        );
      } else if (!this.state.wasPageJustRefreshed && this.props.message) {
        renderError = (
          <div style={{ color: "green", marginLeft: "-200px" }}>
            {this.props.message}
          </div>
        );
      }
      return (
        <div>
          <div
            class="container"
            style={{ marginLeft: "250px", marginTop: "20px" }}
          >
            <div class="row">
              <div class="col-sm">
                <div className="row">
                  <h2 style={{ marginLeft: "20px" }}>Account</h2>
                </div>
                <img
                  src={this.state.imagePathForImageTag}
                  width="200"
                  height="200"
                  alt=""
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = defaultProfileImage;
                  }}
                />

                <div className="row">
                  <p style={{ "margin-left": "20px" }}>
                    Update your profile image
                  </p>
                </div>
                <div className="row">
                  <input
                    style={{ marginLeft: "20px" }}
                    accept="image/x-png,image/gif,image/jpeg"
                    type="file"
                    name="profileImage"
                    onChange={this.handleImageChange}
                  />
                </div>
              </div>
              <div class="col-sm">
                <form onSubmit={this.handleOnSubmit}>
                  <div
                    className="row"
                    style={{ marginLeft: "-300px", marginTop: "30px" }}
                  >
                    <div className="col-3">
                      <label>Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        placeholder={this.state.name}
                        onChange={this.handleNameChange}
                      />
                    </div>

                    <div className="col-3" style={{ marginTop: "30px" }}>
                      <Select
                        options={currencies}
                        placeholder={this.state.currencyLabel}
                        onChange={this.handleCurrencyChange}
                      />
                    </div>
                  </div>
                  <div
                    className="row"
                    style={{ marginLeft: "-300px", marginTop: "30px" }}
                  >
                    <div className="col-3">
                      <label>Email</label>
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        placeholder={this.state.email}
                        onChange={this.handleEmailChange}
                      />
                      {/* {emailError} */}
                    </div>
                    <div className="col-3" style={{ marginTop: "30px" }}>
                      <Select
                        options={config.timezone}
                        placeholder={this.state.timezone}
                        onChange={this.handleTimezoneChange}
                      />
                    </div>
                  </div>
                  <div
                    className="row"
                    style={{ marginLeft: "-300px", marginTop: "30px" }}
                  >
                    <div className="col-3">
                      <label>Contact Number</label>
                      <input
                        type="number"
                        className="form-control"
                        name="number"
                        placeholder={this.state.number}
                        onChange={this.handleNumberChange}
                      />
                    </div>
                    <div className="col-3" style={{ marginTop: "30px" }}>
                      <Select
                        options={config.language}
                        placeholder={this.state.language}
                        onChange={this.handleLanguageChange}
                      />
                    </div>
                  </div>
                  <div style={{ marginLeft: -85 }}>{renderError}</div>

                  <button
                    type="submit"
                    className="btn btn-success"
                    style={{
                      backgroundColor: "#FF8C00",
                      marginTop: "100px",
                      marginLeft: "-100px",
                    }}
                    onSubmit={this.handleOnSubmit}
                  >
                    Save
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      return utils.getRedirectComponent("/login");
    }
  }
}

const mapStateToProps = (state) => {
  return {
    error: state.userProfileReducer.error,
    errorMessage: state.userProfileReducer.errorMessage,
    message: state.userProfileReducer.message,
    name: state.userProfileReducer.loggedInUser.name,
    timezone: state.userProfileReducer.loggedInUser.timezone,
    language: state.userProfileReducer.loggedInUser.language,
    number: state.userProfileReducer.loggedInUser.number,
    email: state.userProfileReducer.loggedInUser.email,
    currency: state.userProfileReducer.loggedInUser.currency,
    image: state.userProfileReducer.loggedInUser.image,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    updateUserProfile: (data) => dispatch(updateUserProfile(data)),
    setError: (data) => dispatch(setError(data)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(UpdateProfile);
