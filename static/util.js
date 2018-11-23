function clock() {
    let date = new Date;
    let year = date.getFullYear();
    let month = date.getMonth();
    let months = ['January', 'February', 'March', 'April', 'May', 'June', 'Jully', 'August', 'September', 'October', 'November', 'December'];
    let d = date.getDate();
    let day = date.getDay();
    let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let h = date.getHours();
    if (h < 10) {
        h = "0" + h;
    }
    let m = date.getMinutes();
    if (m < 10) {
        m = "0" + m;
    }
    let s = date.getSeconds();
    if (s < 10) {
        s = "0" + s;
    }
    if (d < 10) {
        d = "0" + d;
    }
    month++;
    if (month < 10) {
        month = "0" + month;
    }
    let result = '' + days[day] + ' ' + d + '.' + month + '.' + year + ' ' + h + ':' + m;
    return result;
}