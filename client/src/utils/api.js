import http from "./httpservice";

export async function fetchToken(tokenId) {
    const r = await http.get(process.env.REACT_APP_API_BASE_URL + tokenId + "/1");
    if (r.data.error) throw r.data.error;
    return r.data;
}
