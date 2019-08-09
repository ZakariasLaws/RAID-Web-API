import React, { Component } from 'react';
import DeviceManagement from "./deviceManagment";
import {Utils} from "./utils";
import Predictor from "./devices/Predictor";
import Target from "./devices/Target";
import Source from "./devices/Source";
import Plot from 'react-plotly.js';

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
                    console.log("Device failed to stop");
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
        if (this.props.view === 'home') {

            let targets = this.state.targets.map(val => val.title);

            return (
                <div id="content">
                    <div className="device">
                        <h2> Sources </h2>
                        <div className="deviceContent deviceSource">
                            { this.state.sources.map((source, key) => <Source data={source} key={key} id={key} running={this.props.running} startDevice={this.startDevice} stopDevice={this.stopDevice} targets={targets}/> ) }
                        </div>
                    </div>
                    <div className="device">
                        <h2> Targets </h2>
                        <div className="deviceContent deviceTarget">
                            { this.state.targets.map((target, key) => <Target data={target} key={key} id={key} running={this.props.running} startDevice={this.startDevice} stopDevice={this.stopDevice}/> ) }
                        </div>
                    </div>
                    <div className="device last-device">
                        <h2> Predictors </h2>
                        <div className="deviceContent devicePredictor">
                            { this.state.predictors.map((predictor, key) => <Predictor data={predictor} id={key}  key={key} running={this.props.running} startDevice={this.startDevice} stopDevice={this.stopDevice}/> ) }
                        </div>
                    </div>
                    <div className="run-constellation">
                        <div className="server-wrapper">
                            <ConstellationServer running={this.props.running} executionName={this.state.executionName} updateExecutionName={this.updateExecutionName} startConstellation={this.startConstellation} stopConstellation={this.stopConstellation}/>
                        </div>
                        <Result running={this.props.running}/>
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

class Result extends Component {
    constructor(props){
        super(props);

        this.state = {
            gettingResult: false,
            figure:{
                frames: ["START"],
                predictions: [0],
                devices: ["START"],
                device_predictions: [0]
            },
            counter: 0,
        };

        this.getResults = this.getResults.bind(this);
        this.updatePlotData = this.updatePlotData.bind(this);
    }

    updatePlotData(response) {
        // model: data.split('model ')[1],
        // classifiedAt: data.split('classified at ')[1].split(' using model')[0],
        // number: number,
        // time: new Date().getTime(),

        let data = {frames: Array.from(this.state.figure.frames), predictions: Array.from(this.state.figure.predictions), devices: [], device_predictions: []};

        let counter = this.state.counter += 1;
        data.frames.push(`${counter}`);
        data.predictions.push(response.length);

        response.sort((first, second) => {
            return second.classifiedAt - first.classifiedAt;
        });

        if (data.frames.length > 15) {
            data.frames.shift();
            data.predictions.shift();
        }

        let devices = {};
        for(let i=0; i<response.length; i++){
            if (!Object.keys(devices).includes(response[i].classifiedAt)){
                devices[response[i].classifiedAt] = 1
            } else {
                devices[response[i].classifiedAt] += 1;
            }
        }

        let items = Object.keys(devices).map(function(key) {
            return [key, devices[key]];
        });

        items.sort(function(first, second) {
            let a = first[0].toUpperCase();
            let b = second[0].toUpperCase();

            if(a > b){
                return 1;
            } else if (b > a) {
                return -1;
            }
            return 0;
        });

        data.devices = items.map(val => val[0]);
        data.device_predictions = items.map(val => val[1]);

        this.setState({figure: data, counter: counter});
    }

    getResults(){
        if (this.props.running) {
            fetch(Utils.CONSTELLATION_URL.getResults)
                .then(Utils.handleFetchErrors)
                .then(response => response.json())
                .then(response => {
                    if (response.length > 0)
                        this.updatePlotData(response)
                })
                .catch(err => {
                    console.log("Error fetching results " + err);
                });
        }
    }

    loopGetResults(){
        if (!this.state.gettingResult) {
            this.setState({gettingResult: true});
            setInterval(() => {
                this.getResults();
            }, 300);
        }
    }

    componentDidMount() {
        this.loopGetResults();
    }

    render() {
        return (
            <div className="result-wrapper">
                <div className="result-title-box">
                    <h2>Result</h2>
                    <div className="Result-content">
                        <Plot
                            data={[
                                {type: 'bar', x: this.state.figure.frames, y: this.state.figure.predictions},
                            ]}
                            layout={ {width: 800, height: 500, title: 'Classifications per second'} }
                        />
                        <Plot
                            data={[
                                {type: 'bar', x: this.state.figure.devices, y: this.state.figure.device_predictions},
                            ]}
                            layout={ {width: 800, height: 500, title: 'Classifications per device'} }
                        />
                    </div>
                </div>
            </div>
        );
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