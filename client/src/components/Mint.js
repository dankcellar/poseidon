import React, {useContext, useState} from "react";
import {addErrorMessage, addMessage} from "../utils/messages";
import AppContext from "../pages/AppContext";
import Select from "./Select";
import {useWeb3React} from "@web3-react/core";

export default function Mint() {
    const [mintAmount, setMintAmount] = useState(1);
    const {poseidon} = useContext(AppContext);
    const {account} = useWeb3React();

    const mint = async () => {
        if (!poseidon) return;
        try {
            const totalPrice = mintAmount*0.08*1000000000000000000;
            await poseidon.methods.mint(mintAmount).send({from: account, value: totalPrice});
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
            <p>Thanks for all the fish!</p>
        </div>
    );
}
