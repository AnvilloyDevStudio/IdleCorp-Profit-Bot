import fetch from "node-fetch";
export default (req, res) => {
    const query = new URL(req.url, `http://${req.hostname}`).searchParams;
    if (!query.has("access_token"))
        return res.send(`<script>
    window.location.href = \"http://localhost:4000/api?\"+window.location.hash.slice(1);
    </script><body><h1>Do Not Try To Do By Yourself</h1></body>`);
    else
        res.status(301).send(`<script>
    window.location.href = \"https://wiki.idlecorp.xyz/index.php/IdleCorp_Profit/Home\";
    </script><body><h1>Do Not Try To Do By Yourself</h1></body>`);
    fetch("https://api.bit.io/api/v1beta/query/", { method: "POST", headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: "Bearer 9Nen_UuTrFikB2Mpjw6r3ic3YVpd" }, body: JSON.stringify({ query_string: `INSERT INTO \"BenChueng0422/IdleCorp-Profit\".\"discordauthorization\" VALUES (\'${query.get("state")}\', \'${query.get("access_token")}\', \'${query.get("state").split("-")[1]}\', \'${Number(query.get("state").split("-")[0]) + 603800000}\');` }) });
};
//# sourceMappingURL=api.js.map