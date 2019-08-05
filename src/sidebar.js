import React, { Component } from 'react';
import Sidebar from "react-sidebar";

class SideBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sidebarOpen: false
        };
        this.onSetSidebarOpen = this.onSetSidebarOpen.bind(this);
    }

    onSetSidebarOpen(open) {
        this.setState({ sidebarOpen: open });
    }

    render(){
        return (
            <Sidebar
                sidebar={<SideBarContent changeView={this.props.changeView} setSidebarOpen={this.onSetSidebarOpen}/>}
                open={this.state.sidebarOpen}
                onSetOpen={this.onSetSidebarOpen}
                styles={{ sidebar: { background: "white" } }}
            >
                { this.state.sidebarOpen ? '' : <button className="btn menu-button btn-dark" onClick={() => this.onSetSidebarOpen(true)}>
                    Menu
                </button> }

                {this.props.content}
            </Sidebar>
        );
    }
}


class SideBarContent extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="sidebar-wrapper" >
                <h2> Menu </h2>
                <button type="button" className="sidebar-item btn btn-primary" onClick={() => { this.props.changeView('home'); this.props.setSidebarOpen(false)}}> Home </button>
                <button type="button" className="sidebar-item btn btn-primary" onClick={() => { this.props.changeView('deviceManagement'); this.props.setSidebarOpen(false)}}> Devices </button>
            </div>
        );
    }
}

export default SideBar;