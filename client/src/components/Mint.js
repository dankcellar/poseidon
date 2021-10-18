import React, {useContext, useState} from "react";
import {addErrorMessage, addMessage} from "../utils/messages";
import AppContext from "../pages/AppContext";
import Select from "./Select";

export default function Mint({myFish}) {
    const appContext = useContext(AppContext);
    const [mintAmount, setMintAmount] = useState(1);

    const mint = async () => {
        try {
            const account = await appContext.enableMetamask();
            const contract = appContext.contract;
            const totalPrice = mintAmount*0.08*1000000000000000000;
            await contract.methods.mint(mintAmount).send({from: account, value: totalPrice});
            addMessage("Minted successfully, awaiting confirmation");
        } catch (e) {
            addErrorMessage(e.message);
        }
    };

    const mintAmountOptions = () => {
        let options = [];
        for (let i = 1; i <= 10; i++) {
            options.push({
                value: i,
                label: i,
                name: i,
            });
        }
        return options;
    };

    const onSelectMintAmount = ({currentTarget: input}) => {
        setMintAmount(input.value);
    };

    return (
        <div className="component-mint">
            <Select name="mint-amount" label="Mint" options={mintAmountOptions()} onChange={onSelectMintAmount} />
            <button onClick={() => mint()}>Mint</button>
        </div>
    );
}
