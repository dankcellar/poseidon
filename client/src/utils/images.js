import React from "react";

export function renderTokenImage(data) {
    if (!data) {
        return;
    }
    const type = (data.power >= 1000) ? "kraken" : ((data.power >= 100) ? "whale" : (data.power >= 10) ? "shark" : "fish");
    const img = process.env.REACT_APP_API_IMAGE_URL + data.id + "-" + type + ".png";
    return <img src={img} alt={data.name}/>
}
