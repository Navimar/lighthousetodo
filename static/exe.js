let onSelect = (txt) => {
    save();
    select(txt);
    render();
};

let onTag = (txt) => {
    save();
    select(txt);
    render();
}

let onOpn = (txt) => {
    save();
    select(txt);
    render();
}

let onNew = () => {
    save();
    newwish('новая запись');
    select('новая запись');
    render();
}
let onDel = (txt) => {
    del(txt);
    render();
}

let onToday = () => {
    let d = moment();
    $('#date').val(d.format('YYYY-MM-DD'));
}

let onPlusday = () => {
    let d = moment($('#date').val()).add(1, 'day');
    $('#date').val(d.format('YYYY-MM-DD'));
}

let onTomorrow = () => {
    onToday();
    onPlusday();
}


let onPlusHour = () => {
    let d = moment($('#date').val() + 'T' + $('#time').val()).add(1, 'hour');
    $('#date').val(d.format('YYYY-MM-DD'));
    $('#time').val(d.format('HH:mm'));
}

let onNow = () => {
    let d = moment();
    $('#date').val(d.format('YYYY-MM-DD'));
    $('#time').val(d.format('HH:mm'));
}
let onPlus15 = () => {
    let d = moment($('#date').val() + 'T' + $('#time').val()).add(15, 'minute');
    $('#date').val(d.format('YYYY-MM-DD'));
    $('#time').val(d.format('HH:mm'));
}

let onPlusWeek = () => {
    let d = moment($('#date').val()).add(7, 'day');
    $('#date').val(d.format('YYYY-MM-DD'));
}

let send = (data) => {
    // login.pass = findGetParameter("key");
    let id = findGetParameter("id");
    data.id = id;
    socket.emit('save', data);
}