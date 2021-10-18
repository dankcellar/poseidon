import React, {useContext, useEffect, useState} from "react";
import {addErrorMessage, addMessage} from "../utils/messages";
import AppContext from "./AppContext";
import {Link} from "react-router-dom";

export default function Fish(props) {
    const appContext = useContext(AppContext);
    const id = props.match.params.id;

    const [fish, setFish] = useState({});
    const [preys, setPreys] = useState([]);

    useEffect(() => {
        fishInfo().then(function () {
            availablePreys().then();
        });
    }, []);

    const fishInfo = async () => {
        const contract = appContext.contract;
        if (Object.keys(contract).length === 0) {
            return;
        }
        // TODO check if token does not exist
        const power = await contract.methods.power(id).call();
        const owner = await contract.methods.ownerOf(id).call();
        let currentFish = {
            "id": id,
            "power": power,
            "owner": owner,
        };
        setFish(currentFish);
    }

    const availablePreys = async () => {
        const account = appContext.account;
        const contract = appContext.contract;
        if (account === "" && Object.keys(contract).length === 0) {
            return;
        }
        const balance = await contract.methods.balanceOf(account).call();
        let currentPreys = [];
        for (let i = 0; i < balance; i++) {
            const token = await contract.methods.tokenOfOwnerByIndex(account, i).call();
            const tokenPower = await contract.methods.power(token).call();
            if (token !== fish["id"] && tokenPower <= fish["power"]) {
                currentPreys.push({
                    "id": token,
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
            fishInfo();
            availablePreys();
        } catch (e) {
            addErrorMessage(e.message);
        }
    };

    return (
        <div className="fish">
            <h1>Fish #{fish["id"]}</h1>
            <div>Power: {fish["power"]}</div>
            <div>Address: {fish["owner"]}</div>
            <h2>Can hunt with:</h2>
            <div>
                {
                    preys.map(f =>
                        <div className="m-5" key={f["id"]}>
                            <div>Token: <Link to={"/fish/" + f["id"]}>{f["id"]}</Link></div>
                            <div>Power: {f["power"]}</div>
                            <div>Address: {f["owner"]}</div>
                            <button onClick={() => hunt(fish["id"], f["id"])}>Hunt</button>
                        </div>
                    )
                }
            </div>
        </div>
    );
}
