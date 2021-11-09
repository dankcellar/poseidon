import React from "react";
import {useWeb3React} from "@web3-react/core";
import {verifySignature} from "../utils/api";
import {injected} from "../utils/connectors";

export default function Verify(props) {
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
            const signature = await library.eth.personal.sign(discordId, account);
            await verifySignature(discordId, signature, account);
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
