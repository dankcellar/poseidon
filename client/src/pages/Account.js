import React, {useContext, useEffect, useState} from "react";
import SignInMetamask from "../components/SignInMetamask";
import AppContext from "./AppContext";
import {Link} from "react-router-dom";

export default function Account() {
    const [tokens, setTokens] = useState([]);

    const appContext = useContext(AppContext);

    useEffect(() => {
        myTokens().then();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appContext.contract]);

    const myTokens = async () => {
        const account = appContext.account;
        const contract = appContext.contract;
        if (account === "" && Object.keys(contract).length === 0) {
            return;
        }
        const balance = await contract.methods.balanceOf(account).call();
        let newTokens = [];
        for (let i = 0; i < balance; i++) {
            const token = await contract.methods.tokenOfOwnerByIndex(account, i).call();
            const tokenPower = await contract.methods.power(token).call();
            newTokens.push({
                "id": token,
                "power": tokenPower,
                "owner": account,
            })
        }
        setTokens(newTokens);
    }

    function renderMyTokens() {
        const account = appContext.account;
        if (account === "") {
            return (
                <div>You need to be logged in to see your tokens: <SignInMetamask/></div>
            );
        }
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
