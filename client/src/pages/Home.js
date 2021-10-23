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
                    <h2>The experiment</h2>
                    <ul>
                        <li>Will people hunt to achieve more powerful fish for flexing them?</li>
                        <li>Will more powerful fish be also the rarest fish or rarest fish will be kept at low power for speculation?</li>
                        <li>Will whales be able to liquidate easily their assets without impacting the floor price by hunting and selling powerful fish instead of many weak fishes?</li>
                        <li>Will there ever exist a Kraken?</li>
                    </ul>
                </div>
            </section>
            <section className="section faq">
                <div className="container">
                    <ul>
                        <li><string>Where is the contract?</string> The contract is <a href={"https://etherscan.io/address/" + process.env.REACT_APP_CONTRACT_ADDRESS} target="_blank" rel="noopener noreferrer">{process.env.REACT_APP_CONTRACT_ADDRESS}</a></li>
                        <li><string>Is there a github?</string> Yes, <a href={process.env.REACT_APP_GITHUB} target="_blank" rel="noopener noreferrer">this is our github</a>.</li>
                    </ul>
                </div>
            </section>
        </React.Fragment>
    );
}
