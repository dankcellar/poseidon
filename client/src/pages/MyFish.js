import React, {useContext, useEffect, useState} from "react";
import Mint from "../components/Mint";
import SignInMetamask from "../components/SignInMetamask";
import AppContext from "./AppContext";
import {Link} from "react-router-dom";

export default function MyFish() {
    const [balance, setBalance] = useState(0);
    const [fish, setFish] = useState([]);

    const appContext = useContext(AppContext);

    useEffect(() => {
        myFish().then();
    }, []);

    const myFish = async () => {
        const account = appContext.account;
        const contract = appContext.contract;
        if (account === "" && Object.keys(contract).length === 0) {
            return;
        }
        const balance = await contract.methods.balanceOf(account).call();
        if (balance > 0) {
            setBalance(balance);
        }
        let newFish = [];
        for (let i = 0; i < balance; i++) {
            const token = await contract.methods.tokenOfOwnerByIndex(account, i).call();
            const tokenPower = await contract.methods.tokenPower(token).call();
            newFish.push({
                "id": token,
                "power": tokenPower,
                "owner": account,
            })
        }
        setFish(newFish);
    }

    function renderMyFish() {
        const account = appContext.account;
        if (account === "") {
            return (
                <div>You need to be logged in to see your fish: <SignInMetamask/></div>
            );
        }
        return (
            <div>
                {
                    fish.map(f =>
                        <div className="m-5" key={f.id}>
                            <div>Token: <Link to={"/fish/" + f["id"]}>{f["id"]}</Link></div>
                            <div>Power: {f["power"]}</div>
                            <div>Address: {f["owner"]}</div>
                        </div>
                    )
                }
            </div>
        );
    }

    return (
        <div className="my-fish">
            <h1>My fish</h1>
            <div>
                <Mint myFish={myFish}/>
                <div>{renderMyFish()}</div>
            </div>
        </div>
    );
}
