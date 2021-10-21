import Poseidon from '../contracts/Poseidon.json';
import {useEffect, useState} from "react";
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import Home from "./Home";
import Account from "./Account";
import Messages from "../components/Messages";
import Token from "./Token";
import NavBar from "../components/NavBar";
import {useWeb3React} from "@web3-react/core";
import AppContext from "./AppContext";

export default function App() {
    const [poseidon, setPoseidon] = useState(false);
    const {library} = useWeb3React();

    useEffect(() => {
        loadContract().then();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [library]);

    const loadContract = async () => {
        if (!!library) {
            const contract = new library.eth.Contract(Poseidon.abi, process.env.REACT_APP_CONTRACT_ADDRESS);
            setPoseidon(contract);
        } else {
            setPoseidon(false);
        }
    };

    return (
        <AppContext.Provider value={{poseidon: poseidon}}>
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
