import React, { Component } from 'react';
import {Utils} from "../utils";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {DropdownButton, Dropdown} from "react-bootstrap";

class Source extends Component {
    constructor(props){
        super(props);

        this.state = {
            running: false,
            batchSize: 1,
            sourceDir: '/home/zaklaw01/Desktop/coco/test2017/',
            modelName: 'SELECT MODEL',
            contexts: '',
            targetName: 'SELECT TARGET',
            extraInfoOpen: false,
            starting: false,
            stopping: false
        };

        this.startDevice = this.startDevice.bind(this);
        this.updateTarget = this.updateTarget.bind(this);
        this.updateModel = this.updateModel.bind(this);
        this.stopDevice = this.stopDevice.bind(this);
        this.changeDropMenu = this.changeDropMenu.bind(this);
        this.updateBatchSize = this.updateBatchSize.bind(this);
        this.sourceClosed = this.sourceClosed.bind(this);
        this.updateContexts = this.updateContexts.bind(this);
        this.updateSourceDir = this.updateSourceDir.bind(this);

    }

    changeDropMenu(val){
        this.setState({extraInfoOpen: val});
    }

    updateBatchSize(e) {
        this.setState({batchSize: e.target.value});
    }

    updateContexts(e) {
        this.setState({contexts: e.target.value});
    }

    updateModel(model) {
        this.setState({modelName: model});
    }

    updateTarget(target) {
        this.setState({targetName: target});
    }

    updateSourceDir(e) {
        this.setState({sourceDir: e.target.value});
    }

    startDevice(){
        if (!this.props.running){
            alert('Start the server first');
            return;
        } else if (this.state.batchSize < 1 || this.state.batchSize > 500){
            alert("batch size needs to be in between 1 and 500");
            return;
        } else if (!this.props.targets.includes(this.state.targetName)) {
            alert("Select a target device");
            return;
        } else if (!Utils.models.includes(this.state.modelName)) {
            alert("Must select a model from " + Utils.models.toString());
            return;
        } else if (this.state.sourceDir === '') {
            alert("Select a source directory");
            return;
        } else if (this.state.contexts === '') {
            alert("Select at least one context");
            return;
        }

        let contexts = this.state.contexts.split(" ").join(',');
        // ./bin/distributed/run.bash s 10.72.154.139 pool.name A -target 0:1:0 -dataDir /home/zaklaw01/Desktop/coco/test2017/ -modelName yolo -batchSize 2
        let params = `-context ${contexts} -batchSize ${this.state.batchSize} -dataDir ${this.state.sourceDir} -modelName ${this.state.modelName} -target 0:1:0`;

        this.props.startDevice(this.props.id, this.props.data.ip, this.props.data.username, this.props.data.password, 's', params)
            .then(response => {
                this.setState({running: true});
            })
            .catch(err => {
                console.log(err);
            });
    }

    stopDevice(){
        this.setState({running: false, starting: false, stopping: true});
        this.props.stopDevice(this.props.id, 's')
            .then(response => {
                setTimeout(() => {
                    if (this.state.stopping || this.state.running) {
                        console.log("TIMEOUT shutting down SOURCE");
                        // Double check
                        fetch(`${Utils.CONSTELLATION_URL.checkIfStopped}?role=s&id=${this.props.id}`)
                            .then(Utils.handleFetchErrors)
                            .then(response => {
                                console.log("SOURCE DEVICE IS ALREADY STOPPED");
                                this.setState({running: false, stopping: false, starting: false,});
                            })
                            .catch(err => {
                                console.log("SOURCE is really not stopped: " + err);
                            });
                    }
                }, Utils.deviceShutdownTimeout);
            })
            .catch(response => {
                console.log(response);
            });
    }

    sourceClosed(data) {
        let id = data.id;
        let code = data.code;

        if (data.id !== this.props.id) {
            return;
        }

        if (code === 130 || code === 137) {
            console.log("SOURCE DEVICE IS STOPPED");
            this.setState({running: false, starting: false, stopping: false});
        } else {
            console.log("Shutdown SOURCE failed with response " + JSON.stringify(data));
            this.setState({running: false, starting: false, stopping: false});
        }
    };

    componentDidMount() {
        // Setup socket
        this.props.socket.on(`source_closed-${this.props.id}`, data => {
            this.sourceClosed(data);
        });

        this.props.socket.on(`source_started-${this.props.id}`, data => {
            if (data.id === this.props.id) {
                this.setState({running: true, starting: false, stopping: false});
            }
        });
    }

    render() {
        // Make sure to stop if server is stopped
        if (!this.props.running && this.state.running && !this.state.stopping) {
            this.stopDevice();
        }

        return (
            <div className="device-target card bg-white mb-3">
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
                    { this.state.extraInfoOpen ? <div>
                        <h5>IP: {this.props.data.ip}</h5>
                        <h5 className="card-title">Contexts: <input value={this.state.contexts} onChange={this.updateContexts}/></h5>
                        <h5 className="card-title">Batch Size: <input value={this.state.batchSize} onChange={this.updateBatchSize}/></h5>
                        <h5 className="card-title">Source Directory: <input value={this.state.sourceDir} onChange={this.updateSourceDir}/></h5>
                        <Dropdown>
                            <Dropdown.Toggle variant="info" id="dropdown-basic">
                                <span className="dropdown-label">{this.state.modelName}</span>
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                {
                                    Utils.models.map((value, key) =>{
                                       return <Dropdown.Item onClick={() => this.updateModel(value)} key={key} >{value}</Dropdown.Item>;
                                    })
                                }
                            </Dropdown.Menu>
                        </Dropdown>
                        <Dropdown>
                            <Dropdown.Toggle variant="info" id="dropdown-basic">
                                <span className="dropdown-label">{this.state.targetName}</span>
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                {
                                    this.props.targets.map((value, key) =>{
                                        return <Dropdown.Item onClick={() => this.updateTarget(value)} key={key} >{value}</Dropdown.Item>;
                                    })
                                }
                            </Dropdown.Menu>
                        </Dropdown>
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

export default Source;