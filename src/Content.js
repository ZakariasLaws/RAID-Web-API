import React, { Component } from 'react';
import DeviceManagement from "./deviceManagment";
import {Utils} from "./utils";
import Predictor from "./devices/Predictor";
import Target from "./devices/Target";
import Source from "./devices/Source";

class Content extends Component {
    constructor(props) {
        super(props);

        this.state = {
            predictors: [],
            targets: [],
            sources: [],
        };

        this.startConstellation = this.startConstellation.bind(this);
        this.stopConstellation = this.stopConstellation.bind(this);
        this.startDevice = this.startDevice.bind(this);
        this.stopDevice = this.stopDevice.bind(this);

        window.onbeforeunload = (e) => {
            if (this.props.running){
                e.preventDefault();
                console.log("Constellation instance is running, are you sure you want to leave page?");
                e.returnValue = '';
            }
        };
    }

    startConstellation(){
        fetch(`${Utils.CONSTELLATION_URL.start}?binDir=${Utils.CONSTELLATION_BIN_DIR}`)
            .then(response => response.json())
            .then(response => {
                console.log(response);
                this.props.updateRunning(true);
            })
            .catch(error => {
                console.log("Failed to start Constellation");
                console.log(error);
            });
    }

    stopConstellation(){
        fetch(Utils.CONSTELLATION_URL.stop)
            .then(response => response.json())
            .then(response => {
                console.log(response);
                this.props.updateRunning(false);
            })
            .catch(error => {
                console.log("Failed to stop Constellation");
                console.log(error);
            });
    }

    startDevice(id, ip, username, password, binDir, contexts, params){
        let values = {
            id: id,
            ip: ip,
            username: username,
            password: password,
            binDir: binDir,
            contexts: '',
            params: params,
        };

        for(let i=0; i<contexts.length; i++){
            values.contexts += contexts[i];
            if (i < contexts.length){
                values += ',';
            }
        }

        return new Promise((resolve, reject) => {
            fetch(Utils.CONSTELLATION_URL.startTarget, {
                method: 'POST',
                body: JSON.stringify(values),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                console.log("Device started successfully");
                resolve(response);
            })
            .catch(err => {
                console.log("Device failed to start");
                reject(err);
            });
        });
    }

    stopDevice(id){
        console.log("stop: " + id);

    }

    updateDevices(){
        fetch(Utils.API_URL)
            .then(response => response.json())
            .then(response => {
                let predictors = [];
                let sources = [];
                let targets = [];

                if (response.length === 0 || !Array.isArray(response)){
                    return;
                }

                response.map(device => {
                    if (device.role === 't'){
                        targets.push(device);
                    } else if (device.role === 's'){
                        sources.push(device);
                    } else if (device.role === 'p') {
                        predictors.push(device);
                    }
                });
                this.setState({predictors: predictors, sources: sources, targets: targets});
            })
            .catch(error => console.error('Error:', error));
    }

    componentDidMount() {
        this.updateDevices();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.view !== this.props.view &&
            prevState.sources.length === this.state.sources.length &&
            prevState.targets.length === this.state.targets.length &&
            prevState.predictors.length === this.state.predictors.length) {

            this.updateDevices();
        }
    }

    render() {
        if (this.props.view === 'home') {
            return (
                <div id="content">
                    <div className="main-title"><h1 className="elegantshd">Resource Aware Inference Distribution</h1></div>
                    <div className="device">
                        <h2> Sources </h2>
                        <div className="deviceContent deviceSource">
                            { this.state.sources.map((source, key) => <Source data={source} key={key} running={this.props.running} startDevice={this.startDevice} stopDevice={this.stopDevice}/> ) }
                        </div>
                    </div>
                    <div className="device">
                        <h2> Targets </h2>
                        <div className="deviceContent deviceTarget">
                            { this.state.targets.map((target, key) => <Target data={target} key={key} running={this.props.running} startDevice={this.startDevice} stopDevice={this.stopDevice}/> ) }
                        </div>
                    </div>
                    <div className="device last-device">
                        <h2> Predictors </h2>
                        <div className="deviceContent devicePredictor">
                            { this.state.predictors.map((predictor, key) => <Predictor data={predictor} key={key} running={this.props.running} startDevice={this.startDevice} stopDevice={this.stopDevice}/> ) }
                        </div>
                    </div>
                    <div className="run-constellation">
                        <div className="float-left server-wrapper">
                            <ConstellationServer running={this.props.running} startConstellation={this.startConstellation} stopConstellation={this.stopConstellation}/>
                        </div>
                        <div className="float-right result-wrapper">
                            <div className="result-title-box">
                                <h2>Result</h2>
                            </div>
                        </div>
                    </div>
                </div>
            );
        } else {
            return (
                <DeviceManagement />
            );
        }
    }
}

class ConstellationServer extends Component {
    constructor(props){
        super(props);
    }

    render(){
        return (
            <div>
                <h2>Constellation Server</h2>
                <div>
                    {
                        this.props.running ?
                            <div>
                                <div>
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="sr-only">Loading...</span>
                                    </div>
                                </div>
                                <div>
                                    <button className="btn-dark" onClick={this.props.stopConstellation}> STOP </button>
                                </div>
                            </div> : <button className="btn-dark" onClick={this.props.startConstellation}> START </button>
                    }
                </div>
            </div>
        )
    }
}

export default Content;