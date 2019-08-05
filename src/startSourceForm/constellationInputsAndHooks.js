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
        name: "",
        label: "Title",
        placeholder: "Device title",
        rules: "required|string|between:1,25",
        value: "Odroid 1"
    },
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
        .then(result => {
            console.log(JSON.stringify(result));

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
