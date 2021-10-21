import React from "react";
import {NavLink} from "react-router-dom";

export default function NavBar() {
    return (
        <section className="section">
            <div className="container navbar">
                <p><NavLink to="/">Home</NavLink></p> |
                <p><NavLink to="/account">My Account</NavLink></p> |
                <p><NavLink to="/token/2">Check token #2</NavLink></p> |
                <p><a href="https://testnets.opensea.io/collection/poseidon-v2">View in opensea</a></p>
            </div>
        </section>
    );
}
