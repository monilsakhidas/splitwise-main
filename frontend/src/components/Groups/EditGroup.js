import React, { Component } from "react";
import cookie from "react-cookies";
import utils from "../../utils/utils";
import config from "../../config/config";
import axios from "axios";
import defaultGroupPhoto from "../../images/splitwise-logo.png";
import { connect } from "react-redux";
import { editGroup, setError } from "../../redux/actions/editGroup";

class EditGroup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      _id: this.props.groupDetails._id,
      name: this.props.groupDetails.name,
      image: this.props.groupDetails.image,
      tokenState: utils.isJWTValid(cookie.load("jwtToken"))[0],
      wasImageUpdated: false,
      updatedProfileImage: "",
      wasPageJustRefreshed: true,
    };
  }

  // TO DO !!!!!
  handleImageChange = (onImageChangeEvent) => {
    this.setState({
      wasImageUpdated: true,
      image: URL.createObjectURL(onImageChangeEvent.target.files[0]),
      updatedProfileImage: onImageChangeEvent.target.files[0],
    });
  };

  handleSubmit = async (onSubmitEvent) => {
    onSubmitEvent.preventDefault();
    if (!this.props.error && utils.isJWTValid(cookie.load("jwtToken"))[0]) {
      let formData = new FormData();
      if (this.state.wasImageUpdated) {
        formData.append(
          "groupImage",
          this.state.updatedProfileImage,
          this.state.updatedProfileImage.name
        );
      }
      formData.append("_id", this.state._id);
      formData.append("name", this.state.name);
      this.props.editGroup(formData);
    } else if (!utils.isJWTValid(cookie.load("jwtToken"))[0]) {
      this.setState({
        tokenState: false,
      });
    }

    if (this.state.wasImageUpdated) {
      this.setState({ wasPageJustRefreshed: false });
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
        errorMessage: "Group's name should not contain special characters",
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

  render() {
    if (!this.state.tokenState) {
      return utils.getRedirectComponent("/login");
    } else if (!this.state.wasPageJustRefreshed && this.props.error === false) {
      window.location.reload();
    } else {
      let renderError = null;
      if (!this.state.wasPageJustRefreshed && this.props.error) {
        renderError = (
          <div style={{ color: "red", display: "block" }}>
            {this.props.errorMessage}
          </div>
        );
      }
      return (
        <div>
          <h1 style={{ marginLeft: "500px" }}>Update Group Details</h1>
          <div className="row" style={{ height: "10vh" }}></div>
          <div className="row" style={{ height: "100vh" }}>
            <div className="col-3"></div>
            <div className="col-2">
              <img
                src={this.state.image}
                width="200"
                height="200"
                alt=""
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = defaultGroupPhoto;
                }}
              />
              <div className="row">
                <input
                  style={{ marginLeft: "20px", marginTop: "30px" }}
                  accept="image/x-png,image/gif,image/jpeg"
                  type="file"
                  name="groupImage"
                  onChange={this.handleImageChange}
                />
              </div>
            </div>
            <div className="col-6">
              <h3>Edit Group Name</h3>
              <form onSubmit={this.handleSubmit} id="Login">
                <input
                  placeholder={this.state.name}
                  type="text"
                  id="groupName"
                  name="groupName"
                  style={{ width: "300px", marginTop: "10px" }}
                  onChange={this.handleNameChange}
                ></input>
                <div className="row">
                  <button
                    type="submit"
                    className="btn btn-success"
                    style={{
                      backgroundColor: "#FF8C00",
                      marginTop: "200px",
                      marginLeft: "10px",
                    }}
                    onSubmit={this.handleSubmit}
                  >
                    Save
                  </button>
                  <button
                    type="submit"
                    className="btn btn-danger"
                    style={{
                      backgroundColor: "#FF8C00",
                      marginTop: "200px",
                      marginLeft: "10px",
                    }}
                    onClick={this.props.closePopUp}
                  >
                    Close
                  </button>
                </div>
              </form>

              {renderError}
            </div>
          </div>
        </div>
      );
    }
  }
}

const mapStateToProps = (state) => {
  return {
    error: state.editGroupReducer.error,
    errorMessage: state.editGroupReducer.errorMessage,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    editGroup: (data) => dispatch(editGroup(data)),
    setError: (data) => dispatch(setError(data)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EditGroup);
