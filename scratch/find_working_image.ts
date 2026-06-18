const ids = [
    "photo-150939136634b-614bb32e050b", // default solar panels
    "photo-1574360533513-33bc71536b15", // old pontevedra (404)
    "photo-1564507592333-c60657eea523", // general spain / architectural
    "photo-1580587771525-78b9dba3b914", // solar panels
    "photo-1613665813446-82a78c468a1d", // solar panel roof
    "photo-1508514177221-188b1cf16e9d", // solar sunset
    "photo-1527030280862-64139fbe04ca", // general galicia
    "photo-1563968743333-044cef800494", // galicia costa
    "photo-1600585154340-be6161a56a0c", // solar house
];

async function findWorking() {
    for (const id of ids) {
        const url = `https://images.unsplash.com/` + id + `?auto=format&fit=crop&q=80&w=800`;
        try {
            const res = await fetch(url, { method: "HEAD" });
            console.log(`ID ${id}: status ${res.status}`);
        } catch (err: any) {
            console.log(`ID ${id} error: ${err.message}`);
        }
    }
}

findWorking();
