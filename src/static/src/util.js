function clock(date) {
    if (!date) {
        date = new Date;
    }
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
    let text = '' + days[day] + ' ' + d + '.' + month + '.' + year + ' ' + h + ':' + m;
    return {
        day: days[day],
        d,
        month,
        months,
        year,
        h,
        m,
        text
    };
}

function isFuture(date, time) {
    return moment().diff(moment(date + "T" + time)) < 0 ? true : false
}

function findGetParameter(name, url) {
    if (!url) {
        url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function sleep(miliseconds) {
    let currentTime = new Date().getTime();

    while (currentTime + miliseconds >= new Date().getTime()) {
    }
}

function msToTime(ms) {
    if (ms < 0 || !ms) {
        ms = 0;
    }
    var d, h, m, s;
    s = Math.floor(ms / 1000);
    m = Math.floor(s / 60);
    s = s % 60;
    h = Math.floor(m / 60);
    m = m % 60;
    d = Math.floor(h / 24);
    h = h % 24;
    // h += d * 24;
    return d + 'д ' + h + 'ч ' + m + "м"
}