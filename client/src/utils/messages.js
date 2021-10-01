export const typeSuccess = 'is-primary';
export const typeError = 'is-danger';

/**
 * Messages
 */

export function addMessage(body, type = typeSuccess) {
    if (type === typeError) {
        console.error("Message", body);
    } else {
        console.log("Message", body);
    }

    const message = document.createElement("div");
    message.className = `message ${type}`;
    const messageBody = document.createElement("div");
    messageBody.className = `message-body`;
    messageBody.innerText = body;

    message.append(messageBody);
    const messages = document.getElementById("messages");
    if (messages) messages.append(message);

    const timer = setTimeout(() => {
        message.remove();
    }, 5 * 1000);
    return () => clearTimeout(timer);
}

export function addErrorMessage(body) {
    return addMessage(body, typeError);
}
