import React, { Component } from "react";
import utils from "../../utils/utils";
import config from "../../config/config";
import cookie from "react-cookies";
import axios from "axios";
import Select from "react-select";
import defaultProfileImage from "../../images/profile_placeholder.jpg";
import ReactPaginate from "react-paginate";
import { connect } from "react-redux";
import { getRecentActiviy } from "../../redux/actions/recentActivity";
class RecentActivity extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tokenState: utils.isJWTValid(cookie.load("jwtToken"))[0],
      selectedOrder: 1,
      selectedGroupId: 0,
      selectedPageSize: 2,
      selectedPageNumber: 1,
      groups: [{ label: "All groups", value: 0 }],
    };
  }

  handleGroupChange = async (onGroupChangeEvent) => {
    const newGroup = onGroupChangeEvent.value;
    const payload = {
      selectedGroupId: newGroup,
      selectedOrder: this.state.selectedOrder,
      selectedPageSize: this.state.selectedPageSize,
      selectedPageNumber: this.state.selectedPageNumber,
    };
    this.props.getRecentActiviy(payload);
    // Set state
    this.setState({
      selectedGroupId: newGroup,
    });
  };

  handlePageClick = async (e) => {
    const newPageNumber = e.selected + 1;
    const payload = {
      selectedGroupId: this.state.selectedGroupId,
      selectedOrder: this.state.selectedOrder,
      selectedPageSize: this.state.selectedPageSize,
      selectedPageNumber: newPageNumber,
    };
    this.props.getRecentActiviy(payload);
    // Set state
    this.setState({
      selectedPageNumber: newPageNumber,
    });
  };

  handleOrderingChange = async (onOrderChangeEvent) => {
    const newOrder = onOrderChangeEvent.value;
    const payload = {
      selectedGroupId: this.state.selectedGroupId,
      selectedOrder: newOrder,
      selectedPageSize: this.state.selectedPageSize,
      selectedPageNumber: this.state.selectedPageNumber,
    };
    this.props.getRecentActiviy(payload);

    this.setState({
      selectedOrder: newOrder,
    });
  };

  handlePageSizeChange = async (onPageSizeChangeEvent) => {
    const newPageSize = onPageSizeChangeEvent.value;
    const payload = {
      selectedGroupId: this.state.selectedGroupId,
      selectedOrder: this.state.selectedOrder,
      selectedPageSize: newPageSize,
      selectedPageNumber: 1,
    };
    this.props.getRecentActiviy(payload);
    //Set state
    this.setState({
      selectedPageSize: newPageSize,
      selectedPageNumber: 1,
    });
  };

  componentDidMount = async () => {
    try {
      // Find all groups of the logged in user
      const response = await axios.get(
        config.BACKEND_URL + "/groups/mygroups",
        {
          headers: utils.getJwtHeader(cookie.load("jwtToken")),
        }
      );
      const myGroupOptions = response.data.groups.map((group) => {
        return {
          label: group.name,
          value: group._id,
        };
      });

      // Find activities across all groups sorted by most recent first
      const payload = {
        selectedGroupId: this.state.selectedGroupId,
        selectedOrder: this.state.selectedOrder,
        selectedPageSize: this.state.selectedPageSize,
        selectedPageNumber: this.state.selectedPageNumber,
      };
      this.props.getRecentActiviy(payload);
      // Set state
      this.setState({
        groups: [...this.state.groups, ...myGroupOptions],
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
  };

  render() {
    if (!this.state.tokenState) {
      return utils.getRedirectComponent("/login");
    } else {
      let activityCards = null;
      let paginationBar = null;
      if (
        this.props.activities == null ||
        (this.props.activities && this.props.activities.length == 0)
      ) {
        activityCards = (
          <div style={{ marginTop: "230px", marginLeft: "370px" }}>
            <h4 style={{ font: "Bookman" }}>No recent activity</h4>
          </div>
        );
      } else {
        paginationBar = (
          <div
            class="row"
            style={{
              width: "50%",
              marginTop: "100px",
              marginLeft: "370px",
              paddingLeft: "0px",
            }}
          >
            <ReactPaginate
              previousLabel={"prev"}
              nextLabel={"next"}
              breakLabel={"..."}
              breakClassName={"break-me"}
              pageCount={this.props.totalPages}
              marginPagesDisplayed={2}
              pageRangeDisplayed={5}
              onPageChange={this.handlePageClick}
              containerClassName={"pagination"}
              subContainerClassName={"pages pagination"}
              activeClassName={"active"}
              forcePage={this.state.selectedPageNumber - 1}
            />
          </div>
        );
        activityCards = this.props.activities.map((activity) => {
          return (
            <div
              className="row"
              style={{
                borderBottom: "1px solid #ddd",
                borderLeft: "1px solid #ddd",
              }}
            >
              <div className="card" style={{ borderWidth: "0px" }}>
                <div
                  class="card-horizontal"
                  style={{ display: "flex", flex: "1 1 auto" }}
                >
                  <div className="img-square-wrapper">
                    <img
                      height="80px"
                      width="80px"
                      style={{
                        borderRadius: "80px",
                        marginTop: "12px",
                        marginLeft: "16px",
                      }}
                      src={
                        activity.image == null
                          ? utils.getProfileImageUrl()
                          : utils.getProfileImageUrl(activity.image)
                      }
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = defaultProfileImage;
                      }}
                    />
                  </div>
                  <div class="card-body">
                    <h4 class="card-title">{activity.description}</h4>
                    <p class="card-text">
                      {/* <div
                        style={{
                          color:
                            activity.balanceStatement.indexOf("get") == -1
                              ? activity.balanceStatement.indexOf(
                                  "transactions"
                                ) == -1
                                ? "orange"
                                : "black"
                              : "#20BF9F",
                        }}
                      >
                        {activity.balanceStatement}
                        <br />
                      </div> */}
                      <div
                        style={{
                          color:
                            activity.expenseStatement &&
                            activity.expenseStatement.indexOf("get") == -1
                              ? "orange"
                              : "#20BF9F",
                        }}
                      >
                        {activity.expenseStatement}
                        <br />
                      </div>
                      <div>
                        <small class="text-muted">{activity.time}</small>
                      </div>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        });
      }
      return (
        <div>
          <div className="row">
            <div className="col-4" style={{ textAlign: "left" }}>
              <div className="row">
                <div className="col-12" style={{ marginTop: "10px" }}>
                  <Select
                    options={this.state.groups}
                    placeholder="Select group"
                    onChange={this.handleGroupChange}
                  />
                </div>
                <div className="col-12" style={{ marginTop: "10px" }}>
                  <Select
                    options={[
                      { label: "Most recent first", value: 1 },
                      { label: "Least recent first", value: 2 },
                    ]}
                    placeholder="Select order by"
                    onChange={this.handleOrderingChange}
                  />
                </div>
                <div className="col-12" style={{ marginTop: "10px" }}>
                  <Select
                    options={[
                      { label: "Two Activities per page", value: 2 },
                      { label: "Five Activities per page", value: 5 },
                      { label: "Ten Activities per page", value: 10 },
                    ]}
                    placeholder="Select page size"
                    onChange={this.handlePageSizeChange}
                  />
                </div>
              </div>
            </div>
            <div className="col-8">
              <div
                className="row"
                style={{
                  backgroundColor: "whitesmoke",
                  height: "70px",
                  borderBottom: "1px solid #ddd",
                  borderLeft: "1px solid #ddd",
                }}
              >
                <div
                  style={{
                    marginLeft: "20px",
                    marginTop: "14px",
                  }}
                >
                  <h2>Recent Activity</h2>
                </div>
              </div>
              {activityCards}
              {paginationBar}
              {/* <div
                class="card-footer"
                style={{ height: "10px", borderWidth: "0px" }}
              >
              </div> */}
            </div>
          </div>
        </div>
      );
    }
  }
}

const mapStateToProps = (state) => {
  return {
    activities: state.recentActivityReducer.activities,
    totalPages: state.recentActivityReducer.totalPages,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getRecentActiviy: (data) => dispatch(getRecentActiviy(data)),
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(RecentActivity);
