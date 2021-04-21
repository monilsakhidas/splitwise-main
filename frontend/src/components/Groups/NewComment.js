import React, { Component } from "react";
import { connect } from "react-redux";
import { addComment, setError } from "../../redux/actions/groupDetails";

class NewComment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      comment: "",
      wasPageJustRefreshed: true,
    };
  }

  handleCommentChange = (onCommentChange) => {
    if (/[~`!%\^\-\[\]\\';/{}|\\"<>\?]/g.test(onCommentChange.target.value)) {
      this.props.setError({
        error: true,
        errorMessage: "Comment should not contain special characters",
      });
      this.setState({
        [onCommentChange.target.name]: "",
        wasPageJustRefreshed: false,
      });
    } else {
      this.props.setError({ error: null, errorMessage: null });
      this.setState({
        comment: onCommentChange.target.value,
        wasPageJustRefreshed: false,
      });
    }
  };

  handleSubmit = async (onSubmitEvent) => {
    onSubmitEvent.preventDefault();
    this.props.addComment({
      group_id: this.props.currentGroup_id,
      expense_id: this.props.expense_id,
      comment: this.state.comment,
    });
    this.setState({
      comment: "",
    });
  };

  render() {
    let renderError = null;
    if (this.props.error) {
      renderError = (
        <div style={{ color: "red", display: "block", marginLeft: "0px" }}>
          {this.props.errorMessage}
        </div>
      );
    }
    return (
      <div>
        <form method="post" onSubmit={this.handleSubmit}>
          <div class="row">
            <div class="col-7">
              <div class="row">
                <div class="col-5">
                  <strong>Add a comment:</strong>
                  <div class="mb-3">
                    <textarea
                      class="form-control"
                      id="exampleFormControlTextarea1"
                      rows="2"
                      style={{ fontSize: "1.2em", width: "500px" }}
                      onChange={this.handleCommentChange}
                      required
                      value={this.state.comment}
                    />
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-2">
                  <button
                    className="btn large btn orange"
                    style={{
                      backgroundColor: "#FF652F",
                      color: "white",
                    }}
                    type="submit"
                    onSubmit={this.handleSubmit}
                    disabled={this.props.error}
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
        {renderError}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    error: state.groupDetailsReducer.error,
    errorMessage: state.groupDetailsReducer.errorMessage,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    addComment: (data) => dispatch(addComment(data)),
    setError: (data) => dispatch(setError(data)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(NewComment);
