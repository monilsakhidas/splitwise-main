import React, { Component } from "react";
import utils from "../../utils/utils";
import cookie from "react-cookies";
import AsyncSelect from "react-select/async";
import splitwiselogo from "../../images/splitwise-logo.png";
import axios from "axios";
import config from "../../config/config";
import { connect } from "react-redux";
import { createGroup, setError } from "../../redux/actions/groupInfo";

class CreateGroup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      users: [],
      tokenState: utils.isJWTValid(cookie.load("jwtToken"))[0],
      updatedProfileImage: null,
      updatedProfileImagePath: utils.getImageUrl(),
      wasImageUpdated: false,
      wasPageRefreshed: true,
    };
  }

  handleSubmit = async (onSubmitEvent) => {
    onSubmitEvent.preventDefault();
    if (!this.props.error) {
      // Initialize form data
      let formData = new FormData();
      // add Image to for data
      if (this.state.wasImageUpdated) {
        formData.append(
          "groupImage",
          this.state.updatedProfileImage,
          this.state.updatedProfileImage.name
        );
      }
      // We need to send a list of userIds.
      const userIdList = this.state.users.map((user) => {
        return user.value;
      });
      formData.append("name", this.state.name);
      formData.append("users", userIdList.join());
      this.props.createGroup(formData);
    }
  };

  // LEFT TO DO
  handleImageChange = (onImageChangeEvent) => {
    this.setState({
      updatedProfileImage: onImageChangeEvent.target.files[0],
      updatedProfileImagePath: URL.createObjectURL(
        onImageChangeEvent.target.files[0]
      ),
      wasImageUpdated: true,
    });
  };

  handleNameChange = (nameChangeEvent) => {
    if (
      /[~`!#$@%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/g.test(
        nameChangeEvent.target.value
      )
    ) {
      this.props.setError({
        error: true,
        errorMessage: "Group's name should not contain special characters",
      });
      this.setState({
        [nameChangeEvent.target.name]: "",
        wasPageRefreshed: false,
      });
    } else {
      this.props.setError({
        error: null,
        errorMessage: null,
      });
      this.setState({
        name: nameChangeEvent.target.value,
        wasPageRefreshed: false,
      });
    }
  };

  handleUsers = (addedUsers) => {
    this.props.setError({
      error: null,
      errorMessage: null,
    });
    this.setState({
      users: addedUsers,
      wasPageRefreshed: false,
    });
  };

  searchOptions = async (inp, callback) => {
    try {
      const response = await axios.get(
        config.BACKEND_URL + "/search/users?keyword=" + inp,
        { headers: utils.getJwtHeader(cookie.load("jwtToken")) }
      );
      const searchedUsers = response.data.users.map((user) => {
        return {
          label: user.name + "(" + user.email + ")",
          value: user._id,
        };
      });
      callback(searchedUsers);
    } catch (error) {
      if (error.response.status === 401)
        this.setState({
          tokenState: false,
          wasPageRefreshed: false,
        });
      else {
        console.log(error.response);
      }
    }
  };

  render() {
    if (this.state.tokenState) {
      if (!this.state.wasPageRefreshed && this.props.error === false) {
        return utils.getRedirectComponent("/users/dashboard");
      }
      let errorMessage = null;
      if (!this.state.wasPageRefreshed && this.props.error) {
        errorMessage = (
          <div style={{ color: "red" }}>{this.props.errorMessage}</div>
        );
      }
      return (
        <div>
          <div className="row" style={{ height: "10vh" }}></div>
          <div className="row" style={{ height: "100vh" }}>
            <div className="col-3"></div>
            <div className="col-2">
              <img
                src={this.state.updatedProfileImagePath}
                width="200"
                height="200"
                alt=""
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = splitwiselogo;
                }}
              />
              <div className="row p-1 m-3">
                <input
                  style={{ marginLeft: "20px" }}
                  accept="image/x-png,image/gif,image/jpeg"
                  type="file"
                  name="groupImage"
                  onChange={this.handleImageChange}
                />
              </div>
            </div>
            <div className="col-6">
              <h5>Group Name</h5>
              <form onSubmit={this.handleSubmit} id="Login">
                <input
                  placeholder="Enter Group name"
                  type="text"
                  id="groupName"
                  name="groupName"
                  style={{ width: "300px", marginBottom: "40px" }}
                  onChange={this.handleNameChange}
                ></input>

                <AsyncSelect
                  isMulti
                  value={this.state.users}
                  onChange={this.handleUsers}
                  placeholder={"Search by name or email"}
                  loadOptions={this.searchOptions}
                />
                {errorMessage}
                <button
                  type="submit"
                  className="btn btn-success"
                  style={{
                    backgroundColor: "#FF8C00",
                    marginTop: "100px",
                    marginLeft: "0px",
                  }}
                  onSubmit={this.handleSubmit}
                >
                  Save
                </button>
              </form>
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
    error: state.groupInfoReducer.error,
    errorMessage: state.groupInfoReducer.errorMessage,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    createGroup: (data) => dispatch(createGroup(data)),
    setError: (data) => dispatch(setError(data)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateGroup);
