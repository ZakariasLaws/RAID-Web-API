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
            extraInfoOpen: false
        };

        this.startDevice = this.startDevice.bind(this);
        this.updateTarget = this.updateTarget.bind(this);
        this.updateModel = this.updateModel.bind(this);
        this.stopDevice = this.stopDevice.bind(this);
        this.changeDropMenu = this.changeDropMenu.bind(this);
        this.updateBatchSize = this.updateBatchSize.bind(this);
        this.checkIfDeviceStopped = this.checkIfDeviceStopped.bind(this);
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
        this.props.stopDevice(this.props.id, 's')
            .then(response => {
                this.checkIfDeviceStopped(this.props.id, 's', 0);
            })
            .catch(response => {
                console.log(response);
            });
    }

    checkIfDeviceStopped(id, role, counter) {
        if(counter > 20){
            console.log("Timeout stopping SOURCE");
            return;
        }

        fetch(`${Utils.CONSTELLATION_URL.checkIfStopped}?role=${role}&id=${id}`)
            .then(Utils.handleFetchErrors)
            .then(response => {
                console.log("SOURCE DEVICE IS STOPPED");
                this.setState({running: false});
            })
            .catch(err => {
                setTimeout(() => {
                    this.checkIfDeviceStopped(id, role, counter + 1);
                }, 2100)
            });
    }

    render() {
        // Make sure to stop if server is stopped
        if (!this.props.running && this.state.running) {
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
                        <div className="device-spinner spinner-border text-danger" role="status">
                            <span className="sr-only">Loading...</span>
                        </div> : '' }
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
                        { this.state.running ?  <button className="btn-danger" onClick={this.stopDevice}>STOP</button> :
                            <button className="btn-primary" onClick={this.startDevice}>START</button> }
                    </div>
                </div>
            </div>
        )
    }
}

export default Source;