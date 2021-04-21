import React, { Component } from "react";
import { FaTimes } from "react-icons/fa";
import Modal from "react-modal";
import ConfirmDeleteComment from "./ConfirmDeleteComment";

// Modal Styles
const customStyles = {
  content: {
    top: "40%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    height: "150px",
    width: "550px",
    transform: "translate(-50%, -50%)",
  },
};

class Comment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isPopUpOpen: false,
    };
  }

  togglePopUp = () => {
    this.setState({
      isPopUpOpen: !this.state.isPopUpOpen,
    });
  };

  render() {
    let deleteButton = null;
    if (
      this.props.loggedInUser_id == this.props.commentDetails.commentedByUser_id
    ) {
      deleteButton = (
        <FaTimes
          style={{ color: "red", cursor: "pointer" }}
          onClick={this.togglePopUp}
        />
      );
    }

    return (
      <div>
        <div
          className="task"
          style={{
            // backgroundColor: "#f4f4f4",
            backgroundColor: "white",
            margin: "5px",
            // padding: "10px 20px",
            cursor: "pointer",
          }}
        >
          <h6
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <strong>
              {this.props.commentDetails.commentedByUserName}
              &nbsp;&nbsp;&nbsp;&nbsp;
              <span style={{ color: "#8a8f94", fontSize: "12px" }}>
                {this.props.commentDetails.time}
              </span>
            </strong>
            {deleteButton}
          </h6>
          <p>{this.props.commentDetails.comment}</p>
          <hr />
        </div>
        <div>
          <Modal
            style={customStyles}
            isOpen={this.state.isPopUpOpen}
            ariaHideApp={false}
          >
            <ConfirmDeleteComment
              commentDetails={Object.assign(
                { expense_id: this.props.expense_id },
                { group_id: this.props.group_id },
                { comment_id: this.props.commentDetails._id }
              )}
              closePopUp={this.togglePopUp}
            />
          </Modal>
        </div>
      </div>
    );
  }
}

export default Comment;
