import React, {useContext, useEffect, useState} from "react";
import {addErrorMessage, addMessage} from "../utils/messages";
import AppContext from "../pages/AppContext";
import Select from "./Select";
import {useWeb3React} from "@web3-react/core";
import {injected} from "../utils/connectors";

export default function Mint() {
    const [mintAmount, setMintAmount] = useState(1);
    const [startingBlock, setStartingBlock] = useState(0);
    const [currentBlock, setCurrentBlock] = useState(0);
    const [publicMinted, setPublicMinted] = useState(0);
    const [totalSupply, setTotalSupply] = useState(0);

    const {poseidon} = useContext(AppContext);
    const {active, account, activate, library} = useWeb3React();

    useEffect(() => {
        getStartingBlock().then();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [poseidon]);

    const getStartingBlock = async () => {
        if (!poseidon || !library) return;
        // subscribe to blocks to update the current block
        if (currentBlock === 0) {
            const _currentBlock = await library.eth.getBlockNumber();
            const _startingBlock = await poseidon.methods.startingBlock({from: account});
            const _totalSupply = await poseidon.methods.totalSupply({from: account});
            const _publicMinted = await poseidon.methods.publicMinted({from: account});
            setCurrentBlock(_currentBlock);
            setStartingBlock(_startingBlock);
            setTotalSupply(_totalSupply);
            setPublicMinted(_publicMinted);
            library.eth.subscribe("newBlockHeaders", function(error) {
                addErrorMessage(error);
            }).on("data", async function(blockHeader){
                setCurrentBlock(blockHeader.number);
                const _totalSupply = await poseidon.methods.totalSupply({from: account});
                const _publicMinted = await poseidon.methods.publicMinted({from: account});
                setTotalSupply(_totalSupply);
                setPublicMinted(_publicMinted);
            });
        }
    };

    async function connect() {
        try {
            await activate(injected);
        } catch (e) {
            console.log(e);
        }
    }

    const mint = async () => {
        if (!poseidon) return;
        try {
            const totalPrice = mintAmount * process.env.REACT_APP_MINT_PRICE * 1000000000000000000;
            await poseidon.methods.mint(mintAmount).send({from: account, value: totalPrice});
            addMessage("Minted successfully!");
        } catch (e) {
            addErrorMessage(e.message);
        }
    };

    const mintAmountOptions = () => {
        let options = [];
        for (let i = 1; i <= 10; i++) {
            options.push({value: i, label: i, name: i});
        }
        return options;
    };

    const onSelectMintAmount = ({currentTarget: input}) => {
        setMintAmount(input.value);
    };

    function getMintJSX() {
        if (!poseidon) return;
        if (startingBlock === 999999999) {
            return (
                <div className="mint-date">
                    Mint starts on {process.env.REACT_APP_MINT_DATE}, one day before we will announce the exact block.
                </div>
            );
        }
        if (currentBlock < startingBlock) {
            return (
                <div className="mint-block">
                    <p>Sale starts in {startingBlock - currentBlock} blocks.</p>
                </div>
            );
        }
        if (publicMinted === process.env.REACT_APP_MINT_PUBLIC) {
            return (
                <div className="mint-sold-out">
                    <p>Sold out!</p>
                    <p>Current total supply is {totalSupply}/10000</p>
                </div>
            );
        }
        return (
            <div className="mint">
                <p>{process.env.REACT_APP_MINT_PUBLIC - publicMinted} available fish.</p>
                <Select name="mint-amount" label="Mint" options={mintAmountOptions()} onChange={onSelectMintAmount}/>
                <button onClick={() => mint()}>Mint</button>
                <p>Thanks for all the fish!</p>
            </div>
        );
    }

    return (
        <div className="component-mint">
            {
                active ? getMintJSX() : <button onClick={connect}>Connect</button>
            }
        </div>
    );
}
