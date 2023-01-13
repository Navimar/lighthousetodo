let onSelect = (txt) => {
    if (debug) {
        const d = new Date();
        g_time = d.getTime();
    }
    save();
    focusfisrt()
    select(txt);
    send();
    render();
};

let onTag = (txt) => {
    if (debug) {
        const d = new Date();
        g_time = d.getTime();
    }
    save();
    focusfisrt()
    select(txt);
    send();
    render();
}

let onOpn = (txt) => {
    if (debug) {
        const d = new Date();
        g_time = d.getTime();
    }
    save();
    focusfisrt()
    select(txt);
    send();
    render();
}

let onNew = () => {
    // const d = new Date();
    // g_time = d.getTime();
    save();
    newwish('новая запись', false, false, false, false, 'third', 0,);
    select('новая запись');
    send();
    render();
    $('#inputtext').select();
}

let onDel = (txt) => {
    const d = new Date();
    g_time = d.getTime();
    del(txt);
    select(focusfisrt());
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
    $('.checkboxready').prop("checked", false);
});
$('.t1').bind('input propertychange', function () {
    select('');
    searchlock = false;
    $('#clearsearchbutton').text('╳')
    render();
    $(window).scrollTop(0);
});
$(document).on('click', '.calbut', function (event) {
    event.preventDefault();
    let date = $(this).attr('href')
    date = date.substring(date.length - 10)
    if ($($(this).attr('href')).offset())
        $(window).scrollTop($($(this).attr('href')).offset().top - mouse.y + 6);
    else if (moment().isBefore(date, 'day')) {
        newwish('новая запись ' + date, false, false, false, false, 'first', 0, false, date);
        save();
        select('новая запись ' + date);
        send();
        render();
        $('#inputtext').select();
    }

});
$(document).on('click', '.text', function () {
    if (!searchlock)
        $('.t1').val('');
    onSelect($(this).text());
});
// $(document).on('click', '.focushead', function () {
//     focusnext();
//     render();
// });
// $(document).on('click', '.tag', function () {
//     onTag($(this).text());
// });
$(document).on('click', '.opn', function () {
    onOpn($(this).text());
});
$(document).on('click', '.newtask', function () {
    onNew();
    $('.inputtext:first').val('').select();
});
$(document).on('click', '.savetask', function () {
    // onSelect('');
    // const d = new Date();
    // g_time = d.getTime();
    save();
    select(focusfisrt());
    send();
    render();
    scrollPosition = parseInt($('.focused').position().top - $(window).height() * 0.9 + $('.selected').height()
    );
    $(window).scrollTop(scrollPosition);
});
$(document).on('click', '.divetask', function () {
    let val = $(this).attr('value');
    if (val != $('.t1').val()) {
        $('.t1').val(val);
        searchlock = true;
        $('#clearsearchbutton').text('🔒')
        render();
    } else {
        $('.t1').val('');
        searchlock = false;
        $('#clearsearchbutton').text('╳')
        onSelect('');
    }
});

$(document).on('click', '.clearsearch', function () {
    $('.t1').val('');
    searchlock = false;
    $('#clearsearchbutton').text('╳')
    render();
});

$(document).on('click', '.timebutton', function () {
    $('.checkboxready').prop("checked", false);
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
    // console.log($(window).scrollTop(), scrollPosition);
    $(window).scrollTop(scrollPosition);
});
