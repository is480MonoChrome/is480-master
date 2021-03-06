var React = require('react');
var Nav = require('Nav');
var SensorDetails = require('SensorDetails');
var Dashboard = require('Dashboard');
import firebase from 'app/firebase/';
import { NotificationStack, Notification } from 'react-notification';
import { OrderedSet } from 'immutable';

class NotificationBar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      notifications: OrderedSet(),
      count: 0
    };

    this.removeNotification = this.removeNotification.bind(this);
  }

  removeNotification (count) {
    const { notifications } = this.state;
    this.setState({
      notifications: notifications.filter(n => n.key !== count)
    })
  }

  componentWillReceiveProps(nextProps) {

    var currentTime = this.props.timestamp;

    const { notifications, count } = this.state;
    const id = notifications.size + 1;
    const newCount = count + 1;

    // console.log("nextProps: ", nextProps.notificationData);

    if(nextProps.notificationData !== this.props.notificationData && nextProps.notificationData.length > 0) {
      this.setState({
        count: newCount,
        notifications: notifications.add({
          title: nextProps.notificationData[0].mac,
          message: ` | ${nextProps.notificationData[0].problem.status} | ${nextProps.notificationData[0].timestamp.date}`,
          key: newCount,
          action: 'Dismiss',
          dismissAfter: 100000,
          onClick: () => this.removeNotification(newCount),
        })
      });
    }
  }

  render () {
    return (

        <NotificationStack
          notifications={this.state.notifications.toArray()}
          onDismiss={notification => this.setState({
            notifications: this.state.notifications.delete(notification)
          })}/>
    );
  }
}

class Main extends React.Component {

constructor(props) {
    super(props);

    this.state = {
        overall: [],
        bfg: [],
        notifications: [],
        sensorHealthOverviewV2: [],
        currentTime: '-',
        userDisplayName: '',
        notificationData: {}
    }
}

componentDidMount() {
    $(document).foundation();
    var that = this;

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            that.setState({userDisplayName: user.displayName});
        }
    }, function(error) {
        console.warn(error);
    });

    var connection = new ab.Session('ws://devfour.sence.io:9000', function() {
        connection.subscribe('', function(topic, data) {

            var timestamp = new Date().toLocaleString();

            console.log("hua la la la la", data);

            that.setState({
              overall: data.overall,
              sensorHealthOverviewV2: data.overview,
              bfg: data.BFG,
              currentTime: timestamp
            });

            if (data.notifications === undefined) {
              that.setState({
                notifications: {}
              });
            } else {
              that.setState({
                notifications: data.notifications
              });
            }
        });

    }, function() {
        console.warn('WebSocket connection closed: all data unavailable');
    }, {'skipSubprotocolCheck': true});

}

render() {
    // console.log("overall: ", this.state.overall);
    console.log("bfg: ", this.state.bfg);
    // console.log("notifications: ", this.state.notifications);
    // console.log("sensorHealthOverviewV2: ", this.state.sensorHealthOverviewV2);

    var iframeLink = "./offCrepe.html?";

    return (
        <div>

            <div className="off-canvas-wrapper">
                <div className="off-canvas-wrapper-inner" data-off-canvas-wrapper>
                    <div className="off-canvas position-right" data-position="right" id="offCanvas" data-off-canvas style={{
                        padding: 0
                    }}>
                        <div id="sensorDetails"></div>
                        <iframe id="sensorDetailsIFrame" src={iframeLink} width="350px" style={{
                            border: "none"
                        }} height="99%"></iframe>
                    </div>

                    <div className="off-canvas-content" data-off-canvas-content>
                        <Nav timestamp={this.state.currentTime}/>
                        <div className="row">
                            <div className="columns medium-12 large 12">
                              <Dashboard timestamp={this.state.currentTime}
                                          displayName={this.state.userDisplayName}
                                          overall={this.state.overall}
                                          bfg={this.state.bfg}
                                          notificationData={this.state.notifcations}
                                          sensorHealthOverviewV2={this.state.sensorHealthOverviewV2}/>
                            </div>
                        </div>
                        <NotificationBar notificationData={this.state.notifications} timestamp={this.state.currentTime}/>
                    </div>
                </div>
            </div>
        </div>
    );
}
};

module.exports = Main;
