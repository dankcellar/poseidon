import React from "react";
import Mint from "../components/Mint";
import {useWeb3React} from "@web3-react/core";
import {injected} from "../utils/connectors";

export default function Home() {
    const {active, activate} = useWeb3React();

    async function connect() {
        try {
            await activate(injected);
        } catch (e) {
            console.log(e);
        }
    }

    return (
        <section className="section home-page">
            <div className="container">
                <h1>Poseidon</h1>
                <div>
                    {
                        active ? <Mint/> : <button onClick={connect}>Connect Metamask</button>
                    }
                </div>
            </div>
        </section>
    );
}
