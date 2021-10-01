import React, {useContext} from "react";
import {addErrorMessage, addMessage} from "../utils/messages";
import AppContext from "../pages/AppContext";

export default function Mint({myFish}) {
    const appContext = useContext(AppContext);

    const mint = async () => {
        try {
            const account = await appContext.enableMetamask();
            const contract = appContext.contract;
            await contract.methods.mintFish(account).send({from: account});
            addMessage("Minted successfully, awaiting confirmation");
            myFish();
        } catch (e) {
            addErrorMessage(e.message);
        }
    };

    return (
        <div className="component-mint">
            <button onClick={() => mint()}>Mint</button>
        </div>
    );
}
