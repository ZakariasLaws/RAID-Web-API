import React, { Component } from 'react'
import ReactDOM from 'react-dom'

import './styles/home.scss'
import SideBar from "./sidebar"
import Content from "./Content";
import {Utils} from "./utils";

class App extends Component {
    constructor(props) {
        super(props);

        this.state={
            view: Utils.views.home,
            running: false,
        };

        this.changeView = this.changeView.bind(this);
        this.updateRunning = this.updateRunning.bind(this);
    }

    changeView(newView) {
        if (this.state.running) {
            alert("Stop current Constellation instance first");
            return;
        }
        this.setState(
            {
                view: newView
            }
        );
    }

    updateRunning(newVal){
        this.setState({running: newVal});
    }

    render() {
        return (
            <div className="wrapper">
                <div className="main-title"><h1 className="elegantshd">Resource Aware Inference Distribution</h1></div>
                <SideBar content={<Content view={this.state.view} changeView={this.changeView} running={this.state.running} updateRunning={this.updateRunning}/>} changeView={this.changeView}/>
            </div>
        )
    }
}

ReactDOM.render(<App />, document.getElementById('root'));