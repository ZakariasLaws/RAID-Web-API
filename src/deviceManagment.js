import React, { Component } from 'react';

import Form from "./addDeviceForm/Form";
import form from "./addDeviceForm/deviceInputsAndHooks";
import {Utils} from "./utils";
import { Navbar, Nav, NavItem, NavDropdown, Button, FormControl } from "react-bootstrap";


import DevTools from "mobx-react-form-devtools";

DevTools.register({ form });
DevTools.select("form");

class DeviceManagement extends Component {
    constructor(props) {
        super(props);

        this.state = {
            devices: [],
            sources: [],
            targets: [],
            predictors: [],
            selection: 'sources',
        };
        this.updateDevices = this.updateDevices.bind(this);
        this.displayDevices = this.displayDevices.bind(this);
        this.updateStateDevices = this.updateStateDevices.bind(this);
    }

    displayDevices() {
        return this.state.devices.map(device => {
            return (
                <Devices title={device.title} role={device.role} />
            );
        });
    }

    updateStateDevices(devices) {
        const targets = devices.filter(device => device.role === 't');
        const sources = devices.filter(device => device.role === 's');
        const predictors = devices.filter(device => device.role === 'p');

        let sel;
        if (this.state.selection === 'sources')
            sel = sources;
        else if (this.state.selection === 'targets')
            sel = targets;
        else
            sel = predictors;

        this.setState({
            targets: targets,
            sources: sources,
            predictors: predictors,
            devices: sel,
        });
    }

    updateDevices(){
        fetch(Utils.API_URL)
            .then(Utils.handleFetchErrors)
            .then(response => response.json())
            .then(response => this.updateStateDevices(response)
        ).catch(error => console.error('Error:', error));
    }

    componentDidMount(){
        fetch(Utils.API_URL)
            .then(Utils.handleFetchErrors)
            .then(response => response.json())
            .then(devices => this.updateDevices(devices)
            ).catch(error => console.error('Error:', error));
    }

    render() {

        let devices = this.state.devices.length > 0 ? this.state.devices.map((device, i) => {
            return (
                <Devices title={device.title} role={device.role} username={device.username} key={i} id={device.id} updateDevices={this.updateDevices} ip={device.ip}/>
            );
        }) : "";
        return (
            <div className="deviceManagement-wrapper" >
                 <div className="deviceManagement-form-wrapper">
                    <h2> Add new device </h2>
                    <div className="addDeviceForm">
                        <Form form={form}/>
                    </div>
                </div>
                <div className="deviceManagement-devices">
                    <div className="devices-wrapper">
                        <Navbar bg="light" expand="lg">
                            {/*<Navbar.Brand>Toggle Plot</Navbar.Brand>*/}
                            <Navbar.Toggle aria-controls="basic-navbar-nav" />
                            <Navbar.Collapse id="basic-navbar-nav">
                                <Nav className="mr-auto">
                                    <Nav.Link onClick={() => this.setState({devices: this.state.sources, selection: 'sources'})} style={this.state.selection === 'sources' ? { fontWeight:'bold', textDecorationLine: 'underline' } : {}} ><span>Sources</span></Nav.Link>
                                    <Nav.Link onClick={() => this.setState({devices: this.state.targets, selection: 'targets'})} style={this.state.selection === 'targets' ? { fontWeight:'bold', textDecorationLine: 'underline' } : {}}><span>Targets</span></Nav.Link>
                                    <Nav.Link onClick={() => this.setState({devices: this.state.predictors, selection: 'predictors'})} style={this.state.selection === 'predictors' ? { fontWeight:'bold', textDecorationLine: 'underline' } : {}}><span>Predictors</span></Nav.Link>
                                    {/*<Nav.Link onClick={() => this.changePlot('Load Balance')}><span style={this.state.plot === 'Load Balance' ? { fontWeight:'bold', textDecorationLine: 'underline' } : {}}>Load Balance</span></Nav.Link>*/}
                                </Nav>
                            </Navbar.Collapse>
                        </Navbar>
                        { devices }
                    </div>
                    <button className="btn btn-info" onClick={this.updateDevices} ><span className="glyphicon glyphicon-refresh"></span>
                        Refresh
                    </button>

                </div>
            </div>
        );
    }
}

class Devices extends Component {
    constructor(props){
        super(props);

        this.removeDevice = this.removeDevice.bind(this);
    }


    removeDevice(event) {
        event.preventDefault();
        // Remove device
        fetch(Utils.API_URL + "/" + this.props.id, {
                method: 'DELETE',
            })
            .then(Utils.handleFetchErrors)
            .then(result => {
                this.props.updateDevices();
            }).catch(response => {
            console.log(response);
        });
    }

    render(){
        const type = this.props.role === 's' ? 'SOURCE' : this.props.role === 'p' ? 'PREDICTOR' : 'TARGET';

        return (
            <div className="card-wrapper">
                <div className="card bg-light mb-3">
                    <div className="card-header" style={{color:'#2a8fbf', fontWeight:'bold'}}>{this.props.title}</div>
                    <div className="card-body">
                        {/*<h6 className="card-title">Role: {this.props.role === 't' ? <span>Target</span> : this.props.role === 's' ? <span>Source</span> : this.props.role === 'p' ? <span>Predictor</span> : <span>Unknown</span>}</h6>*/}
                        <p className="card-text">
                            <span>{this.props.username}@{this.props.ip}</span><br/>
                            <button className="btn-danger" style={{marginTop: '10px'}} onClick={this.removeDevice}>REMOVE {type}</button>
                        </p>
                    </div>
                </div>
            </div>
        )
    }
}

export default DeviceManagement;