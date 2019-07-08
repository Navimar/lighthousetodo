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

function isReady(date, time) {
    return moment(date + "T" + time).format('x') < moment().format('x');;
    // return Date.parse(date + "T" + time) < Date.now();;
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