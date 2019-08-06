import React from 'react';
import { observer } from 'mobx-react';
import SimpleInput from './observer';

const $btn = 'f6 link dim bn br2 ph3 pv2 mr2 dib white bg-dark-blue btn-primary';

// title, role, contexts, target, modelName, batchSize, dataDir

export default observer(({ form }) => (
    <form onSubmit={form.onSubmit}>
        <SimpleInput field={form.$('title')} />
        <SimpleInput field={form.$('role')} />
        <SimpleInput field={form.$('ip')} />
        <SimpleInput field={form.$('username')} />
        <SimpleInput field={form.$('password')} />
        {/*<SimpleInput field={form.$('contexts')} />*/}
        {/*<SimpleInput field={form.$('target')} />*/}
        {/*<SimpleInput field={form.$('modelName')} />*/}
        {/*<SimpleInput field={form.$('batchSize')} />*/}
        {/*<SimpleInput field={form.$('dataDir')} />*/}

        <br />
        <button type="submit" className={$btn} onClick={form.onSubmit}>Submit</button>
        <button type="button" className={$btn} onClick={form.onClear}>Clear</button>
        <button type="button" className={$btn} onClick={form.onReset}>Reset</button>

        <p>{form.error}</p>
    </form>
));
