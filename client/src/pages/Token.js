import React, {useContext, useEffect, useState} from "react";
import {addErrorMessage, addMessage} from "../utils/messages";
import AppContext from "./AppContext";
import {Link} from "react-router-dom";

export default function Token(props) {
    const appContext = useContext(AppContext);
    const id = props.match.params.id;

    const [token, setToken] = useState({});
    const [preys, setPreys] = useState([]);

    useEffect(() => {
        tokenInfo().then(function () {
            availablePreys().then();
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appContext.contract]);

    const tokenInfo = async () => {
        const contract = appContext.contract;
        if (Object.keys(contract).length === 0) {
            return;
        }
        const power = await contract.methods.power(id).call();
        const owner = await contract.methods.ownerOf(id).call();
        const _token = {
            "id": id,
            "power": power,
            "owner": owner,
        };
        setToken(_token);
    }

    const availablePreys = async () => {
        const account = await appContext.enableMetamask();
        const contract = appContext.contract;
        const balance = await contract.methods.balanceOf(account).call();
        let currentPreys = [];
        for (let i = 0; i < balance; i++) {
            const tokenId = await contract.methods.tokenOfOwnerByIndex(account, i).call();
            const tokenPower = await contract.methods.power(tokenId).call();
            if (tokenId !== token["id"] && tokenPower <= token["power"]) {
                currentPreys.push({
                    "id": tokenId,
                    "power": tokenPower,
                    "owner": account,
                });
            }
        }
        setPreys(currentPreys);
    }

    const hunt = async (predator, prey) => {
        try {
            const account = await appContext.enableMetamask();
            const contract = appContext.contract;
            await contract.methods.hunt(predator, prey).send({from: account});
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
