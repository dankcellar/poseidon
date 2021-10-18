import React from "react";
import PropTypes from 'prop-types';

export default function Select({name, label, options, icon, value, error, ...rest}) {
    return (
        <div className="field">
            <label className="label" htmlFor={name}>{label}</label>
            <div className={["control", icon ? "has-icons-left" : ""].join(" ")}>
                <div className={["select", "is-fullwidth"].join(" ")}>
                    <select id={name} name={name} {...rest}>
                        {
                            options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)
                        }
                    </select>
                </div>
                {icon && <span className="icon is-small is-left"><i className={["fa", icon].join(" ")}/></span>}
            </div>
            {error && <p className="help is-danger">{error}</p>}
        </div>
    );
}

Select.propTypes = {
    name: PropTypes.string,
    label: PropTypes.string,
    icon: PropTypes.string,
    options: PropTypes.arrayOf(PropTypes.object),
    error: PropTypes.string,
}