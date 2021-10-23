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
        if (currentBlock === 0) {
            library.eth.getBlockNumber().then(function(blockNumber) { setCurrentBlock(blockNumber); });
            updateBlockInfo();
            // subscribe to blocks to update the current block
            library.eth.subscribe("newBlockHeaders", function(error) {
                if (error) addErrorMessage(error);
            }).on("data", async function(blockHeader) {
                setCurrentBlock(blockHeader.number);
                updateBlockInfo();
            });
        }
    };

    function updateBlockInfo() {
        poseidon.methods.startingBlock().call({from: account}).then(function(startingBlock) {
            setStartingBlock(parseInt(startingBlock));
        });
        poseidon.methods.totalSupply().call({from: account}).then(function(totalSupply) {
            setTotalSupply(parseInt(totalSupply));
        });
        poseidon.methods.publicMinted().call({from: account}).then(function(publicMinted) {
            setPublicMinted(parseInt(publicMinted));
        });
    }

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
            addMessage("Minted successfully! Waiting for blockchain to confirm...");
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
        if (startingBlock === 0) return;
        if (startingBlock === 999999999) {
            return (
                <div className="mint-date">
                    <p>Mint starts on {process.env.REACT_APP_MINT_DATE}, some hours before we will announce the exact block.</p>
                    <p>Price per mint is {process.env.REACT_APP_MINT_PRICE} eth.</p>
                </div>
            );
        }
        if (currentBlock < startingBlock) {
            return (
                <div className="mint-block">
                    <p>Sale starts in {startingBlock - currentBlock} blocks.</p>
                    <p>Price per mint is {process.env.REACT_APP_MINT_PRICE} eth.</p>
                </div>
            );
        }
        if (publicMinted === 11) {
            return (
                <div className="mint-sold-out">
                    <p>Sold out!</p>
                    <p>Thanks for all the fish!</p>
                    <p>Current total supply is {totalSupply}/10000</p>

                </div>
            );
        }
        return (
            <div className="mint">
                <p>{process.env.REACT_APP_MINT_PUBLIC - publicMinted} available fish.</p>
                <p>Price per mint is {process.env.REACT_APP_MINT_PRICE} eth.</p>
                    <Select name="mint-amount" label="Mint" options={mintAmountOptions()} onChange={onSelectMintAmount}/>
                <button onClick={() => mint()}>Mint</button>
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
