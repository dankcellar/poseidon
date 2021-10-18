import React, {useContext, useState} from "react";
import {addErrorMessage, addMessage} from "../utils/messages";
import AppContext from "../pages/AppContext";
import Input from "./Input";

export default function StartBlock() {
    const appContext = useContext(AppContext);
    const [startBlock, setStartBlock] = useState(0);

    const startingBlockSubmit = async () => {
        try {
            const account = await appContext.enableMetamask();
            const contract = appContext.contract;
            await contract.methods.setStartingBlock(startBlock).send({from: account});
            addMessage("StartBlock changed successfully");
        } catch (e) {
            addErrorMessage(e.message);
        }
    };

    const onStartingBlockChange = ({currentTarget: input}) => {
        setStartBlock(input.value);
    };

    return (
        <div className="component-mint">
            <Input name="start-block" label="StartBlock" onChange={onStartingBlockChange} />
            <button onClick={() => startingBlockSubmit()}>Submit</button>
        </div>
    );
}
