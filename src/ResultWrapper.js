import React, { Component } from 'react';
import {Utils} from "./utils";
import Plot from "react-plotly.js";
import { Navbar, Nav, NavItem, NavDropdown, Form, Button, FormControl } from "react-bootstrap";

class ResultWrapper extends Component {
    constructor(props){
        super(props);

        let inferencesPerSecond = 0;

        this.state = {
            gettingResult: false,
            figure: {
                frames: ["START"],
                predictions: [0],
                // devices: [],
                // device_predictions: [],
                models :[],
                data: {}
            },
            inferencesPerSecond: inferencesPerSecond.toFixed(2),
            plot: 'Throughput',
            counter: 0,
        };

        this.updatePlotData = this.updatePlotData.bind(this);
        this.setupSocket = this.setupSocket.bind(this);
        this.refreshLoadBalance = this.refreshLoadBalance.bind(this);

    }

    updatePlotData(response) {
        // Response contains the following
        // {
        //     length: buffer.length,
        //     devices: devices,
        //     device_freq: device_freq,
        //     models: models,
        //     model_freq: model_freq
        // }

        let newFigureState = {frames: Array.from(this.state.figure.frames), predictions: Array.from(this.state.figure.predictions), data: JSON.parse(JSON.stringify(this.state.figure.data))};

        let counter = this.state.counter += 1;
        // let time = (new Date).clearTime().addSeconds(counter).toString();
        let time = new Date(counter * 1000).toISOString().substr(11, 8);

        newFigureState.frames.push(time);
        newFigureState.predictions.push(response.length);

        if (newFigureState.frames.length > 15) {
            newFigureState.frames.shift();
            newFigureState.predictions.shift();
        }

        // {Odroid-1:{MNIST: 2, YOLO: 5}, Odroid-2: {MNIST:5, YOLO:7}} etc
        let devices = Object.keys(response.data); // [Odroid-1, Odroid-2]
        const myDevices = Object.keys(newFigureState.data);
        devices.forEach(serverDevice => {
            if (!myDevices.includes(serverDevice)){
                newFigureState.data[serverDevice] = response.data[serverDevice];
            } else {
                let serverDeviceData = response.data[serverDevice]; // {MNSIT: 2, YOLO: 4}
                Object.keys(serverDeviceData).map(serverDataKey => {
                    if (Object.keys(newFigureState.data[serverDevice]).includes(serverDataKey)){
                        newFigureState.data[serverDevice][serverDataKey] += serverDeviceData[serverDataKey];
                    } else {
                        newFigureState.data[serverDevice][serverDataKey] = serverDeviceData[serverDataKey];
                    }
                });
            }
        });

        let models = new Set();
        Object.keys(newFigureState.data).forEach(key => {
            Object.keys(newFigureState.data[key]).forEach(model => {
                models.add(model);
            })
        });

        newFigureState['models'] = Array.from(models);

        let inferencesPerSecond = newFigureState.predictions.reduce((a,b) => {return a+b}) / newFigureState.predictions.length;

        this.setState({figure: newFigureState, counter: counter, inferencesPerSecond: inferencesPerSecond.toFixed(2)});
    }

    setupSocket() {
        this.props.socket.emit('setup', 'Hello from client2');

        this.props.socket.on('data', data =>{
            this.updatePlotData(data);
        });

        this.props.socket.on('ERROR', data => {
            this.props.stopConstellation();
        });

        this.props.socket.on('error', (err) => {
            console.log('received socket error:');
            console.log(err)
        });
    }

    refreshLoadBalance() {;
        let data = this.state.figure;
        data = {
                frames: Array.from(this.state.figure.frames),
                predictions: Array.from(this.state.figure.predictions),
                models :[],
                data: {}
        };
        this.setState({figure: data});
    }

    changePlot(val){
        this.setState({plot: val});
    }

