import React from "react";
import PropTypes from 'prop-types';

export default function Input({name, label, icon, type, error, ...rest}) {
    return (
        <div className="field">
            <label className="label" htmlFor={name}>{label}</label>
            <div className={["control", "has-icons-right", icon ? "has-icons-left" : ""].join(" ")}>
                <input
                    id={name}
                    name={name}
                    type={type ? type : "text"}
                    placeholder={label}
                    className={["input", error ? "is-danger" : ""].join(" ")}
                    {...rest}
                />
                {icon && <span className="icon is-small is-left"><i className={["fa", icon].join(" ")}/></span>}
                {error && <span className="icon is-small is-right"><i className="fa fa-exclamation-triangle"/></span>}
            </div>
            {error && <p className="help is-danger">{error}</p>}
        </div>
    );
}

Input.propTypes = {
    name: PropTypes.string,
    label: PropTypes.string,
    icon: PropTypes.string,
    type: PropTypes.string,
    error: PropTypes.string,
}