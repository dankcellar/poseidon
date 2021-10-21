import React, {useContext, useEffect, useState} from "react";
import {addErrorMessage, addMessage} from "../utils/messages";
import AppContext from "./AppContext";
import {Link} from "react-router-dom";
import {useWeb3React} from "@web3-react/core";

export default function Token(props) {
    const [token, setToken] = useState({});
    const [preys, setPreys] = useState([]);

    const {poseidon} = useContext(AppContext);
    const {account} = useWeb3React();
    const tokenId = props.match.params.id;

    useEffect(() => {
        tokenInfo().then();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [poseidon]);

    useEffect(() => {
        availablePreys().then();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const tokenInfo = async () => {
        if (!poseidon) return;
        const power = await poseidon.methods.power(tokenId).call();
        const owner = await poseidon.methods.ownerOf(tokenId).call();
        const _token = {
            "id": tokenId,
            "power": power,
            "owner": owner,
        };
        setToken(_token);
    }

    const availablePreys = async () => {
        if (!poseidon) return;
        const balance = await poseidon.methods.balanceOf(account).call();
        let currentPreys = [];
        for (let i = 0; i < balance; i++) {
            const tokenId = await poseidon.methods.tokenOfOwnerByIndex(account, i).call();
            const power = await poseidon.methods.power(tokenId).call();
            if (tokenId !== token["id"] && power <= token["power"]) {
                currentPreys.push({
                    "id": tokenId,
                    "power": power,
                    "owner": account,
                });
            }
        }
        setPreys(currentPreys);
    }

    const hunt = async (predator, prey) => {
        if (!poseidon) return;
        try {
            await poseidon.methods.hunt(predator, prey).send({from: account});
            addMessage("Minted successfully, awaiting confirmation");
            await tokenInfo();
            await availablePreys();
        } catch (e) {
            addErrorMessage(e.message);
        }
    };

    return (
        <section className="section">
            <div className="container token">
                <h1>Poseidon #{token["id"]}</h1>
                <div>Power: {token["power"]}</div>
                <div>Address: {token["owner"]}</div>
                <h2>Can hunt with:</h2>
                <div>
                    {
                        preys.map(f =>
                            <div className="m-5" key={f["id"]}>
                                <div>Token: <Link to={"/fish/" + f["id"]}>{f["id"]}</Link></div>
                                <div>Power: {f["power"]}</div>
                                <div>Address: {f["owner"]}</div>
                                <button onClick={() => hunt(token["id"], f["id"])}>Hunt</button>
                            </div>
                        )
                    }
                </div>
            </div>
        </section>
    );
}
