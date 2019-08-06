import React, { Component } from 'react';
import {Utils} from "../utils";

class Target extends Component {
    constructor(props){
        super(props);

        this.state = {
            running: false,
            contexts: [],
            binDir: Utils.ODROID_BIN_DIR,
        };

        this.startDevice = this.startDevice.bind(this);
        this.stopDevice = this.stopDevice.bind(this);
    }

    startDevice(){
        if (!this.props.running){
            alert('Start the server first');
            return;
        }

        let params = [];

        this.props.startDevice(this.props.id, this.props.data.ip, this.props.data.username, this.props.data.password, this.state.binDir, this.state.contexts, params)
            .then(response => {
                this.setState({running: true});
            })
            .catch(err => {
                console.log(err);
            });
    }

    stopDevice(){
        this.props.stopDevice(this.props.id)
            .then(response => {
                this.setState({running: false});
            })
            .catch(response => {
                console.log(response);
            });
    }

    render() {
        return (
            <div className="device-target card bg-info mb-3">
                <div className="card-header">
                    {this.props.data.title}
                    { this.state.running ?
                            <div className="device-spinner spinner-border text-danger" role="status">
                                <span className="sr-only">Loading...</span>
                            </div> : '' }
                </div>
                <div className="card-body">
                    <h6 className="card-title">Contexts: {this.state.contexts}</h6>
                    <h6>IP: {this.props.data.ip}</h6>
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