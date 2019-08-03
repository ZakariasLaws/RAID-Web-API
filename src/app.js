import React, { Component } from 'react'
import ReactDOM from 'react-dom'

import './styles/home.scss'
import SideBar from "./sidebar"
import Content from "./Content";

class App extends Component {
    constructor(props) {
        super(props);

        this.state={view: 'deviceManagement'};

        this.changeView = this.changeView.bind(this);
    }

    changeView(newView) {
        this.setState(
            {
                view: newView
            }
        );
    }

    render() {
        return (
            <div className="wrapper">
                <SideBar content={<Content view={this.state.view} changeView={this.changeView}/>} changeView={this.changeView}/>
            </div>
        )
    }
}

ReactDOM.render(<App />, document.getElementById('root'));