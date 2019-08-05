import React, { Component } from 'react';

class Target extends Component {
    constructor(props){
        super(props);

        this.state = {
            running: false
        };

        this.startDevice = this.startDevice.bind(this);
        this.stopDevice = this.stopDevice.bind(this);
    }

    startDevice(){
        if (!this.props.running){
            alert('Start the server first');
            return;
        }

        this.props.startDevice(this.props.id);
        this.setState({running: true});
    }

    stopDevice(){
        this.props.stopDevice(this.props.id);
        this.setState({running: false});
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
                    <h6 className="card-title">Contexts: {this.props.data.contexts}</h6>
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