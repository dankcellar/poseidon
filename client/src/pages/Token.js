import React, {useContext, useEffect, useState} from "react";
import {addErrorMessage, addMessage} from "../utils/messages";
import AppContext from "./AppContext";
import {Link} from "react-router-dom";
import {useWeb3React} from "@web3-react/core";
import {fetchToken} from "../utils/api";

export default function Token(props) {
    const [tokenApiData, setTokenApiData] = useState({});
    const [tokenWeb3Data, setTokenWeb3Data] = useState({});
    const [preys, setPreys] = useState([]);

    const {poseidon} = useContext(AppContext);
    const {account} = useWeb3React();
    const tokenId = props.match.params.id;

    useEffect(() => {
        fetchTokenApiData().then();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        fetchTokenWeb3Data().then();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [poseidon]);

    useEffect(() => {
        fetchPreys().then();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tokenApiData]);

    const fetchTokenApiData = async () => {
        try {
            const _tokenApiData = await fetchToken(tokenId);
            setTokenApiData(_tokenApiData);
        } catch (e) {
            addErrorMessage(e);
        }
    }

    const fetchTokenWeb3Data = async () => {
        if (!poseidon) return;
        const power = await poseidon.methods.power(tokenId).call();
        const owner = await poseidon.methods.ownerOf(tokenId).call();
        const _token = {
            "id": tokenId,
            "power": power,
            "owner": owner,
        };
        setTokenWeb3Data(_token);
    }

    const fetchPreys = async () => {
        if (!poseidon) return;
        const balance = await poseidon.methods.balanceOf(account).call();
        let currentPreys = [];
        for (let i = 0; i < balance; i++) {
            const _tokenId = await poseidon.methods.tokenOfOwnerByIndex(account, i).call();
            const power = await poseidon.methods.power(tokenId).call();
            if (power <= tokenWeb3Data["power"] && _tokenId !== tokenWeb3Data["id"]) {
                currentPreys.push({
                    "id": tokenId,
                    "power": power,
                    "owner": account,
                });
            }
        }
        setPreys(currentPreys);
    }

    function getTokenImage() {
        if (Object.keys(tokenApiData).length === 0) {
            return;
        }
        let img = tokenApiData.image.replace("ipfs://", process.env.REACT_APP_IPFS_GATEWAY);
        return <img src={img} alt={tokenApiData.name} />
    }

    const hunt = async (predator, prey) => {
        if (!poseidon) return;
        try {
            await poseidon.methods.hunt(predator, prey).send({from: account});
            addMessage("Minted successfully, awaiting confirmation");
            await fetchTokenWeb3Data();
            await fetchPreys();
        } catch (e) {
            addErrorMessage(e.message);
        }
    };

    return (
        <section className="section token-page">
            <div className="container">
                <h1>Poseidon #{tokenWeb3Data["id"]}</h1>
                <div>{getTokenImage()}</div>
                <div>Power: {tokenWeb3Data["power"]}</div>
                <div>Address: {tokenWeb3Data["owner"]}</div>
                <h2>Can hunt with:</h2>
                <div>
                    {
                        preys.map(f =>
                            <div className="m-5" key={f["id"]}>
                                <div>Token: <Link to={"/fish/" + f["id"]}>{f["id"]}</Link></div>
                                <div>Power: {f["power"]}</div>
                                <div>Address: {f["owner"]}</div>
                                <button onClick={() => hunt(tokenWeb3Data["id"], f["id"])}>Hunt</button>
                            </div>
                        )
                    }
                </div>
            </div>
        </section>
    );
}
