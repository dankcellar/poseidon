import React, {useContext, useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {useWeb3React} from "@web3-react/core";
import AppContext from "./AppContext";

export default function Account() {
    const [tokens, setTokens] = useState([]);

    const {account} = useWeb3React();
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
            const token = await poseidon.methods.tokenOfOwnerByIndex(account, i).call();
            const power = await poseidon.methods.power(token).call();
            newTokens.push({
                "id": token,
                "power": power,
                "owner": account,
            })
        }
        setTokens(newTokens);
    }

    function renderMyTokens() {
        if (!poseidon) return;
        return (
            <div>
                {
                    tokens.map(f =>
                        <div className="m-5" key={f.id}>
                            <div>Token: <Link to={"/token/" + f["id"]}>{f["id"]}</Link></div>
                            <div>Power: {f["power"]}</div>
                            <div>Address: {f["owner"]}</div>
                        </div>
                    )
                }
            </div>
        );
    }

    return (
        <section className="section">
            <div className="container account">
                <h1>My tokens</h1>
                <div>{renderMyTokens()}</div>
            </div>
        </section>
    );
}
