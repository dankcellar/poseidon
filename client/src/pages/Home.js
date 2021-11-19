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
                    <p>Poseidon is a collection of NFTs that starts with 10,000 fish of level 1. Anytime, a fish can hunt another fish if prey is the same level or less, and only if both prey and predator are owned by the same ethereum account.</p>
                    <p>Once a fish hunts another fish, the prey <strong>is burned</strong> -this means that it will disappear forever!-, and the prey level gets added to the predator level. At level 10 fish evolve to shark, at level 100 sharks evolve to whales, and above level 1000 whales evolve to krakens.</p>
                    <p><strong>For example:</strong> If Alice owns two fish, first fish is level 8 and the second is level 3, Alice can make the first fish hunt the second fish. Then the first fish becomes a shark of level 11 and the second fish is burned.</p>
                </div>
            </section>
            <section className="section experiment">
                <div className="container">
                    <h2>The experiment</h2>
                    <p>We hope that this project will serve as a real life economic experiment that could answer -or not- some of the following questions:</p>
                    <ul>
                        <li>Will people hunt to evolve their fish for flexing them?</li>
                        <li>Will the rarest fish be used for evolving or rarest fish will be kept at low level for speculation?</li>
                        <li>How the market will react to common attributes that become rare as a consequence of hunting?</li>
                        <li>If a whale account wants to liquidate all the fish, could turn all the fish into one and avoid to impact the floor price, will that be a phenomenon or whales will rather sell many fish?</li>
                        <li>How will it look the owner distribution of the fish over time?</li>
                        <li>How will it look the supply curve over time?</li>
                        <li>Will it ever exist a kraken?</li>
                    </ul>
                </div>
            </section>
            <section className="section experiment">
                <div className="container">
                    <h2>Roadmap</h2>
                    <ul>
                        <li>Private Discord chatrooms for fish owners, shark owners, whale owners and kraken owners.</li>
                        <li>NFT20 liquidity pool with 50 fish.</li>
                        <li>Meme challenges with fish prizes.</li>
                        <li>Community poseidon artist challenge with fish prizes.</li>
                        <li>Charity donation of 10% of the mint value to one or more of the following ONG: Cram, Sea Sheperd, Ecomar, S.O.S. Oceanos, or similar ONG that aims to protect the oceans and their ecosystem.</li>
                        <li>Classic swag: hoodies, shirts, caps, pins.</li>
                        <li>Cryptovoxels space for the community events.</li>
                        <li>Unique NFT for the first shark evolution.</li>
                        <li>Unique NFT for the first whale evolution.</li>
                        <li>Unique NFT for the first kraken evolution.</li>
                        <li>Reduce from 7,5% to 5% royalties 3 month after mint.</li>
                        <li>Reduce from 5% to 2.5% royalties 6 month after mint.</li>
                    </ul>
                </div>
            </section>
            <section className="section faq">
                <div className="container">
                    <h2>FAQ</h2>
                    <p><strong>Is it possible to acquire Poseidon?</strong> At level 10,000 a fish would become Poseidon. But we are certain that summoning Poseidon in the metaverse would destroy all the NFT, so we decided that we will burn one fish during the minting process so Poseidon can never be summoned. Poseidon has never been drawn, and we will let the community imagine how Poseidon would look like.</p>
                    <p><strong>Do you charge a fee for hunting?</strong> No, the only cost of hunting is the gas, which is very low compared with other gas costs like minting.</p>
                    <p><strong>Why to reduce royalties over time?</strong> We believe that by reducing the royalties over time, we are rewarding long-term minded individuals. It will start with royalties of 7.5% and decrease after 3 months to 5% and after 3 more months to 2.5% (this does not include the additional 2.5% fee by OpenSea).</p>
                    <p><strong>Where is the contract?</strong> The contract is <a href={"https://etherscan.io/address/" + process.env.REACT_APP_CONTRACT_ADDRESS} target="_blank" rel="noopener noreferrer">{process.env.REACT_APP_CONTRACT_ADDRESS}</a></p>
                    <p><strong>Is this project opensource?</strong> Yes, <a href={process.env.REACT_APP_GITHUB} target="_blank" rel="noopener noreferrer">this is our github</a>.</p>
                </div>
            </section>
        </React.Fragment>
    );
}
