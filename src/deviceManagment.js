import React, { Component } from 'react';

import Form from "./addDeviceForm/Form";
import form from "./addDeviceForm/deviceInputsAndHooks";
import {Utils} from "./utils";

import DevTools from "mobx-react-form-devtools";

DevTools.register({ form });
DevTools.select("form");

class DeviceManagement extends Component {
    constructor(props) {
        super(props);

        this.state = {
            devices: []
        };
        this.updateDevices = this.updateDevices.bind(this);
        this.displayDevices = this.displayDevices.bind(this);
    }

    displayDevices() {
        return this.state.devices.map(device => {
            return (
                <Devices title={device.title} role={device.role} />
            );
        });
    }

    updateDevices(){
        fetch(Utils.API_URL)
            .then(response => response.json())
            .then(response => this.setState({devices: response})
        ).catch(error => console.error('Error:', error));
    }

    componentDidMount(){
        this.updateDevices();
    }

    render() {

        let devices = this.state.devices.length > 0 ? this.state.devices.map((device, i) => {
            return (
                <Devices title={device.title} role={device.role} key={i} id={device.id} updateDevices={this.updateDevices} ip={device.ip}/>
            );
        }) : "";
        return (
            <div className="deviceManagement-wrapper" >
                <div className="main-title"><h1 className="elegantshd">Device Management</h1></div>
                <div className="deviceManagement-form-wrapper">
                    <h2> Add new device </h2>
                    <div className="addDeviceForm">
                        <Form form={form} />
                    </div>
                </div>
                <div className="deviceManagement-devices">
                    <div className="devices-wrapper">
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
            .then(result => {
                this.props.updateDevices();
            }).catch(response => {
            console.log(response);
        });
    }

    render(){
        return (
            <div className="card-wrapper">
                <div className="card bg-light mb-3">
                    <div className="card-header">{this.props.title}</div>
                    <div className="card-body">
                        <h6 className="card-title">Role: {this.props.role === 't' ? <span>Target</span> : this.props.role === 's' ? <span>Source</span> : this.props.role === 'p' ? <span>Predictor</span> : <span>Unknown</span>}</h6>
                        <p className="card-text">
                            <span>IP: {this.props.ip}</span><br/>
                            <button className="btn-danger" onClick={this.removeDevice}>REMOVE</button>
                        </p>
                    </div>
                </div>
            </div>
        )
    }
}

export default DeviceManagement;