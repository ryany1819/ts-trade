module.exports = {
    getTimeStamp: () => {
        const dt = new Date();
        const yyyy = dt.getFullYear();
        const mm = dt.getMonth();
        const dd = dt.getDate();
        const hh = dt.getHours();
        const m = dt.getMinutes();
        const ss = dt.getSeconds();
        return `[${yyyy}-${mm}-${dd} ${hh}:${m}:${ss}]`;
    },
}