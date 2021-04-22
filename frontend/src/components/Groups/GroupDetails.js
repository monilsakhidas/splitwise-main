import React, { Component } from "react";
import utils from "../../utils/utils";
import cookie from "react-cookies";
import AddExpense from "./AddExpense";
import Modal from "react-modal";
import defaultProfileImage from "../../images/profile_placeholder.jpg";
import defaultGroupPhoto from "../../images/splitwise-logo.png";
import { Accordion, Card } from "react-bootstrap";
import { connect } from "react-redux";
import { getGroupDetails, setError } from "../../redux/actions/groupDetails";
import Comment from "./Comment";
import NewComment from "./NewComment";

const customStyles = {
  content: {
    top: "40%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    height: "400px",
    width: "500px",
    transform: "translate(-50%, -50%)",
  },
};

class GroupDetails extends Component {
  constructor(props) {
    super(props);
    const [tokenState, _, __, loggedInUserId] = utils.isJWTValid(
      cookie.load("jwtToken")
    );
    if (this.props.location.state) {
      this.state = {
        tokenState,
        loggedInUserId,
        _id: this.props.location.state.groupDetails._id,
        name: this.props.location.state.groupDetails.name,
        groupBalances: [],
        groupExpenses: [],
        image: this.props.location.state.groupDetails.image,
        loans: [],
        isPopUpOpen: false,
        outOfState: false,
      };
    } else {
      this.setState({
        outOfState: true,
      });
    }
  }

  resetCommentStatus = () => {
    this.props.setError({ errorMessage: null, error: null });
  };

  togglePopUp = () => {
    this.setState({
      isPopUpOpen: !this.state.isPopUpOpen,
    });
  };
  componentDidMount = async () => {
    this.props.getGroupDetails(this.state._id);
  };