    componentDidMount() {
        this.setupSocket();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.running && !this.props.running && prevState.figure.frames.length > 1){
            // Instance just stopped
            this.setState({
                figure:{
                    frames: ["START"],
                    predictions: [0],
                    // devices: [],
                    // device_predictions: [],
                    models :[],
                    data: {}
                },
                counter: 0,
            });
        }
    }

    render() {
        const load_balance_all_devices = this.state.plot === 'Load Balance - All' ? Object.keys(this.state.figure.data).map((val) =>{
                return [val, Object.keys(this.state.figure.data[val]).map(model => {
                    return this.state.figure.data[val][model];
                }).reduce((a, b) => a+b, 0)
                ]
            }) : [[],[]];

        return (
            <div className="result-wrapper">
                <div className="result-title-box">
                    <h2>Result</h2>
                    <Navbar bg="light" expand="lg">
                        <Navbar.Brand>Toggle Plot</Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        <Navbar.Collapse id="basic-navbar-nav">
                            <Nav className="mr-auto">
                                <Nav.Link onClick={() => this.changePlot('Throughput')}><span style={this.state.plot === 'Throughput' ? { fontWeight:'bold', textDecorationLine: 'underline' } : {}}>Throughput</span></Nav.Link>
                                {/*<Nav.Link onClick={() => this.changePlot('Load Balance')}><span style={this.state.plot === 'Load Balance' ? { fontWeight:'bold', textDecorationLine: 'underline' } : {}}>Load Balance</span></Nav.Link>*/}
                                <NavDropdown title="Data Distribution" id="basic-nav-dropdown">
                                    <NavDropdown.Item onClick={() => this.changePlot('Load Balance - All')}>All</NavDropdown.Item>
                                    {
                                        this.state.figure.models.map((val, key) =>{
                                            return <NavDropdown.Item key={key} onClick={() => this.changePlot(`Load Balance - ${val}`)}>{val}</NavDropdown.Item>
                                        })
                                    }

                                    {/*<NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>*/}
                                    {/*<NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>*/}
                                    {/*<NavDropdown.Divider />*/}
                                    {/*<NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>*/}
                                </NavDropdown>
                            </Nav>
                        </Navbar.Collapse>
                        <Form inline>
                            <InferencesPerSecond inferencesPerSecond={this.state.inferencesPerSecond} showBar={this.state.plot.includes('Load Balance')}/>
                            {this.state.plot.includes('Load Balance') ?
                                <Button onClick={this.refreshLoadBalance} variant="outline-success"> Refresh </Button> : ''
                            }
                        </Form>
                    </Navbar>
                    <div className="Result-content">
                        {
                            this.state.plot === 'Throughput' ?
                            <Plot
                                data={[
                                    {type: 'bar', x: this.state.figure.frames, y: this.state.figure.predictions},
                                ]}
                                layout={{
                                    width: 700, height: 400, title: 'Classifications Per Second',
                                    xaxis: {
                                        visible: true,
                                        title: "Seconds",
                                    },
                                    yaxis: {
                                        visible: true,
                                        title: "Classifications"
                                    }
                                }}
                            /> : ''
                        }

                        {
                            this.state.figure.models.map((val, key) => {
                                if (this.state.plot === `Load Balance - ${val}` ) {
                                    // {Odroid-1:{MNIST: 2, YOLO:5}, Odroid-2: {MNIST:5, YOLO:7}}
                                    const devices = Object.keys(this.state.figure.data).map(device => {
                                        return [device, this.state.figure.data[device][val]];
                                    });
                                    return < Plot
                                        data={[
                                            {type: 'bar', x: devices.map(device => device[0]), y:  devices.map(device => device[1])},
                                        ]}
                                        key={key}
                                        layout={{
                                            width: 700, height: 400, title: `Classificatons Per Device - ${val}`,
                                            xaxis: {
                                                visible: true,
                                                title: "Devices",
                                            },
                                            yaxis: {
                                                visible: true,
                                                title: "Classifications"
                                            }
                                        }}
                                    />
                                }
                            })
                        }

                        {
                            this.state.plot === 'Load Balance - All' ?
                                < Plot
                                data={[
                                    {type: 'bar', x: load_balance_all_devices.map(device => device[0]), y: load_balance_all_devices.map(device => device[1])},
                                ]}
                                layout={{
                                    width: 700, height: 400, title: 'Classifications per device - All',
                                    xaxis: {
                                        visible: true,
                                        title: "Devices",
                                    },
                                    yaxis: {
                                        visible: true,
                                        title: "Classifications"
                                    }
                                }}
                                /> : ''
                        }
                    </div>
                </div>
            </div>
        );
    }
}

class InferencesPerSecond extends Component {
    constructor(props){
        super(props);
    }

    render () {
        return (
            <div className={this.props.showBar ? 'inferences-per-second-wrapper' : ''}>
                <span className="inferences-per-second"> Inferences Per Second: {this.props.inferencesPerSecond} </span>
            </div>
        )
    }
}

export default ResultWrapper;