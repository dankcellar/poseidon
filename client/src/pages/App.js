import Web3 from 'web3';
import Poseidon from '../contracts/Poseidon.json';
import {useEffect, useState} from "react";
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import AppContext from "./AppContext";
import Home from "./Home";
import Account from "./Account";
import Messages from "../components/Messages";
import Token from "./Token";
import NavBar from "../components/NavBar";

const ContractAddress = "0x2007b5F7f89e68c729073f853fD143bA0d010a93";
const APIBaseUrl = " http://51.83.43.205:8080/token/";

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
            const contract = new window.web3.eth.Contract(Poseidon.abi, ContractAddress);
            const power = await contract.methods.power(2).call();
            console.log(power);
            setContract(contract);
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
            await window.ethereum.send("eth_requestAccounts");
            const accounts = await window.web3.eth.getAccounts();
            setAccount(accounts[0]);
            return accounts[0];
        }
        return account;
    };

    return (
        <AppContext.Provider value={{
            contract: contract,
            account: account,
            apiBaseUrl: APIBaseUrl,
            enableMetamask: enableMetamask,
        }}>
            <BrowserRouter>
                <div className="App">
                    <NavBar/>
                    <Switch>
                        <Route path="/account" component={Account}/>
                        <Route path="/token/:id" component={Token}/>
                        <Route path="/" component={Home}/>
                    </Switch>
                    <Messages messages={[]}/>
                </div>
            </BrowserRouter>
        </AppContext.Provider>
    );
}
