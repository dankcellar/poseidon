import React, {useContext, useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {useWeb3React} from "@web3-react/core";
import AppContext from "./AppContext";
import {renderTokenImage} from "../utils/images";

export default function Account() {
    const [tokens, setTokens] = useState(null);

    const {account, active} = useWeb3React();
    const {poseidon} = useContext(AppContext);

    useEffect(() => {
        myTokens().then();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [poseidon, account]);

    const myTokens = async () => {
        const tokenSort = function (a, b) {
            if (a.id > b.id) return 1;
            if (a.id < b.id) return -1;
            return 0;
        };

        if (!poseidon || !account) return;
        const balance = await poseidon.methods.balanceOf(account).call();
        let myTokens = [];
        if (parseInt(balance) === 0) {
            setTokens(myTokens);
            return;
        }
        let j = 0;
        for (let i = 0; i < balance; i++) {
            // eslint-disable-next-line no-loop-func
            poseidon.methods.tokenOfOwnerByIndex(account, i).call().then(function (tokenId) {
                poseidon.methods.level(tokenId).call().then(function (level) {
                    myTokens.push({
                        id: parseInt(tokenId),
                        level: level,
                    });
                    if (++j === parseInt(balance)) {
                        myTokens.sort(tokenSort);
                        setTokens(myTokens);
                    }
                });
            });
        }
    }

    function renderMyTokens() {
        if (!active || !poseidon) {
            return (
                <div className="account-not-active">You need to connect to see your fish.</div>
            );
        }
        if (tokens === null) {
            return (
                <div className="account-loading-tokens">Loading...</div>
            );
        }
        if (tokens.length === 0) {
            return (
                <div className="account-no-tokens">
                    <p>You have no fish!</p>
                    <p>
                        <a href={process.env.REACT_APP_OPENSEA} target="_blank" rel="noopener noreferrer">
                            Buy some fish to see it here.
                        </a>
                    </p>
                </div>
            );
        }
        return (
            <div className="account has-tokens">
                {
                    tokens.map(f =>
                        <div className="token-item" key={f.id}>
                            <div className="token-image">{renderTokenImage(f)}</div>
                            <div className="token-name">Fish #{f.id}</div>
                            <div className="token-level">Level: {f["level"]}</div>
                            <div className="token-view">
                                <Link to={"/token/" + f.id} className="view-button">View</Link>
                            </div>
                        </div>
                    )
                }
            </div>
        );
    }

    return (
        <section className="section account-page">
            <div className="container">
                <h1>My tokens</h1>
                <div>{renderMyTokens()}</div>
            </div>
        </section>
    );
}
