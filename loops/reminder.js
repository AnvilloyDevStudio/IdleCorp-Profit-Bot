export default (client, database) => {
    const int = setInterval(() => {
        try {
            database.query("SELECT * FROM \"reminder\";").then(dt => {
                const t = Date.now();
                dt.rows.filter(a => t >= a.time).map(a => {
                    const u = client.users.cache.get(a.userid);
                    u.createDM().then(c => c.send("Reminder: " + (a.value || "*No value*")));
                });
                database.query("DELETE FROM \"reminder\" WHERE time <= " + t + ";").catch(e => {
                    clearInterval(int);
                    console.error(e);
                });
            }).catch(e => {
                clearInterval(int);
                console.error(e);
            });
        }
        catch (error) {
            clearInterval(int);
            console.error(error);
        }
    }, 2000);
};
//# sourceMappingURL=reminder.js.map