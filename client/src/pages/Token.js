import React, {useContext, useEffect, useState} from "react";
import {addErrorMessage, addMessage} from "../utils/messages";
import AppContext from "./AppContext";
import {Link} from "react-router-dom";
import {useWeb3React} from "@web3-react/core";
import {fetchToken} from "../utils/api";
import useDynamicRefs from 'use-dynamic-refs';

export default function Token(props) {
    const [tokenData, setTokenData] = useState({});
    const [preys, setPreys] = useState([]);
    const [getRef, setRef] = useDynamicRefs();

    const {poseidon} = useContext(AppContext);
    const {active, account} = useWeb3React();
    const tokenId = props.match.params.id;

    useEffect(() => {
        fetchTokenData().then();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [poseidon, tokenId]);

    const fetchTokenData = async () => {
        const tokenSort = function(a, b) {
            if (a.id > b.id) return 1;
            if (a.id < b.id) return -1;
            return 0;
        };

        if (!poseidon) return;
        const _power = await poseidon.methods.power(tokenId).call();
        const _owner = await poseidon.methods.ownerOf(tokenId).call();
        const _apiData = await fetchToken(tokenId, _power);
        const _token = {
            id: tokenId,
            power: _power,
            owner: _owner,
            api: _apiData
        };
        setTokenData(_token);
        // fetch preys
        if (_owner === account) {
            const balance = await poseidon.methods.balanceOf(account).call();
            let preyList = [];
            let j = 0;
            for (let i = 0; i < balance; i++) {
                // eslint-disable-next-line no-loop-func
                poseidon.methods.tokenOfOwnerByIndex(account, i).call().then(function (preyId) {
                    poseidon.methods.power(preyId).call().then(function (preyPower) {
                        if (preyPower <= _token.power && preyId !== _token.id) {
                            fetchToken(preyId, preyPower).then(function (tokenApiData) {
                                preyList.push({
                                    id: parseInt(preyId),
                                    power: preyPower,
                                    api: tokenApiData
                                });
                                if (++j === parseInt(balance)) {
                                    preyList.sort(tokenSort);
                                    setPreys(preyList);
                                }
                            }).catch(function (e) {
                                addErrorMessage("Error while loading token " + i + " of account: " + e)
                                if (++j === parseInt(balance)) {
                                    preyList.sort(tokenSort);
                                    setPreys(preyList);
                                }
                            });
                        } else {
                            if (++j === parseInt(balance)) {
                                preyList.sort(tokenSort);
                                setPreys(preyList);
                            }
                        }
                    });
                });
            }
        }
    }

    const hunt = async (predator, prey) => {
        if (!poseidon) return;
        const huntButton = getRef(prey).current;
        try {
            huntButton.innerText = "Hunting...";
            huntButton.disabled = true;
            await poseidon.methods.hunt(predator, prey).send({from: account});
            addMessage("Fish #" + prey + " hunted by fish #" + predator + " successfully.");
            await fetchTokenData();
        } catch (e) {
            huntButton.innerText = "Hunt!";
            huntButton.disabled = false;
            addErrorMessage(e.message);
        }
    };

    function renderTokenImage(data) {
        if (!data || typeof data.api === "undefined") {
            return;
        }
        const img = data.api.image.replace("ipfs://", process.env.REACT_APP_API_IMAGE_URL) + ".png";
        return <img src={img} alt={data.api.name}/>
    }

    function renderTokenHunt() {
        if (!active || !poseidon || account !== tokenData.owner) {
            return (
                <div className="token-hunt-not-active">You need to be the owner of the fish to hunt.</div>
            );
        }
        return (
            <div className="token-hunt">
                <h2>Can hunt the following preys:</h2>
                <p className="token-hunt-alert">When hunting, your prey will be burned (will cease to exist), and the prey power will be added to Fish #{tokenData.id}.</p>
                <div className="prey-list">
                    {
                        preys.map(f =>
                            <div className="prey" key={f.id}>
                                <div className="prey-image">{renderTokenImage(f)}</div>
                                <div className="prey-name"><Link to={"/token/" + f.id}>Fish #{f.id}</Link></div>
                                <div className="prey-power">Power: {f.power}</div>
                                <button ref={setRef(f.id)} className="prey-hunt" onClick={() => hunt(tokenData.id, f.id)}>Hunt!</button>
                            </div>
                        )
                    }
                </div>
            </div>
        );
    }

    function renderToken() {
        if (!active || !poseidon) {
            return (
                <div className="token-not-active">You need to connect Metamask to load this page.</div>
            );
        }
        return (
            <React.Fragment>
                <div className="token-image">{renderTokenImage(tokenData)}</div>
                <div className="token-data">
                    <h1>Fish #{tokenData.id}</h1>
                    <div>Power: {tokenData.power}</div>
                    <div>Owner: {tokenData.owner === account ? "You" : tokenData.owner}</div>
                    <div className="token-hunt">{renderTokenHunt()}</div>
                </div>
            </React.Fragment>
        );
    }

    return (
        <section className="section token-page">
            <div className="container">
                <div className="token">{renderToken()}</div>
            </div>
        </section>
    );
}
