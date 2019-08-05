import React from 'react';
import { observer } from 'mobx-react';

// styles
const $input = 'input-reset ba b--black-10 br1 pa2 mb2 db w-100 f6';
const $label = 'f7 db mb2 mt3 light-silver';
const $small = 'f6 db error-message';

export default observer(({ field, type = 'text', placeholder = null }) => (
    <div className="measure">
        <label htmlFor={field.id} className={$label}>
            {field.label}
        </label><br/>
        <input {...field.bind({ type, placeholder }) } className={$input}/>
        <small className={$small}>
            {field.error}
        </small>
    </div>
));