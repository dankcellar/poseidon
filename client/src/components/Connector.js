import React, {useContext, useEffect, useState} from "react";
import {useWeb3React} from "@web3-react/core";
import {injected} from "../utils/connectors";
import AppContext from "../pages/AppContext";
import {NavLink} from "react-router-dom";
import {addErrorMessage} from "../utils/messages";

export default function Account() {
    const [tokenBalance, setTokenBalance] = useState(0);

    const {active, account, activate, deactivate, library} = useWeb3React();
    const {poseidon} = useContext(AppContext);

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

    useEffect(() => {
        const fetchBalance = async () => {
            if (!poseidon) return;
            if (tokenBalance === 0) {
                const _tokenBalance = await poseidon.methods.balanceOf(account).call();
                setTokenBalance(_tokenBalance);
                // subscribe to blocks to update the current block
                library.eth.subscribe("newBlockHeaders", function(error) {
                    if (error) addErrorMessage(error);
                }).on("data", async function() {
                    const _tokenBalance = await poseidon.methods.balanceOf(account).call();
                    setTokenBalance(_tokenBalance);
                });
            }
        }
        fetchBalance().then();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [poseidon]);

    function getConnectedHello() {
        if (!active) return;
        const shortAccount = account.substr(0, 6) + "..." + account.substr(38, 4);
        if (tokenBalance === 0) {
            return (
                <span>
                    <span className="version-mini">You don't own fish</span>
                    <span className="version-normal">Hello {shortAccount}, you don't own fish</span>
                </span>);
        }
        return (
            <span>
                <span className="version-mini">You own <NavLink to="/account" className="my-account-link">{tokenBalance} fish</NavLink></span>
                <span className="version-normal">Hello {shortAccount}, you have <NavLink to="/account" className="my-account-link">{tokenBalance} fish</NavLink></span>
            </span>);
    }

    return (
        <section className="section account p-4">
            <div className="container">
                <div className="left">
                    <span className="connected-hello">
                        {active ? getConnectedHello() : <span>Not connected</span>}
                    </span>
                </div>
                <div className="right">
                    {active ? <button onClick={disconnect}>Disconnect</button> :
                        <button onClick={connect}>Connect</button>}
                </div>
            </div>
        </section>
    );
}
