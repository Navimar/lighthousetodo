let onSelect = (txt) => {
    save();
    select(txt);
    render();
    send();
};

let onTag = (txt) => {
    save();
    select(txt);
    render();
    send();

}

let onOpn = (txt) => {
    save();
    select(txt);
    render();
    send();

}

let onNew = () => {
    save();
    newwish('новая запись',false,false,false,'first');
    select('новая запись');
    render();
    send();
}
let onDel = (txt) => {
    del(txt);
    render();
    send();
    console.log('ondel');

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

