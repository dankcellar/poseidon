import Web3 from 'web3';
import Poseidon from '../contracts/Poseidon.json';
import {useEffect, useState} from "react";
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import AppContext from "./AppContext";
import Home from "./Home";
import MyFish from "./MyFish";
import LastHunts from "./LastHunts";
import Messages from "../components/Messages";
import {addErrorMessage} from "../utils/messages";
import Fish from "./Fish";

export default function App() {
    const [contract, setContract] = useState({});  // also used to know if connected
    const [account, setAccount] = useState("");  // also to know if metamask accepted connection

    useEffect(() => {
        loadWeb3().then();
    }, []);

    const loadWeb3 = async () => {
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum);
        } else if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider);
        }
        if (window.web3) {
            const networkId = await window.web3.eth.net.getId();
            const networkData = Poseidon.networks[networkId];
            if (!networkData) {
                addErrorMessage("Poseidon contract is not deployed.");
            }
            const abi = Poseidon.abi;
            const address = networkData.address;
            const contract = new window.web3.eth.Contract(abi, address);
            setContract(contract);
            const accounts = await window.web3.eth.getAccounts();
            if (accounts.length !== 0) {
                setAccount(accounts[0]);
            }
        }
    };

    const enableMetamask = async () => {
        if (!window.web3) {
            throw new Error("You need to have installed Metamask to do this!");
        }
        if (Object.keys(contract).length === 0) {
            throw new Error("Poseidon contract needs to be deployed to do this.");
        }
        if (account === "") {
            await window.ethereum.enable();
            const accounts = await window.web3.eth.getAccounts();
            setAccount(accounts[0]);
            return accounts[0];
        }
        return account;
    };

    return (
        <div className="App">
            <AppContext.Provider value={{
                contract: contract,
                account: account,
                enableMetamask: enableMetamask,
            }}>
                <BrowserRouter>
                    <Switch>
                        <Route path="/my-fish" component={MyFish}/>
                        <Route path="/fish/:id" component={Fish}/>
                        <Route path="/last-hunts" component={LastHunts}/>
                        <Route path="/" component={Home}/>
                    </Switch>
                </BrowserRouter>
            </AppContext.Provider>
            <Messages messages={[]}/>
        </div>
    );
}
