import React, { Component } from "react";
import { deleteComment } from "../../redux/actions/groupDetails";
import { connect } from "react-redux";

class ConfirmDeleteComment extends Component {
  constructor(props) {
    super(props);
  }

  deleteComment = () => {
    console.log(this.props);
    this.props.deleteComment(this.props.commentDetails);
    this.props.closePopUp();
  };

  render() {
    return (
      <div class="container">
        <div class="row">
          <div class="col-11">
            <h3>
              <strong>Confirm Delete?</strong>
            </h3>
            <hr></hr>
          </div>
          <div class="col-1" style={{ textAlign: "right" }}>
            <button
              class="btn btn-primary"
              style={{ backgroundColor: "#ed752f", border: "none" }}
              onClick={this.props.closePopUp}
            >
              <i class="fa fa-times button"></i>
            </button>
          </div>
        </div>
        <div class="row">
          &nbsp;&nbsp;&nbsp;&nbsp;
          <button
            class="btn btn-primary"
            style={{
              marginBottom: "10px",
              backgroundColor: "#59cfa7",
              border: "none",
            }}
            onClick={this.deleteComment}
          >
            <strong>Delete</strong>
          </button>
          &nbsp;&nbsp;&nbsp;
          <button
            class="btn btn-primary"
            style={{
              marginBottom: "10px",
              backgroundColor: "#ed752f",
              border: "none",
            }}
            onClick={this.props.closePopUp}
          >
            <strong>Cancel</strong>
          </button>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {};
};

const mapDisptachToProps = (dispatch) => {
  return {
    deleteComment: (data) => dispatch(deleteComment(data)),
  };
};

export default connect(
  mapStateToProps,
  mapDisptachToProps
)(ConfirmDeleteComment);
