import React from "react";
import Axios from "axios";
import { Link } from "react-router-dom";

import "../App.css";

class SelectTeam extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [],
      isLoaded: false,
      currentSelection: "",
      hasBeenSelectedHome: 0,
      hasBeenSelectedAway: 0,
      fixes: [],
      username: this.props.location.state.username,
    };
  }

  componentDidMount() {
    const week = 7;
    const key = process.env.REACT_APP_API_KEY;
    const secret = process.env.REACT_APP_API_SECRET_KEY;
    const url = `https://cors-anywhere.herokuapp.com/livescore-api.com/api-client/fixtures/matches.json?competition_id=2&round=${week}&key=${key}&secret=${secret}`;
    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        this.setState({
          isLoaded: true,
          fixtureList: json.data.fixtures,
        });
      })
      .then(() => {
        let homeSelected = 0;
        let awaySelected = 0;
        this.state.fixtureList.forEach((fixture) => {
          let toBeReversed = false;
          if (fixture.home_name > fixture.away_name) {
            //database query returns teams in alphabetical order, need to reverse if away team first in alphabet
            toBeReversed = true;
          }
          Axios.get("http://localhost:3001/api/get", {
            params: {
              homeName: fixture.home_name,
              awayName: fixture.away_name,
            },
          })
            .then((response) => {
              if (toBeReversed) {
                homeSelected = response.data[1][this.state.username];
                awaySelected = response.data[0][this.state.username];
              } else {
                homeSelected = response.data[0][this.state.username];
                awaySelected = response.data[1][this.state.username];
              }
              this.setState({
                hasBeenSelectedHome: homeSelected,
                hasBeenSelectedAway: awaySelected,
              });
            })
            .then(() => {
              this.setState({
                fixes: this.state.fixes.concat({
                  id: fixture.id,
                  date: fixture.date,
                  time: fixture.time,
                  home_name: fixture.home_name,
                  away_name: fixture.away_name,
                  hasBeenSelectedHome: this.state.hasBeenSelectedHome,
                  hasBeenSelectedAway: this.state.hasBeenSelectedAway,
                }),
              });
            });
        });
      });
  }

  submitTeam = () => {
    Axios.post("http://localhost:3001/api/insert", {
      username: this.props.location.state.username,
      teamName: this.state.currentSelection,
    }).then(() => {
      alert("successful insert");
    });
  };

  render() {
    var { isLoaded, fixes, currentSelection } = this.state;
    if (!isLoaded) {
      return <div>Loading...</div>;
    } else {
      return (
        <div className="SelectTeam">
          <p>Welcome {this.state.username}</p>
          <h1>This Weeks Fixtures</h1>
          <ul>
            {fixes.map((fixture) => (
              <li className="fixturesList" key={fixture.id}>
                {fixture.date} - {fixture.time}
                <button
                  onClick={() => {
                    this.setState({ currentSelection: fixture.home_name });
                  }}
                  className="btn btn-secondary btn-sm mr-1 ml-1"
                  disabled={fixture.hasBeenSelectedHome}
                >
                  {fixture.home_name}
                </button>
                vs
                <button
                  onClick={() => {
                    this.setState({ currentSelection: fixture.away_name });
                  }}
                  className="btn btn-secondary btn-sm mr-1 ml-1"
                  disabled={fixture.hasBeenSelectedAway}
                >
                  {fixture.away_name}
                </button>
              </li>
            ))}
          </ul>
          Current Selection: {currentSelection}
          <Link
            to={{
              pathname: "/submit",
              className: "btn btn-secondary btn-sm",
              state: {
                selection: currentSelection,
              },
            }}
          >
            <button
              onClick={this.submitTeam}
              disabled={!this.state.currentSelection}
              className="btn btn-primary btn-sm ml-1"
            >
              Submit
            </button>
          </Link>
        </div>
      );
    }
  }
}

export default SelectTeam;