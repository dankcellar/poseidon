import React, {useState} from "react";
import {useWeb3React} from "@web3-react/core";
import {verifySignature} from "../utils/api";
import {injected} from "../utils/connectors";
import {addErrorMessage, addMessage} from "../utils/messages";

export default function Verify(props) {
    const [verified, setVerified] = useState(false);
    const discordId = props.match.params.id;

    const {active, activate, library, account} = useWeb3React();

    async function connect() {
        try {
            await activate(injected);
        } catch (e) {
            console.log(e);
        }
    }

    const signMessage = async () => {
        if (!!library) {
            try {
                const signature = await library.eth.personal.sign(discordId, account);
                await verifySignature(discordId, account, signature);
                console.log(discordId, account, signature);
                setVerified(true);
                addMessage("Verified successfully");
            } catch (e) {
                addErrorMessage(e.message);
            }
        }
    };

    function verify() {
        if (!active || !library) {
            return (
                <div className="verify-not-active">
                    <p>To verify your Discord account, please connect Metamask.</p>
                    <button onClick={connect}>Connect</button>
                </div>
            );
        }
        if (discordId.length < 10) {
            return (
                <div className="verify-not-active">
                    <p>Discord account is invalid, please contact an admin in Discord.</p>
                </div>
            );
        }
        if (verified) {
            return (
                <div className="verify-success">
                    <p>Verified successfully, please let some time for the machines to get you verified.</p>
                    <p>Typically it takes between minutes and four hours, if after that time you are not verified contact an Admin in Discord.</p>
                </div>
            );
        }
        return (
            <div className="verify-active">
                <p>To prove ownership for your discord user, please sign using your account.</p>
                <button onClick={signMessage}>Sign</button>
            </div>
        );
    }

    return (
        <section className="section verify">
            <div className="container">
                <h1>Sign Message</h1>
                <div>{verify()}</div>
            </div>
        </section>
    );
}
