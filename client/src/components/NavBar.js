import React from "react";
import {NavLink} from "react-router-dom";

export default function NavBar() {
    return (
        <section className="section navbar p-4">
            <div className="container">
                <div className="left">
                    <NavLink to="/"><img src="/images/logo.png" className="logo" alt="Logo"/></NavLink>
                </div>
                <div className="right">
                    <ul>
                        <li>
                            <a href={process.env.REACT_APP_TWITTER} className="twitter" target="_blank" rel="noopener noreferrer">
                                <img src="/images/twitter.svg" alt="Twitter"/>
                            </a>
                        </li>
                        <li>
                            <a href={process.env.REACT_APP_DISCORD} className="discord" target="_blank" rel="noopener noreferrer">
                                <img src="/images/discord.svg" alt="Discord"/>
                            </a>
                        </li>
                        <li>
                            <a href={process.env.REACT_APP_OPENSEA} className="opensea" target="_blank" rel="noopener noreferrer">
                                <img src="/images/opensea.svg" alt="Opensea"/>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </section>
    );
}
