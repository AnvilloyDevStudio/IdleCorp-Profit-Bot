export default (client: import("discord.js").Client, database: import("pg").Client) => {
    const int = setInterval(() => {
        try {
            database.query<{userid: string, time: number, value: string, lite: boolean}>("SELECT * FROM \"reminder\";").then(dt => {
                const t = Date.now();
                dt.rows.filter(a => t>=a.time).map(a => {
                    const u = client.users.cache.get(a.userid);
                    u.createDM().then(c => c.send("Reminder: "+(a.value||"*No value*")));
                })
                database.query("DELETE FROM \"reminder\" WHERE time <= "+t+";").catch(e => {
                    clearInterval(int);
                    console.error(e)
                })
            }).catch(e => {
                clearInterval(int);
                console.error(e)
            })
        } catch (error) {
            clearInterval(int);
            console.error(error)
        }
    }, 2000);
}