  render() {
    if (!this.state) {
      return utils.getRedirectComponent("/login");
    }
    if (!this.state.tokenState) {
      return utils.getRedirectComponent("/login");
    } else if (this.state.outOfState) {
      return utils.getRedirectComponent("/groups/mygroups");
    } else {
      let groupBalances = null;
      let groupExpenses = null;
      let groupDebts = null;
      if (this.props.loans && this.props.loans.length != 0) {
        groupDebts = this.props.loans.map((loan) => {
          return (
            <div>
              <div class="card-content">
                <div class="card-body cleartfix">
                  <div class="media align-items-stretch">
                    <div class="row">
                      <div class="col-sm-4">
                        <img
                          height="80px"
                          width="80px"
                          style={{ borderRadius: "150px" }}
                          src={
                            loan.loaneeImage == null
                              ? utils.getProfileImageUrl()
                              : utils.getProfileImageUrl(loan.loaneeImage)
                          }
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = defaultProfileImage;
                          }}
                        />
                      </div>
                      <div class="col-sm-8">
                        <div
                          style={{
                            marginLeft: "0px",
                            marginTop: "10px",
                          }}
                        >
                          <h5>{loan.loaneeName}</h5>
                          <span
                            style={{
                              color: "orange",
                            }}
                          >
                            owes&nbsp;
                            <h10 style={{ color: "black" }}>
                              {loan.loanerName}
                            </h10>
                            &nbsp;
                            {loan.amount}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        });
      } else {
        groupDebts = (
          <div style={{ margin: "210px" }}>
            <h4 style={{ font: "Bookman" }}></h4>
          </div>
        );
      }
      if (this.props.groupBalances && this.props.groupBalances.length != 0) {
        groupBalances = this.props.groupBalances.map((userBalance) => {
          return (
            <div>
              <div class="card-content">
                <div class="card-body cleartfix">
                  <div class="media align-items-stretch">
                    <div class="row">
                      <div class="col-sm-4">
                        <img
                          height="80px"
                          width="80px"
                          style={{ borderRadius: "150px" }}
                          src={
                            userBalance.image == null
                              ? utils.getProfileImageUrl()
                              : utils.getProfileImageUrl(userBalance.image)
                          }
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = defaultProfileImage;
                          }}
                        />
                      </div>
                      <div class="col-sm-8">
                        <div style={{ marginLeft: "23px", marginTop: "10px" }}>
                          <h5>{userBalance.name}</h5>
                          <span
                            style={{
                              color: userBalance.groupStatement.includes("get")
                                ? "#20BF9F"
                                : "orange",
                            }}
                          >
                            {userBalance.groupStatement}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        });
      } else {
        groupBalances = (
          <div style={{ margin: "210px" }}>
            <h4 style={{ font: "Bookman" }}></h4>
          </div>
        );
      }
      if (this.props.groupExpenses && this.props.groupExpenses.length != 0) {
        groupExpenses = this.props.groupExpenses.map((expense) => {
          // Generate comments and add new comment schema
          let comments = null;
          if (expense && expense.comments && expense.comments.length != 0) {
            comments = expense.comments.map((comment) => {
              return (
                <Comment
                  key={comment._id}
                  commentDetails={comment}
                  loggedInUser_id={this.props.loggedInUser_id}
                  expense_id={expense._id}
                  group_id={this.state._id}
                />
              );
            });
          }
          return (
            <Card>
              <Accordion.Toggle
                as={Card.Header}
                eventKey={expense._id}
                onClick={this.resetCommentStatus}
              >
                <div className="row">
                  <div className="card" style={{ borderWidth: "0px" }}>
                    <div
                      class="card-horizontal"
                      style={{
                        display: "flex",
                        flex: "1 1 auto",
                        width: "400px",
                      }}
                    >
                      <div
                        className="img-square-wrapper"
                        style={{ backgroundColor: "whitesmoke" }}
                      >
                        <img
                          height="100px"
                          width="100px"
                          style={{
                            borderRadius: "200px",
                            marginTop: "12px",
                            marginLeft: "16px",
                          }}
                          src={
                            expense.image == null
                              ? utils.getProfileImageUrl()
                              : utils.getProfileImageUrl(expense.image)
                          }
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = defaultProfileImage;
                          }}
                        />
                      </div>
                      <div
                        class="card-body"
                        style={{ backgroundColor: "whitesmoke" }}
                      >
                        <h4
                          class="card-title"
                          style={{ width: "600px", fontSize: "25px" }}
                        >
                          {expense.description}
                        </h4>
                        <p class="card-text">
                          <div
                            style={{
                              color:
                                expense.user_id !== this.state.loggedInUserId
                                  ? "orange"
                                  : "#20BF9F",
                              width: "600px",
                              fontSize: "20px",
                            }}
                          >
                            {expense.user_id != this.state.loggedInUserId
                              ? expense.paidByUserName +
                                " paid " +
                                expense.amount
                              : "You paid " + expense.amount}
                            <br />
                          </div>
                          <div>
                            <small class="text-muted">{expense.time}</small>
                          </div>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Accordion.Toggle>
              <Accordion.Collapse eventKey={expense._id}>
                <Card.Body>
                  {comments}
                  <NewComment
                    key={expense._id}
                    expense_id={expense._id}
                    loggedInUser_id={this.props.loggedInUser_id}
                    currentGroup_id={this.state._id}
                  />
                </Card.Body>
              </Accordion.Collapse>
            </Card>
          );
        });
      } else {
        groupExpenses = (
          <div
            style={{
              marginLeft: "220px",
              marginTop: "270px",
            }}
          >
            <h4 style={{ font: "Bookman" }}>No Expenses recorded yet!</h4>
          </div>
        );
      }
      return (
        <div>
          <div className="row">
            <div className="col-3">{groupDebts}</div>
            <div className="col-6">
              <div
                className="row"
                style={{
                  backgroundColor: "whitesmoke",
                  height: "70px",
                  borderBottom: "1px solid #ddd",
                  borderRight: "1px solid #ddd",
                  borderLeft: "1px solid #ddd",
                }}
              >
                <div class="col-1">
                  <img
                    height="50px"
                    width="50px"
                    style={{
                      borderRadius: "50px",
                      marginTop: "10px",
                    }}
                    src={this.state.image}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = defaultGroupPhoto;
                    }}
                  />
                </div>
                <div
                  class="col-8"
                  style={{
                    fontSize: "27px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ marginTop: "15px" }}>{this.state.name}</div>
                </div>
                <div class="col-3">
                  <button
                    className="btn large btn orange"
                    style={{
                      marginBottom: "-42px",
                      marginLeft: "30px",
                      backgroundColor: "#FF652F",
                      color: "white",
                    }}
                    onClick={this.togglePopUp}
                  >
                    Add Expense
                  </button>
                  <div style={{ height: "100px" }}>
                    <Modal
                      style={customStyles}
                      isOpen={this.state.isPopUpOpen}
                      ariaHideApp={false}
                    >
                      <AddExpense
                        groupDetails={this.state}
                        closePopUp={this.togglePopUp}
                      />
                    </Modal>
                  </div>
                </div>
              </div>
              <Accordion>{groupExpenses}</Accordion>
            </div>
            <div className="col-3">{groupBalances}</div>
          </div>
        </div>
      );
    }
  }
}

const mapStateToProps = (state) => {
  return {
    loggedInUser_id: state.userProfileReducer.loggedInUser._id,
    groupBalances: state.groupDetailsReducer.groupBalances,
    groupExpenses: state.groupDetailsReducer.groupExpenses,
    loans: state.groupDetailsReducer.groupDebts,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getGroupDetails: (data) => dispatch(getGroupDetails(data)),
    setError: (data) => dispatch(setError(data)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(GroupDetails);
