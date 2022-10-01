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
    newwish('новая запись', false, false, false, 'third', 0,);
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

let onFocus = (text) => {
    // focuss(text)
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

let mouse = {
    x: 0,
    y: 0
}

$(document).on("mousemove", function (event) {
    mouse.x = event.pageX;
    mouse.y = event.pageY;
    mouse.y -= $(window).scrollTop();
    // console.log(mouse.x + " " + mouse.y);
});


let isSelection = false;
let scrollPosition = 0;

window.onfocus = function () {
    // onFocus();
};

$(document).on('change', '.dateinp', function (event) {
    $('.readylabel input').prop("checked", false);
});
$('.t1').bind('input propertychange', function () {
    select('');
    render();
    $(window).scrollTop(0);
});
$(document).on('click', '.calbut', function (event) {
    event.preventDefault();
    // if ($(this).attr('href') != undefined)
    $(window).scrollTop($($(this).attr('href')).offset().top - mouse.y + 6);
    // $(window).scrollTop(0);

});
$(document).on('click', '.text', function () {
    $('.t1').val('');
    onSelect($(this).val());
});
// $(document).on('click', '.focushead', function () {
//     focusnext();
//     render();
// });
$(document).on('click', '.tag', function () {
    onTag($(this).text());
});
$(document).on('click', '.opn', function () {
    onOpn($(this).text());
});
$(document).on('click', '.newtask', function () {
    onNew();
    $('.inputtext:first').val('').select();
});
$(document).on('click', '.savetask', function () {
    onSelect('');
    scrollPosition = parseInt($('.focused').position().top - $(window).height() / 2);
    $(window).scrollTop(scrollPosition);
});
// $(document).on('click', '.focustask', function () {
//     onFocus($(this).prop('value'));
//     onSelect('');
// });
$(document).on('click', '#clearsearch', function () {
    $('.t1').val('');
    save();
    render();
    // select('');
    // render();
    // $(window).scrollTop(0);
});
$(document).on('click', '.timebutton', function () {
    $('.readylabel input').prop("checked", false);
    let clear = () => {
        $('.timebutton').removeClass('justClicked')
        $('.timebutton').removeClass('justClicked2')
    }
    if ($(this).hasClass('justClicked')) {
        clear();
        $(this).addClass('justClicked2');
    } else {
        clear();
        $(this).addClass('justClicked');
    }
    // alert('!!!');
});
$(document).on('click', '.delete', function () {
    onDel($(this).attr('value'));
});
$(document).on('click', '#plustoday', function () {
    onToday();
});
$(document).on('click', '#tomorrow', function () {
    onTomorrow();
});
$(document).on('click', '#plusday', function () {
    onPlusday();
});
$(document).on('click', '#plushour', function () {
    onPlusHour();
});
$(document).on('click', '#plusnow', function () {
    onNow();
});
$(document).on('click', '#morning', function () {
    onMorning();
});
$(document).on('click', '#evening', function () {
    onEvening();
});
$(document).on('click', '#midnight', function () {
    onMidnight();
});
$(document).on('click', '#plus15', function () {
    onPlus15();
});
$(document).on('click', '#pluslast', function () {
    // console.log($(this).attr('value'));
    onPluslast($(this).attr('value'));
});

$(document).on('click', '#plusweek', function () {
    onPlusWeek();
});
$(document).on('click', '#scrollTopButton', function () {
    // scrollPosition = 0;
    scrollPosition = parseInt($('.focused').position().top - $(window).height() / 2);
    if ($(window).scrollTop() == scrollPosition)
        scrollPosition = 0;
    console.log($(window).scrollTop(), scrollPosition);
    $(window).scrollTop(scrollPosition);
});
