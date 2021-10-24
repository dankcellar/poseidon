import http from "./httpservice";

export async function fetchToken(tokenId, power) {
    const r = await http.get(process.env.REACT_APP_API_BASE_URL + tokenId + "/" + power);
    if (r.data.error) throw r.data.error;
    return r.data;
}
