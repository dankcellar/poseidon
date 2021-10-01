import React from "react";
import {NavLink} from "react-router-dom";

export default function Home() {
    return (
        <div className="home-page">
            <h1>Poseidon</h1>
            <p>Thanks for all the fish!</p>
            <p><NavLink to="/my-fish">My fish</NavLink></p>
            <p><NavLink to="/fish/1">Check fish #1</NavLink></p>
            <p><NavLink to="/last-hunts">Last hunts</NavLink></p>
        </div>
    );
}
