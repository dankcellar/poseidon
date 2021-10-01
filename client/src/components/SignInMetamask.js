import React, {useContext} from "react";
import AppContext from "../pages/AppContext";
import {addErrorMessage} from "../utils/messages";

export default function SignInMetamask() {
    const appContext = useContext(AppContext);

    const signInMetamask = async () => {
        try {
            await appContext.enableMetamask();
        } catch (e) {
            addErrorMessage(e.message);
        }
    };

    function renderSignInButton() {
        const contract = appContext.contract;
        if (Object.keys(contract).length === 0) {
            return (
                <div>This browser is not compatible with metamask</div>
            );
        }
        const account = appContext.account;
        if (account === "") {
            return (
                <button onClick={signInMetamask}>Sign in</button>
            );
        } else {
            return (
                <p>Logged in!</p>
            );
        }
    }

    return (
        <div className="component-sign-in-metamask">{renderSignInButton()}</div>
    );
}
