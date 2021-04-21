import React, { Component } from "react";
import utils from "../../utils/utils";
import config from "../../config/config";
import cookie from "react-cookies";
import axios from "axios";
import Lottie from "react-lottie";
import * as loading from "../../animations/196-material-wave-loading.json";
import defaultGroupPhoto from "../../images/splitwise-logo.png";
import { connect } from "react-redux";
import { addExpense } from "../../redux/actions/groupDetails";

const loadingOptions = {
  loop: true,
  autoplay: true,
  animationData: loading.default,
  rendererSettings: {
    preserverAspectRatio: "xMidYMid slice",
  },
};
class AddExpense extends Component {
  constructor(props) {
    super(props);
    this.state = {
      _id: this.props.groupDetails._id,
      name: this.props.groupDetails.name,
      groupImage:
        this.props.groupDetails.image == null
          ? utils.getImageUrl()
          : utils.getImageUrl(this.props.groupDetails.image),
      tokenState: utils.isJWTValid(cookie.load("jwtToken"))[0],
      wasExpenseAdded: false,
      amount: "",
      description: "",
      isDisabled: false,
      error: false,
      errorMessage: "",
    };
  }

  handleAmountChange = (amountChangeEvent) => {
    if (amountChangeEvent.target.value <= 0) {
      this.setState({
        errorMessage: "Enter a valid amount",
        error: true,
        amount: "",
      });
    } else {
      this.setState({
        errorMessage: "",
        error: false,
        amount: amountChangeEvent.target.value,
      });
    }
  };

  handleDescriptionChange = (descriptionChangeEvent) => {
    if (
      /[~`!#$@%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/g.test(
        descriptionChangeEvent.target.value
      )
    ) {
      this.setState({
        error: true,
        errorMessage: "Special characters not allowed.",
        description: "",
      });
    } else {
      this.setState({
        error: false,
        errorMessage: "",
        description: descriptionChangeEvent.target.value,
      });
    }
  };

  handleSubmit = async (handleSubmitEvent) => {
    handleSubmitEvent.preventDefault();
    // Disabling the submit form button
    this.setState({
      isDisabled: true,
    });
    await this.props.addExpense({
      description: this.state.description,
      group_id: this.state._id,
      amount: this.state.amount,
    });
    // Enabling the submit form button
    this.setState({
      isDisabled: false,
    });
    this.props.closePopUp();
  };

  render() {
    if (!this.state.tokenState) {
      return utils.getRedirectComponent("/login");
    } else {
      let renderError = null;
      if (this.state.error) {
        renderError = (
          <div style={{ color: "red", display: "block" }}>
            {this.state.errorMessage}
          </div>
        );
      }
      let animation = null;
      if (this.state.isDisabled) {
        animation = (
          <Lottie options={loadingOptions} height={120} width={120} />
        );
      }
      return (
        <div>
          <div class="container">
            <div
              class="row"
              style={{ backgroundColor: "#20BF9F", color: "white" }}
            >
              <p
                style={{
                  marginLeft: "160px",
                  marginTop: "10px",
                  fontWeight: "100px",
                }}
              >
                Add an Expense
              </p>
            </div>
            <div class="row" style={{ backgroundColor: "whitesmoke" }}>
              <p style={{ margin: "10px" }}>
                With <b>you</b> and
                <img
                  style={{
                    marginLeft: "5px",
                    borderRadius: "200px",
                    marginBottom: "3px",
                  }}
                  src={this.state.groupImage}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = defaultGroupPhoto;
                  }}
                  width="20"
                  height="20"
                  alt=""
                />
                &nbsp; All of <b>{this.state.name}</b>
              </p>
            </div>
            <div class="row">
              <h1></h1>
            </div>
            <div class="row">
              <h1></h1>
            </div>
            <div class="row">
              <h1></h1>
            </div>
            <div class="row">
              <div className="col-1"></div>
              <div className="col-2"></div>
              {/* <div className="col-3">
                  <img src={description} width="100px" height="100px" alt="" />
                </div> */}
              <div className="col-9">
                <form onSubmit={this.handleSubmit} id="Login" method="POST">
                  <input
                    placeholder="Enter Description"
                    type="text"
                    id="description"
                    name="description"
                    style={{ border: "0", borderBottom: "2px dotted" }}
                    onChange={this.handleDescriptionChange}
                  ></input>
                  <div className="row">
                    <input
                      class="input-group-prepend"
                      value={this.props.currencySymbol}
                      size="3"
                      style={{
                        marginTop: "10px",
                        marginLeft: "13px",
                        marginRight: "5px",
                        border: "0",
                        marginBottom: "-13px",
                      }}
                    ></input>
                    {/* <div
                      class="input-group-prepend"
                      style={{
                        marginTop: "0px",
                        marginLeft: "0px",
                        marginRight: "0px",
                        border: "0",
                        marginBottom: "0px",
                      }}
                    >
                      <span>{this.state.currencySymbol}</span>
                    </div> */}
                    <input
                      placeholder="0.00"
                      type="number"
                      min="0"
                      size="19"
                      id="amount"
                      name="amount"
                      required
                      style={{
                        border: "0",
                        borderBottom: "2px dotted",
                        marginTop: "20px",
                        marginLeft: "-10px",
                        width: "142.5px",
                      }}
                      onChange={this.handleAmountChange}
                    ></input>
                  </div>
                  <div
                    className="row"
                    style={{
                      marginTop: "-20px",
                      height: "120px",
                      width: "120px",
                      marginLeft: "12px",
                    }}
                  >
                    {animation}
                  </div>
                  <button
                    type="submit"
                    className="btn btn-amber"
                    style={{
                      backgroundColor: "#20BF9F",
                      marginTop: "-39px",
                      marginLeft: "0px",
                    }}
                    disabled={this.state.isDisabled}
                    onSubmit={this.handleSubmit}
                  >
                    Save
                  </button>
                  <button
                    type="submit"
                    className="btn btn-danger"
                    style={{
                      backgroundColor: "red",
                      marginTop: "-39px",
                      marginLeft: "10px",
                    }}
                    onClick={this.props.closePopUp}
                  >
                    Close
                  </button>
                </form>
                {renderError}
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
    currencySymbol: state.userProfileReducer.loggedInUser.currency.symbol,
    image: state.userProfileReducer.loggedInUser.image,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    addExpense: (data) => dispatch(addExpense(data)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AddExpense);
