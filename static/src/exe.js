let onSelect = (txt) => {
    save();
    select(txt);
    send();
    render();
};

let onTag = (txt) => {
    save();
    select(txt);
    send();
    render();
}

let onOpn = (txt) => {
    save();
    select(txt);
    send();
    render();
}

let onNew = () => {
    save();
    newwish('новая запись', false, false, false, 'first');
    select('новая запись');
    send();
    render();
    $('#inputtext').select();
}

let onDel = (txt) => {
    selectnext();
    del(txt);
    send();
    render();
}

let onFocus = () => {
}

let onToday = () => {
    let d = moment();
    $('#date').val(d.format('YYYY-MM-DD'));
}

let onPlusday = () => {
    let a = moment($('#date').val() + 'T' + $('#time').val()).add(1, 'day');
    let b = moment($('#time').val(), 'hh:mm').add(1, 'day');
    let d = a > b ? a : b
    $('#date').val(d.format('YYYY-MM-DD'));
    $('#time').val(d.format('HH:mm'));
}

let onTomorrow = () => {
    onToday();
    onPlusday();
}

let onPlusHour = () => {
    let a = moment($('#date').val() + 'T' + $('#time').val()).add(1, 'hour');
    let b = moment().add(1, 'hour');
    let d = a > b ? a : b
    $('#date').val(d.format('YYYY-MM-DD'));
    $('#time').val(d.format('HH:mm'));
}

let onNow = () => {
    let d = moment();
    $('#date').val(d.format('YYYY-MM-DD'));
    $('#time').val(d.format('HH:mm'));
}
let onPlus15 = () => {
    let a = moment($('#date').val() + 'T' + $('#time').val()).add(15, 'minute');
    let b = moment().add(15, 'minute');
    let d = a > b ? a : b
    $('#date').val(d.format('YYYY-MM-DD'));
    $('#time').val(d.format('HH:mm'));
}
let onMorning = () => {
    let a = moment($('#date').val() + 'T' + $('#time').val());
    let b = moment();
    let d = a > b ? a : b;
    $('#date').val(d.format('YYYY-MM-DD'));
    $('#time').val(d.format('09:00'));
}
let onEvening = () => {
    let a = moment($('#date').val() + 'T' + $('#time').val());
    let b = moment();
    let d = a > b ? a : b;
    $('#date').val(d.format('YYYY-MM-DD'));
    $('#time').val(d.format('18:00'));
}
let onMidnight = () => {
    let d = moment($('#date').val() + 'T00:00');
    $('#date').val(d.format('YYYY-MM-DD'));
    $('#time').val(d.format('HH:mm'));
}

let onPlusWeek = () => {
    let d = moment($('#date').val()).add(7, 'day');
    $('#date').val(d.format('YYYY-MM-DD'));
}

let onPluslast = (timediff) => {
    let d = moment($('#date').val() + 'T' + $('#time').val()).add(timediff, 'ms');
    $('#date').val(d.format('YYYY-MM-DD'));
    $('#time').val(d.format('HH:mm'));
}