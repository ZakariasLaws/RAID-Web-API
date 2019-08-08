import React, { Component } from 'react';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Utils} from "../utils";

class Predictor extends Component {
    constructor(props){
        super(props);

        this.state = {
            running: false,
            contexts: '',
            extraInfoOpen: false
        };

        this.startDevice = this.startDevice.bind(this);
        this.stopDevice = this.stopDevice.bind(this);
        this.changeDropMenu = this.changeDropMenu.bind(this);
        this.updateContexts = this.updateContexts.bind(this);
        this.checkIfDeviceStopped = this.checkIfDeviceStopped.bind(this);
    }

    changeDropMenu(val){
        this.setState({extraInfoOpen: val});
    }

    updateContexts(e) {
        this.setState({contexts: e.target.value});
    }

    startDevice(){
        if (!this.props.running){
            alert('Start the server first');
            return;
        } else if (this.state.contexts === '') {
            alert("Select at least one context");
            return;
        }
        let params = `-context ${this.state.contexts.split(" ").join(',')}`;

        this.props.startDevice(this.props.id, this.props.data.ip, this.props.data.username, this.props.data.password, 'p', params)
            .then(response => {
                this.setState({running: true});
            })
            .catch(err => {
                console.log(err);
            });
    }

    stopDevice(){
        this.props.stopDevice(this.props.id, 'p')
            .then(response => {
                this.checkIfDeviceStopped(this.props.id, 't', 0);
            })
            .catch(response => {
                console.log(response);
            });
    }


    checkIfDeviceStopped(id, role, counter) {
        if(counter > 30){
            console.log("Timeout stopping PREDICTOR");
            return;
        }

        fetch(`${Utils.CONSTELLATION_URL.checkIfStopped}?role=${role}&id=${id}`)
            .then(Utils.handleFetchErrors)
            .then(response => {
                console.log("PREDICTOR DEVICE IS STOPPED");
                this.setState({running: false});
            })
            .catch(err => {
                setTimeout(() => {
                    this.checkIfDeviceStopped(id, role, counter + 1);
                }, 1500)
            });
    }

    render() {
        // Make sure to stop if server is stopped
        if (!this.props.running && this.state.running) {
            this.stopDevice();
        }

        return (
            <div className="device-predictor card text-white bg-success mb-3">
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
                        <h5 className="card-title">Contexts: <input value={this.state.contexts} onChange={this.updateContexts}/></h5>
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

export default Predictor;