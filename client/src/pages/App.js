import PoseidonAbi from '../abi/Poseidon.json';
import {useEffect, useState} from "react";
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import Home from "./Home";
import Account from "./Account";
import Messages from "../components/Messages";
import Token from "./Token";
import NavBar from "../components/NavBar";
import {useWeb3React} from "@web3-react/core";
import AppContext from "./AppContext";
import Footer from "../components/Footer";
import Connector from "../components/Connector";
import Verify from "./Verify";

export default function App() {
    const [poseidon, setPoseidon] = useState(null);
    const {library} = useWeb3React();

    useEffect(() => {
        loadContract().then();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [library]);

    const loadContract = async () => {
        if (!!library) {
            const contract = new library.eth.Contract(PoseidonAbi, process.env.REACT_APP_CONTRACT_ADDRESS);
            setPoseidon(contract);
        } else {
            setPoseidon(null);
        }
    };

    return (
        <AppContext.Provider value={{poseidon: poseidon}}>
            <BrowserRouter>
                <div className="App">
                    <NavBar/>
                    <Connector/>
                    <div className="main">
                        <Switch>
                            <Route path="/verify/:id" component={Verify}/>
                            <Route path="/account" component={Account}/>
                            <Route path="/token/:id" component={Token}/>
                            <Route path="/" component={Home}/>
                        </Switch>
                    </div>
                    <Footer/>
                    <Messages messages={[]}/>
                </div>
            </BrowserRouter>
        </AppContext.Provider>
    );
}
