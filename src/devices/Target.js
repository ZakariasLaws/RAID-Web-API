import React, { Component } from 'react';
import {Button, Collapse} from 'react-bootstrap'
import {Utils} from "../utils";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from "@fortawesome/fontawesome-svg-core";
import { faAngleRight, faAngleDown } from "@fortawesome/free-solid-svg-icons";

library.add(faAngleRight, faAngleDown);

class Target extends Component {
    constructor(props){
        super(props);

        this.state = {
            running: false,
            outputFile: '~/RAID-output.log',
            extraInfoOpen: false
        };

        this.startDevice = this.startDevice.bind(this);
        this.stopDevice = this.stopDevice.bind(this);
        this.changeDropMenu = this.changeDropMenu.bind(this);
        this.updateOutputFile = this.updateOutputFile.bind(this);
        this.checkIfDeviceStopped = this.checkIfDeviceStopped.bind(this);
    }

    changeDropMenu(val){
        this.setState({extraInfoOpen: val});
    }

    updateOutputFile(e) {
        this.setState({outputFile: e.target.value});
    }

    startDevice(){
        if (!this.props.running){
            alert('Start the server first');
            return;
        }
        let params = [`-outputFile ${this.state.outputFile}`];

        this.props.startDevice(this.props.id, this.props.data.ip, this.props.data.username, this.props.data.password, 't', params)
            .then(response => {
                this.setState({running: true});
            })
            .catch(err => {
                console.log(err);
            });
    }

    stopDevice(){
        this.props.stopDevice(this.props.id, 't')
            .then(response => {
                this.checkIfDeviceStopped(this.props.id, 't', 0);
            })
            .catch(response => {
                console.log(response);
            });
    }

    checkIfDeviceStopped(id, role, counter) {
        if(counter > 20){
            console.log("Timeout stopping TARGET");
            return;
        }

        fetch(`${Utils.CONSTELLATION_URL.checkIfStopped}?role=${role}&id=${id}`)
            .then(Utils.handleFetchErrors)
            .then(response => {
                console.log("TARGET DEVICE IS STOPPED");
                this.setState({running: false});
            })
            .catch(err => {
                setTimeout(() => {
                    this.checkIfDeviceStopped(id, role, counter + 1);
                }, 2000)
            });
    }

    render() {
        // Make sure to stop if server is stopped
        if (!this.props.running && this.state.running) {
            this.stopDevice();
        }

        return (
            <div className="device-target card bg-info mb-3">
                <div className="card-header">
                    { this.state.extraInfoOpen ?
                        <button className="drop-down-button btn-dark" onClick={() => this.changeDropMenu(false)}><FontAwesomeIcon icon="angle-down"/> </button> :
                        <button className="drop-down-button btn-dark" onClick={() => this.changeDropMenu(true)}> <FontAwesomeIcon icon="angle-right"/> </button> }
                    {this.props.data.title}
                    { this.state.running ?
                            <div className="device-spinner spinner-border text-danger" role="status">
                                <span className="sr-only">Loading...</span>
                            </div> : '' }
                </div>
                <div className="card-body">
                    { this.state.extraInfoOpen ? <div>
                        <h5>IP: {this.props.data.ip}</h5>
                    </div> : ''}
                    <div className="card-text">
                        { this.state.running ?  <button className="btn-danger" onClick={this.stopDevice}>STOP</button> :
                            <button className="btn-primary" onClick={this.startDevice}>START</button> }
                    </div>
                </div>
            </div>
        )
    }
}

export default Target;