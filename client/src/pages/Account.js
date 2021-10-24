import React, {useContext, useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {useWeb3React} from "@web3-react/core";
import AppContext from "./AppContext";
import {fetchToken} from "../utils/api";
import {addErrorMessage} from "../utils/messages";

export default function Account() {
    const [tokens, setTokens] = useState([]);

    const {account, active} = useWeb3React();
    const {poseidon} = useContext(AppContext);

    useEffect(() => {
        myTokens().then();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [poseidon]);

    const myTokens = async () => {
        if (!poseidon) return;
        const balance = await poseidon.methods.balanceOf(account).call();
        let newTokens = [];
        for (let i = 0; i < balance; i++) {
            try {
                const tokenId = await poseidon.methods.tokenOfOwnerByIndex(account, i).call();
                const power = await poseidon.methods.power(tokenId).call();
                const tokenApiData = await fetchToken(tokenId);
                console.log(tokenApiData);
                newTokens.push({
                    id: tokenId,
                    power: power,
                    owner: account,
                    api: tokenApiData
                })
                setTokens(newTokens);
            } catch (e) {
                addErrorMessage("Error while loading token " + i + " of account: " + e);
            }
        }
    }

    function getTokenImage(token) {
        if (!token.api || Object.keys(token.api).length === 0) {
            return;
        }
        const img = token.api.image.replace("ipfs://", process.env.REACT_APP_IPFS_GATEWAY);
        return <img src={img} alt={token.api.name} />
    }

    function renderMyTokens() {
        if (!active || !poseidon) {
            return (
                <div className="account-not-active">You need to connect to see your fish.</div>
            );
        }
        return (
            <div>
                {
                    tokens.map(f =>
                        <div className="my-5" key={f.id}>
                            <Link to={"/token/" + f.id}>
                                <div>Token: {f.id}</div>
                                <div>{getTokenImage(f)}</div>
                                <div>Power: {f["power"]}</div>
                                <div>Address: {f["owner"]}</div>
                            </Link>
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
