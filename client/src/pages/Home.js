import React from "react";
import Mint from "../components/Mint";

export default function Home() {
    return (
        <React.Fragment>
            <section className="section home-page">
                <div className="container">
                    <Mint/>
                </div>
            </section>
            <section className="section experiment">
                <div className="container">
                    <h2>What is Poseidon?</h2>
                    <p>Poseidon is a collection of cool fish that lives in the Blockchain.</p>
                </div>
            </section>
            <section className="section experiment">
                <div className="container">
                    <h2>The experiment</h2>
                    <ul>
                        <li>Will people hunt to achieve more powerful fish for flexing them?</li>
                        <li>Will more powerful fish be also the rarest fish or rarest fish will be kept at low power for speculation?</li>
                        <li>Will whales be able to liquidate easily their assets without impacting the floor price by hunting and selling powerful fish instead of many weak fishes?</li>
                        <li>Will there ever exist a Kraken?</li>
                    </ul>
                </div>
            </section>
            <section className="section experiment">
                <div className="container">
                    <h2>Roadmap</h2>
                    <ul>
                        <li>NFT20 liquidity pool with 50 fish.</li>
                        <li>Meme challenge with prize of 1 shark.</li>
                        <li>Draw poseidon challenge with prize of 1 shark.</li>
                        <li>Charity donation.</li>
                        <li>Classic swag: hoodies, shirts, caps, pins.</li>
                        <li>Unique NFT for the first shark.</li>
                        <li>Unique NFT for the first whale.</li>
                        <li>Unique NFT for the first kraken.</li>
                        <li>Cryptovoxels space.</li>
                    </ul>
                </div>
            </section>
            <section className="section faq">
                <div className="container">
                    <h2>FAQ</h2>
                    <ul>
                        <li><strong>Where is the contract?</strong> The contract is <a href={"https://etherscan.io/address/" + process.env.REACT_APP_CONTRACT_ADDRESS} target="_blank" rel="noopener noreferrer">{process.env.REACT_APP_CONTRACT_ADDRESS}</a></li>
                        <li><strong>Is there a github?</strong> Yes, <a href={process.env.REACT_APP_GITHUB} target="_blank" rel="noopener noreferrer">this is our github</a>.</li>
                    </ul>
                </div>
            </section>
        </React.Fragment>
    );
}
