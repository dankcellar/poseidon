import React from "react";
import Message from "./Message"
import "./Messages.css"
import PropTypes from 'prop-types';

export default function Messages({messages}) {
    return (
        <React.Fragment>
            <div className="messages" id="messages">
                {messages.map(m => <Message key={m.id} id={m.id} body={m.body} type={m.type}/>)}
            </div>
        </React.Fragment>
    );
};

Messages.propTypes = {
    messages: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number,
        body: PropTypes.string,
        type: PropTypes.string,
    }))
};
