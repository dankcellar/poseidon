import React from "react";

export const typeSuccess = 'is-primary';
export const typeError = 'is-danger';

export default function Message({id, body, type}) {
    if (!id || !body) return null;
    return (
        <div data-test="message" key={id} className={["message", "message-" + id, type].join(" ")}>
            <div data-test="message-body" className="message-body">{body}</div>
        </div>
    );
}
