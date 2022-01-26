const fetch = require("node-fetch");

module.exports = function(userID) {
    fetch("https://api.bit.io/api/v1beta/query/", {method: "POST", headers: {Accept: "application/json", "Content-Type": "application/json", Authorization: "Bearer 9Nen_UuTrFikB2Mpjw6r3ic3YVpd"}, body: JSON.stringify({query_string: "SELECT * FROM \"BenChueng0422/IdleCorp-Profit\".\"minigame\" WHERE user_id = \'"+userID+"\';"})}).then(d => d.json()).then(dt => {
        let data = dt["data"];
        let pro = Promise.resolve(false);
        if (data.length) pro = fetch("https://api.bit.io/api/v1beta/query/", {method: "POST", headers: {Accept: "application/json", "Content-Type": "application/json", Authorization: "Bearer 9Nen_UuTrFikB2Mpjw6r3ic3YVpd"}, body: JSON.stringify({query_string: "UPDATE \"BenChueng0422/IdleCorp-Profit\".\"minigame\" SET data = \'"+JSON.stringify(data[0])+"\'::JSON WHERE user_id = \'"+userID+"\';"})});
        return pro;
    })
}