import http from "./httpservice";

export async function verifySignature(discordId, account, signature) {
    const r = await http.get(process.env.REACT_APP_API_VERIFY + discordId + "/" + account + "/" + signature);
    if (r.status !== 200) {
        throw new Error("Cannot verify at this moment. Try again later.");
    }
}
