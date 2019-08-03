import React, { Component } from 'react';
import DeviceManagement from "./deviceManagment";

class Content extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        if (this.props.view === 'home') {
            return (
                <div id="content">
                    <div className="device">
                        <h2> Sources </h2>
                        <div className="deviceContent deviceSource">

                        </div>
                    </div>
                    <div className="device">
                        <h2> Targets </h2>
                        <div className="deviceContent deviceTarget">

                        </div>
                    </div>
                    <div className="device">
                        <h2> Predictors </h2>
                        <div className="deviceContent devicePredictor">
                            <Predictor/>
                            <Predictor/>
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

class Predictor extends Component {
    render() {
        return (
            <div className="predictorDevice">
                asdfkhakjsdhfakjlsdlhfajskdfhaslkjdfhasdjkh<br/>
                asdfkhakjsdhfakjlsdlhfajskdfhaslkjdfhasdjkh<br/>
                asdfkhakjsdhfakjlsdlhfajskdfhaslkjdfhasdjkh<br/>
                asdfkhakjsdhfakjlsdlhfajskdfhaslkjdfhasdjkh<br/>
                asdfkhakjsdhfakjlsdlhfajskdfhaslkjdfhasdjkh<br/>
                asdfkhakjsdhfakjlsdlhfajskdfhaslkjdfhasdjkh<br/>
                asdfkhakjsdhfakjlsdlhfajskdfhaslkjdfhasdjkh<br/>
                asdfkhakjsdhfakjlsdlhfajskdfhaslkjdfhasdjkh<br/>
                asdfkhakjsdhfakjlsdlhfajskdfhaslkjdfhasdjkh<br/>
                asdfkhakjsdhfakjlsdlhfajskdfhaslkjdfhasdjkh<br/>
                asdfkhakjsdhfakjlsdlhfajskdfhaslkjdfhasdjkh<br/>
                asdfkhakjsdhfakjlsdlhfajskdfhaslkjdfhasdjkh<br/>
                asdfkhakjsdhfakjlsdlhfajskdfhaslkjdfhasdjkh<br/>
                asdfkhakjsdhfakjlsdlhfajskdfhaslkjdfhasdjkh<br/>
                asdfkhakjsdhfakjlsdlhfajskdfhaslkjdfhasdjkh<br/>
                asdfkhakjsdhfakjlsdlhfajskdfhaslkjdfhasdjkh<br/>
                asdfkhakjsdhfakjlsdlhfajskdfhaslkjdfhasdjkh<br/>
                asdfkhakjsdhfakjlsdlhfajskdfhaslkjdfhasdjkh<br/>
                asdfkhakjsdhfakjlsdlhfajskdfhaslkjdfhasdjkh<br/>
                asdfkhakjsdhfakjlsdlhfajskdfhaslkjdfhasdjkh<br/>
                asdfkhakjsdhfakjlsdlhfajskdfhaslkjdfhasdjkh<br/>
                asdfkhakjsdhfakjlsdlhfajskdfhaslkjdfhasdjkh<br/>
                asdfkhakjsdhfakjlsdlhfajskdfhaslkjdfhasdjkh<br/>
                asdfkhakjsdhfakjlsdlhfajskdfhaslkjdfhasdjkh<br/>
                asdfkhakjsdhfakjlsdlhfajskdfhaslkjdfhasdjkh<br/>
                asdfkhakjsdhfakjlsdlhfajskdfhaslkjdfhasdjkh<br/>
                asdfkhakjsdhfakjlsdlhfajskdfhaslkjdfhasdjkh<br/>
                asdfkhakjsdhfakjlsdlhfajskdfhaslkjdfhasdjkh<br/>
                asdfkhakjsdhfakjlsdlhfajskdfhaslkjdfhasdjkh<br/>
                asdfkhakjsdhfakjlsdlhfajskdfhaslkjdfhasdjkh<br/>
                asdfkhakjsdhfakjlsdlhfajskdfhaslkjdfhasdjkh<br/>
                asdfkhakjsdhfakjlsdlhfajskdfhaslkjdfhasdjkh<br/>
                asdfkhakjsdhfakjlsdlhfajskdfhaslkjdfhasdjkh<br/>
                asdfkhakjsdhfakjlsdlhfajskdfhaslkjdfhasdjkh<br/>
                asdfkhakjsdhfakjlsdlhfajskdfhaslkjdfhasdjkh<br/>
                asdfkhakjsdhfakjlsdlhfajskdfhaslkjdfhasdjkh<br/>
                asdfkhakjsdhfakjlsdlhfajskdfhaslkjdfhasdjkh<br/>
                asdfkhakjsdhfakjlsdlhfajskdfhaslkjdfhasdjkh<br/>
                asdfkhakjsdhfakjlsdlhfajskdfhaslkjdfhasdjkh<br/>
                asdfkhakjsdhfakjlsdlhfajskdfhaslkjdfhasdjkh<br/>
                asdfkhakjsdhfakjlsdlhfajskdfhaslkjdfhasdjkh<br/>
                asdfkhakjsdhfakjlsdlhfajskdfhaslkjdfhasdjkh<br/>
                asdfkhakjsdhfakjlsdlhfajskdfhaslkjdfhasdjkh<br/>
                asdfkhakjsdhfakjlsdlhfajskdfhaslkjdfhasdjkh<br/>
                asdfkhakjsdhfakjlsdlhfajskdfhaslkjdfhasdjkh<br/>
                asdfkhakjsdhfakjlsdlhfajskdfhaslkjdfhasdjkh<br/>
                asdfkhakjsdhfakjlsdlhfajskdfhaslkjdfhasdjkh<br/>
                asdfkhakjsdhfakjlsdlhfajskdfhaslkjdfhasdjkh<br/>
                asdfkhakjsdhfakjlsdlhfajskdfhaslkjdfhasdjkh<br/>
                asdfkhakjsdhfakjlsdlhfajskdfhaslkjdfhasdjkh<br/>
                asdfkhakjsdhfakjlsdlhfajskdfhaslkjdfhasdjkh<br/>
                asdfkhakjsdhfakjlsdlhfajskdfhaslkjdfhasdjkh<br/>
                asdfkhakjsdhfakjlsdlhfajskdfhaslkjdfhasdjkh<br/>
                asdfkhakjsdhfakjlsdlhfajskdfhaslkjdfhasdjkh<br/>
            </div>
        )
    }
}

export default Content;