import React, { Component } from 'react';
import DeviceManagement from "./deviceManagment";
import {Utils} from "./utils";
import Predictor from "./devices/Predictor";
import Target from "./devices/Target";
import Source from "./devices/Source";
import ResultWrapper from "./ResultWrapper";

class Content extends Component {
    constructor(props) {
        super(props);

        this.state = {
            predictors: [],
            targets: [],
            sources: [],
            executionName: 'ADD A NAME'
        };

        this.startConstellation = this.startConstellation.bind(this);
        this.stopConstellation = this.stopConstellation.bind(this);
        this.startDevice = this.startDevice.bind(this);
        this.stopDevice = this.stopDevice.bind(this);
        this.updateExecutionName = this.updateExecutionName.bind(this);

        // Ask user if trying to leave the website or refreshing when Constellation is running
        window.onbeforeunload = (e) => {
            if (this.props.running){
                e.preventDefault();
                console.log("Constellation instance is running, are you sure you want to leave page?");
                e.returnValue = '';
            }
        };
    }

    updateExecutionName(e){
        this.setState({executionName: e.target.value});
    }

    startConstellation(){
        if (this.state.executionName === ''){
            alert('Choose an execution name');
            return;
        }

        const executionName = this.state.executionName.split(' ').join('-').split('/').join('_');

        fetch(`${Utils.CONSTELLATION_URL.start}?binDir=${Utils.CONSTELLATION_BIN_DIR}&executionName=${executionName}`)
            .then(Utils.handleFetchErrors)
            .then(response => response.json())
            .then(response => {
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
                this.props.updateRunning(false);
            })
            .catch(error => {
                console.log("Failed to stop Constellation");
                console.log(error);
            });
    }

    startDevice(id, ip, username, password, role, params){
        let values = {
            id: id,
            ip: ip,
            role: role,
            username: username,
            password: password,
            params: params,
        };
        return new Promise((resolve, reject) => {
            fetch(Utils.CONSTELLATION_URL.startDevice, {
                method: 'POST',
                body: JSON.stringify(values),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(Utils.handleFetchErrors)
            .then(response => {
                resolve(response); // Contains unique ID
            })
            .catch(err => {
                console.log("Device failed to start");
                reject(err);
            });
        });
    }

    stopDevice(id, role){
        return new Promise((resolve, reject) => {
            fetch(`${Utils.CONSTELLATION_URL.stopDevice}?role=${role}&id=${id}`)
                .then(Utils.handleFetchErrors)
                .then(response => {
                    resolve()
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    updateDevices(){
        fetch(Utils.API_URL)
            .then(Utils.handleFetchErrors)
            .then(response => response.json())
            .then(response => {
                let predictors = [];
                let sources = [];
                let targets = [];

                if (response.length === 0 || !Array.isArray(response)){
                    this.props.changeView(Utils.views.deviceManagement);
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
        if (this.props.view === Utils.views.home) {
            let targets = this.state.targets.map(val => val.title);

            return (
                <div id="content">
                    <div className="device">
                        <h2> Sources </h2>
                        <div className="deviceContent deviceSource">
                            { this.state.sources.map((source, key) => <Source data={source} key={key} id={key} running={this.props.running} startDevice={this.startDevice} stopDevice={this.stopDevice} targets={targets} socket={this.props.socket}/> ) }
                        </div>
                    </div>
                    <div className="device">
                        <h2> Targets </h2>
                        <div className="deviceContent deviceTarget">
                            { this.state.targets.map((target, key) => <Target data={target} key={key} id={key} running={this.props.running} startDevice={this.startDevice} stopDevice={this.stopDevice} socket={this.props.socket}/> ) }
                        </div>
                    </div>
                    <div className="device last-device">
                        <h2> Predictors </h2>
                        <div className="deviceContent devicePredictor">
                            { this.state.predictors.map((predictor, key) => <Predictor data={predictor} id={key}  key={key} running={this.props.running} startDevice={this.startDevice} stopDevice={this.stopDevice} socket={this.props.socket}/> ) }
                        </div>
                    </div>
                    <div className="run-constellation">
                        <div className="server-wrapper">
                            <ConstellationServer running={this.props.running} executionName={this.state.executionName} updateExecutionName={this.updateExecutionName} startConstellation={this.startConstellation} stopConstellation={this.stopConstellation} socket={this.props.socket}/>
                        </div>
                        <ResultWrapper running={this.props.running} socket={this.props.socket} stopConstellation={this.stopConstellation}/>
                    </div>
                </div>
            );
        } else if (this.props.view === Utils.views.deviceManagement) {
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
                <h2>RAID - Server</h2>
                <div>
                    <div className="constellation-execution-name-wrapper">
                        <h3><input value={this.props.executionName} onChange={this.props.updateExecutionName}/></h3>
                    </div>
                    {
                        this.props.running ?
                            <div>
                                <div className="constellation-button-wrapper">
                                    <button className="start-constellation-button btn-dark" onClick={this.props.stopConstellation}> STOP </button>
                                </div>
                                <div className="spinner-wrapper">
                                    <div className="whirly-loader"></div>
                                </div>
                            </div> : <button className="start-constellation-button btn-dark" onClick={this.props.startConstellation}> START </button>
                    }
                </div>
            </div>
        )
    }
}

export default Content;