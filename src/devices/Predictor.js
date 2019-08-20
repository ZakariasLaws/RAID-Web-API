import React, { Component } from 'react';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Utils} from "../utils";

class Predictor extends Component {
    constructor(props){
        super(props);

        this.state = {
            running: false,
            contexts: '',
            extraInfoOpen: false,
            executors: 1,
            starting: false,
            stopping: false
        };

        this.startDevice = this.startDevice.bind(this);
        this.stopDevice = this.stopDevice.bind(this);
        this.changeDropMenu = this.changeDropMenu.bind(this);
        this.updateContexts = this.updateContexts.bind(this);
        this.updateExecutors = this.updateExecutors.bind(this);
        this.predictorClosed = this.predictorClosed.bind(this);
    }

    changeDropMenu(val){
        this.setState({extraInfoOpen: val});
    }

    updateContexts(e) {
        this.setState({contexts: e.target.value});
    }

    updateExecutors(e) {
        this.setState({executors: e.target.value});
    }

    startDevice(){
        if (!this.props.running){
            alert('Start the server first');
            return;
        } else if (this.state.contexts === '') {
            alert("Select at least one context");
            return;
        }
        let params = `-context ${this.state.contexts.split(" ").join(',')} -nrExecutors ${this.state.executors}`;

        this.props.startDevice(this.props.id, this.props.data.ip, this.props.data.username, this.props.data.password, 'p', params)
            .then(response => {
                this.setState({starting: true, stopping: false, running: false});
            })
            .catch(err => {
                console.log(err);
            });
    }

    stopDevice(){
        this.setState({running: false, starting: false, stopping: true});
        this.props.stopDevice(this.props.id, 'p')
            .then(response => {
               setTimeout(() => {
                   if (this.state.stopping || this.state.running) {
                       console.log("TIMEOUT shutting down PREDICTOR");
                       // Double check
                       fetch(`${Utils.CONSTELLATION_URL.checkIfStopped}?role=p&id=${this.props.id}`)
                           .then(Utils.handleFetchErrors)
                           .then(response => {
                               console.log("PREDICTOR DEVICE IS ALREADY STOPPED");
                               this.setState({running: false, stopping: false, starting: false});
                           })
                           .catch(err => {
                               console.log("PREDICTOR is really not stopped: " + err);
                           });
                   }
                }, Utils.deviceShutdownTimeout);
            })
            .catch(response => {
                console.log(response);
            });
    }

    predictorClosed(data) {
        let id = data.id;
        let code = data.code;
        if (data.id !== this.props.id) {
            return;
        }

        if (code === 130 || code === 137 || code === 255) {
            console.log("PREDICTOR DEVICE IS STOPPED ");
            this.setState({running: false, starting: false, stopping: false});
        } else {
            console.log("Shutdown PREDICTOR failed with response " + JSON.stringify(data));
            this.setState({running: false, starting: false, stopping: false});
        }
    };

    componentDidMount() {
        // Setup socket
        let sockedClosed = `predictor_closed-${this.props.id}`;
        this.props.socket.on(`predictor_closed-${this.props.id}`, data => {
            this.predictorClosed(data);
        });

        this.props.socket.on(`predictor_started-${this.props.id}`, data => {
            if (data.id === this.props.id) {
                this.setState({running: true, starting: false, stopping: false});
            }
        });
    }

    render() {
        return (
            <div className="device-predictor card bg-white mb-3">
                <div className="card-header">
                    { this.state.extraInfoOpen ?
                        <button className="drop-down-button btn-dark" onClick={() => this.changeDropMenu(false)}><FontAwesomeIcon icon="angle-down"/> </button> :
                        <button className="drop-down-button btn-dark" onClick={() => this.changeDropMenu(true)}> <FontAwesomeIcon icon="angle-right"/> </button> }
                    {this.props.data.title}
                    { this.state.running ?
                        <div className="device-spinner spinner-border text-success" role="status">
                            <span className="sr-only">Loading...</span>
                        </div> : this.state.starting ?
                        <div className="device-spinner spinner-border text-warning" role="status">
                            <span className="sr-only"> Loading...</span>
                        </div> : this.state.stopping ?
                        <div className="device-spinner spinner-border text-warning" role="status">
                            <span className="sr-only"> Loading...</span>
                        </div> : ''
                    }
                </div>
                <div className="card-body">
                    <h5 className="address">{this.props.data.username}@{this.props.data.ip}</h5>
                    { this.state.extraInfoOpen ? <div>
                        <h5 className="card-title">Contexts: <input value={this.state.contexts} onChange={this.updateContexts}/></h5>
                        <h5 className="card-title">Executors: <input style={{width:'30px'}} value={this.state.executors} onChange={this.updateExecutors}/></h5>
                    </div> : ''}
                    <div className="card-text">
                        { this.state.running ?
                            <button className="btn-danger" onClick={this.stopDevice}>
                                STOP
                            </button> : this.state.stopping ?
                            <button className="btn-warning" onClick={() =>{}}>
                                STOPPING
                            </button> : this.state.starting ?
                            <button className="btn-warning" onClick={() =>{}}>
                                STARTING
                            </button> :
                            <button className="btn-success" onClick={this.startDevice}>
                                START
                            </button>
                        }
                    </div>
                </div>
            </div>
        )
    }
}

export default Predictor;