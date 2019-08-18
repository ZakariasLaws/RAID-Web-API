import MobxReactForm from "mobx-react-form";
import dvr from "mobx-react-form/lib/validators/DVR";
import validatorjs from "validatorjs";
import {Utils} from "../utils";


const plugins = {
    dvr: dvr(validatorjs)
};

// title, role, contexts, target, modelName, batchSize, dataDir

const fields = [
    {
        name: "title",
        label: "Title",
        placeholder: "Device title",
        rules: "required|string|between:1,25",
        value: "Odroid 1"
    },
    {
        name: "role",
        label: "Role",
        placeholder: "Device role (s/p/t)",
        rules: "required|string|between:1,1"
    },
    {
        name: "contexts",
        label: "Contexts",
        placeholder: "Add device Contexts",
        rules: "string"
    },
    {
        name: "target",
        label: "Target (source only)",
        placeholder: "Target device ID",
        rules: "string"
    },
    {
        name: "modelName",
        label: "Model name, mnist, mnst_cnn, yolo, cifar10 (source only)",
        placeholder: "mnist",
        rules: "string"
    },
    {
        name: "batchSize",
        label: "Batch size 1-1000 (source only)",
        placeholder: "1",
        rules: "integer|max:1000"
    },
    {
        name: "dataDir",
        label: "Full directory path to images (source only)",
        placeholder: "/full/path/to/image/directory",
        rules: "string|min:2"
    },
    {
        name: "resultDir",
        label: "Full directory path to results (target only)",
        placeholder: "/full/path/to/result/file",
        rules: "string|min:2"
    },
    {
        name: "ip",
        label: "IP address of device (e.g. 10.72.25.33)",
        placeholder: "IP",
        rules: "string|min:5|required"
    },
    {
        name: "username",
        label: "Username of device (for remote command execution)",
        placeholder: "odroid",
        rules: "string|min:1|required"
    }
];


const hooks = {
    onSuccess(form) {
        // get field values
        fetch(Utils.API_URL, {
            method: 'POST',
            body: JSON.stringify(form.values()),
            headers:{
                'Content-Type': 'application/json'
            }
        })
            .then(Utils.handleFetchErrors)
            .then(result => {
            // console.log(JSON.stringify(result));

        }).catch(response => {
            console.log(response);
        });
    },
    onError(form) {
        // get all form errors
        console.log("All form errors", form.errors());
    }
};

export default new MobxReactForm({ fields }, { plugins, hooks });
