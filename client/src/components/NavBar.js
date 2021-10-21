import React from "react";
import {NavLink} from "react-router-dom";
import {useWeb3React} from "@web3-react/core";
import {injected} from "../utils/connectors";

export default function NavBar() {
    const {active, account, activate, deactivate} = useWeb3React();

    async function connect() {
        try {
            await activate(injected);
        } catch (e) {
            console.log(e);
        }
    }

    async function disconnect() {
        try {
            await deactivate();
        } catch (e) {
            console.log(e);
        }
    }

    return (
        <section className="section">
            <div className="container navbar">
                <ul>
                    <li><NavLink to="/">Home</NavLink></li>
                    <li><NavLink to="/account">My Account</NavLink></li>
                    <li><NavLink to="/token/2">Check token #2</NavLink></li>
                    <li><a href="https://testnets.opensea.io/collection/poseidon-v2">View in opensea</a></li>
                </ul>
                <ul>
                    <li>{active ? <span>{account}
                            <button onClick={disconnect}>Logout</button></span> :
                        <button onClick={connect}>Connect Metamask</button>}</li>
                </ul>
            </div>
        </section>
    );
}
