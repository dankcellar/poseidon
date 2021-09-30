import Web3 from 'web3';
import Poseidon from '../contracts/Poseidon.json';
import {useEffect, useState} from "react";

export default function App() {
    const [account, setAccount] = useState("");
    const [contract, setContract] = useState({});
    const [totalSupply, setTotalSupply] = useState(0);

    useEffect(() => {
        loadWeb3().then();
        loadBlockchainData().then();
    }, []);

    const loadWeb3 = async () => {
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum);
            await window.ethereum.enable();
        } else if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider);
        } else {
            window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
        }
    };

    const loadBlockchainData = async () => {
        const web3 = window.web3;
        // Load account
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);
        // Network
        const networkId = await web3.eth.net.getId();
        const networkData = Poseidon.networks[networkId];
        if (networkData) {
            const abi = Poseidon.abi;
            const address = networkData.address;
            const contract = new web3.eth.Contract(abi, address);
            setContract(contract);
            console.log(contract.methods);
            const totalSupply = await contract.methods.totalSupply().call();
            setTotalSupply(totalSupply);
        } else {
            window.alert('Smart contract not deployed to detected network.')
        }
    };

    const mint = async () => {
        await contract.methods.mintFish(account).send({from: account});
    };

    const hunt = async (predator, prey) => {
        await contract.methods.hunt(predator, prey).send({from: account});
    };

    const getTokenOwner = async (token) => {
        return await contract.methods.ownerOf(token).call();
    };

    const getTokenPower = async (token) => {
        return await contract.methods.tokenPower(token).call();
    };

    const getTokenUri = async (token) => {
        return await contract.methods.tokenURI(token).call();
    };

    const getAll = async (token) => {
        console.log(await getTokenOwner(token));
        console.log(await getTokenPower(token));
        console.log(await getTokenUri(token));
    };

    return (
        <div className="App">
            <header className="App-header">
                <p>{account}</p>
                <p>{contract.toString()}</p>
                <p>{totalSupply}</p>
                <p><a onClick={() => mint(account)}>Mint</a></p>
                <p><a onClick={() => hunt(1, 2)}>Hunt</a></p>
                <p><a onClick={() => getAll(1)}>tokenowner</a></p>
            </header>
        </div>
    );
}
