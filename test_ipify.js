async function test() {
    try {
        const res = await fetch('https://api.ipify.org?format=json');
        console.log(await res.json());
    } catch (e) {
        console.error(e);
    }
}
test();
