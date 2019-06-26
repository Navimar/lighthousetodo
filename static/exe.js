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
    newwish('new item');
    select('new item');
    render();
    $('.inputtext:first').focus().select();
}
let onDel = (txt) => {
    del(txt);
    render();
}

let onToday = () => {
    $('#date').val(clock().year + "-" + clock().month + "-" + clock().d);
}

let onPlusday = () => {
    let d = new Date(Date.parse(new Date($('#date').val())) + 86400000);
    $('#date').val(clock(d).year + "-" + clock(d).month + "-" + clock(d).d);
}

let onPlusHour = () => {
    let d = new Date(Date.parse(new Date($('#date').val() + ' ' + $('#time').val())) + 3600000);
    $('#date').val(clock(d).year + "-" + clock(d).month + "-" + clock(d).d);
    $('#time').val(clock(d).h + ":" + clock(d).m);
}

let onNow = () => {
    $('#date').val(clock().year + "-" + clock().month + "-" + clock().d);
    $('#time').val(clock().h + ":" + clock().m);
}

let onPlus15 = () => {
    let d = new Date(Date.parse(new Date($('#date').val() + ' ' + $('#time').val())) + 3600000 / 4);
    $('#time').val(clock(d).h + ":" + clock(d).m);
}

let onPlusWeek = () =>{
    let d = new Date(Date.parse(new Date($('#date').val())) + 86400000 * 7);
    $('#date').val(clock(d).year + "-" + clock(d).month + "-" + clock(d).d);
}