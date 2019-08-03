import React, { Component } from 'react';

class DeviceManagement extends Component {
    constructor(props) {
        super(props);
        this.state = {title: '', role: 'p', contexts: [], target: '', modelName: 'yolo', batchSize: 0, dataDir: '', removeId: ''};

        this.handleChangeName = this.handleChangeName.bind(this);
        this.handleChangeRole = this.handleChangeRole.bind(this);
        this.handleChangeTarget = this.handleChangeTarget.bind(this);
        this.handleChangeContexts = this.handleChangeContexts.bind(this);
        this.handleChangeDataDir = this.handleChangeDataDir.bind(this);
        this.handleChangeModel = this.handleChangeModel.bind(this);
        this.handleChangeRemoveId = this.handleChangeRemoveId.bind(this);
        this.handleSubmitRemoveDevice = this.handleSubmitRemoveDevice.bind(this);
        this.handleSubmitDevice = this.handleSubmitDevice.bind(this);
    }

    handleChangeName(event) {
        this.setState(
            {
                title: event.target.value}
        );
    }

    handleChangeRole(event) {
        this.setState(
            {
                role: event.target.value}
        );
    }

    handleChangeContexts(event) {
        this.setState(
            {
                contexts: event.target.value}
        );
    }

    handleChangeTarget(event) {
        this.setState(
            {
                target: event.target.value}
        );
    }

    handleChangeModel(event) {
        this.setState(
            {
                modelName: event.target.value}
        );
    }

    handleChangeBatchSize(event) {
        this.setState(
            {
                batchSize: event.target.value}
        );
    }

    handleChangeDataDir(event) {
        this.setState(
            {
                dataDir: event.target.value}
        );
    }

    handleChangeRemoveId(event) {
        this.setState(
            {
                removeId: event.target.value}
        );
    }

    handleSubmitDevice(event) {
        alert('A device was submitted' + this.state);
        event.preventDefault();
    }

    handleSubmitRemoveDevice(event) {
        alert('Remove device: ' + this.state.removeId);
        event.preventDefault();
    }

    render() {
        return (
            <div className="deviceManagement-wrapper" >
                <h1>Device Management</h1>
                <div className="deviceManagement-form-wrapper">
                    <h2> Add new device </h2>
                    <form className="addDeviceForm" onSubmit={this.handleSubmitDevice}>
                        <label>
                            Name: <input type="text" value={this.state.name} onChange={this.handleChangeName} />
                        </label>
                        <label>
                            Role (s/t/p): <input type="text" value={this.state.role} onChange={this.handleChangeRole} />
                        </label>
                        <label>
                            Contexts (comma separated, e.g. 'A,B,C'): <input type="text" value={this.state.context} onChange={this.handleChangeContexts} />
                        </label>
                        <label>
                            Model name: <input type="text" value={this.state.modelName} onChange={this.handleChangeModel} />
                        </label>
                        <label>
                            Batch size: <input type="text" value={this.state.batchSize} onChange={this.handleChangeBatchSize} />
                        </label>
                        <label>
                            Directory containing images to classify: <input type="text" value={this.state.dataDir} onChange={this.handleChangeDataDir} />
                        </label>
                        <label>
                            Target ID: <input type="text" value={this.state.target} onChange={this.handleChangeTarget} />
                        </label>
                        <input type="submit" value="Submit" />
                    </form>
                    <h2> Remove device </h2>
                    <form className="removeDeviceForm" onSubmit={this.handleSubmitRemoveDevice}>
                        <label>
                            Device ID:
                            <input type="text" value={this.state.removeId} onChange={this.state.handleChangeRemoveId} />
                        </label>
                    </form>
                </div>
                <div className="deviceManagement-devices">**Add a device**</div>
            </div>
        );
    }
}

export default DeviceManagement;