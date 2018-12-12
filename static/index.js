const socket = io();
let data;

function inputSocket() {
    socket.on('connect', function () {
        console.log('connected');
        $('#status').removeClass("red").html('online');
    });
    socket.on('disconnect', function () {
        // alert('DISCONNECT!!!');
        $('#status').addClass("red").html('offline');
    });
    socket.on('update', function (msg) {
        data = msg;
        console.log("loaded");
        console.log(data);
        render();
        $('#status').removeClass("red").html('online');
    });
    // socket.on('err', (val) => {
    //     alert(val);
    // });
    // socket.on('login', (val) => {
    //     onLogin(val);
    // });
}


let render = () => {
    let tasks = $('#tasks');
    let tags = [];
    let opns = [];
    let tagtext = "";
    let opntext = "";
    let text = "";
    let checked = false;
    let fear = false;
    let button = true;
    let time = "00:00";
    let date = "1111-11-11";
    let texthtml = "";
    tasks.html("");
    for (let a of data.tasks) {
        texthtml = "<div class='task";
        if (a.selected) {
            texthtml += " selected";
            tags = a.tags;
            opns = a.opns;
            text = a.name;
            checked = a.ready;
            fear = a.fear;
            time = a.time;
            date = a.date;
        }
        if (a.fear) {
            texthtml += " red";
        }
        texthtml += "'>";
        texthtml += "<button class='delete' value='" + a.name + "'>del</button>";
        texthtml += "<button class='text";
        if (a.ready) {
            texthtml += " ready";
        }
        if (a.blocked) {
            texthtml += " cantdo";
        } else if (!isReady(a.date, a.time)) {
            texthtml += " cantdo"
        }
        texthtml += "' ";
        texthtml += "value='" + a.name + "'>";
        texthtml += a.name.split('\n')[0];
        if (a.name == 'new wish') {
            button = false;
        }
        texthtml += "</button>";
        if (a.tags.length > 0 || a.opns.length > 0) {
            texthtml += "<br>";
        }
        if (a.tags.length > 0) {
            // texthtml += "<div class='tags'>";
            for (let t of a.tags) {
                texthtml += "<span class='tag";
                texthtml += "'>";
                texthtml += t;
                texthtml += "</span>&nbsp;";
            }
            // texthtml += "</div>";
        }
        if (a.tags.length > 0 || a.opns.length > 0) {
            texthtml += "<span class='arr'>=&#62; </span>"
        }
        if (a.opns) {
            if (a.opns.length > 0) {
                // texthtml += "<div class='opns'>";
                for (let t of a.opns) {
                    texthtml += "<span class='opn";
                    texthtml += "'>";
                    texthtml += t;
                    texthtml += "</span>&nbsp;";
                }
                // texthtml += "</div>";
            }
        } else {
            a.opns = [];
        }

        texthtml += "</div>";
        tasks.append(texthtml);
        if (a.selected) {
            texthtml = "<div id='taskheader' class='list'>" + texthtml + "<br></div>";
            tasks.prepend(texthtml);
        }
    }
    if (button) {
        $('#taskheader').prepend("<div class='task newtask'>\n" +
            "<div class='text'>...new wish</div>\n" +
            "</div>\n");
    }
    tasks.css('padding-top', $('#taskheader').height() + 10);

    for (let t of tags) {
        tagtext += t + "\n";
    }
    if (opns) {
        for (let t of opns) {
            opntext += t + "\n";
        }
    }

    $("input[type='checkbox']").prop({
        checked: checked
    });
    $("#fear").prop({
        checked: fear
    });
    $('.inputtags').val(tagtext);
    $('.inputopns').val(opntext);
    $('.inputtext').val(text);
    $('#time').val(time);
    $('#date').val(date);
    // localStorage.setItem('data', JSON.stringify(data));
    if (data) {
        socket.emit('save', data);
    }
    $('.clock').html(clock().text);
};


window.onload = function () {

    // data = JSON.parse(localStorage.getItem('data'));
    inputSocket();
    socket.emit('load', 'hi');
    if (!data) {
        console.log('NO DATA!!!');
        $('#status').addClass("red").html('NO DATA!!!');
    } else {
        render();
    }
};


let newwish = (name, selected, tags, opns) => {
    if (!tags) {
        tags = [];
    }
    if (!opns) {
        opns = [];
    }
    data.tasks.unshift({
        name,
        tags,
        opns,
        selected,
        ready: false,
        time: clock().h + ":" + clock().m,
    })
};
let save = () => {
    //edit
    let inpt = $('.inputtext');
    let inptval = inpt.val();
    let inptags = $(".inputtags").val();
    let inpopns = $(".inputopns").val();
    let ready = $(".checkbox").prop('checked');
    let fear = $("#fear").prop('checked');
    let tags = [];
    let opns = [];

    let time = $("#time").val();
    if (!time) {
        time = clock().h + ":" + clock().m;
    }
    let date = $("#date").val();
    // console.log("date val "+date);
    if (!date) {
        date = clock().year + "-" + clock().month + "-" + clock().d;
        // console.log("set date "+date);
    }
    $.each(inptags.split(/\n/), function (i, name) {
        // empty string check
        if (name != "") {
            tags.push(name);
            let ok = true;
            for (let a of data.tasks) {
                if (a.name == name) {
                    ok = false;
                    if (a.opns) {
                        if (a.opns.indexOf(inptval) === -1) {
                            a.opns.push(inptval);
                        }
                    }
                }
            }
            if (ok) {
                newwish(name, false, [], [inptval]);
            }
        }
    });
    $.each(inpopns.split(/\n/), function (i, name) {
        // empty string check
        if (name != "") {
            opns.push(name);
            let ok = true;
            for (let a of data.tasks) {
                if (a.name == name) {
                    ok = false;
                    if (a.tags.indexOf(inptval) === -1) {
                        a.tags.push(inptval);
                    }
                }
            }
            if (ok) {
                newwish(name, false, [inptval], []);
            }
        }
    });
    for (let a of data.tasks) {
        if (a.selected && inpt.val()) {
            for (let n of data.tasks) {
                for (let t in n.tags) {
                    if (n.tags[t] == a.name) {
                        n.tags[t] = inptval;
                    }
                }
                for (let t in n.opns) {
                    if (n.opns[t] == a.name) {
                        n.opns[t] = inptval;
                    }
                }
            }
            a.name = inpt.val();
            a.tags = tags;
            a.opns = opns;
            a.ready = ready;
            a.fear = fear;
            a.time = time;
            a.date = date;
        }
        a.blocked = false;
        for (let n of data.tasks) {
            for (let t of a.tags) {
                if (t == n.name && !n.ready) {
                    a.blocked = true;
                }
            }
        }
    }
    sortdata();
};
let sortdata = () => {
    data.tasks.sort((a, b) => {
        if ((a.blocked && b.blocked) || (!a.blocked && !b.blocked)) {
            if ((a.fear && b.fear) || (!a.fear && !b.fear)) {
                if (a.name.length >= b.name.length) {
                    return 1;
                } else if (a.name.length < b.name.length) {
                    return -1;
                }
            } else if (a.fear && !b.fear) {
                return -1
            } else if (!a.fear && b.fear) {
                return 1
            }
        } else if (a.blocked && !b.blocked) {
            return 1
        } else if (!a.blocked && b.blocked) {
            return -1
        }
    })
};
let select = (text) => {
    for (let a of data.tasks) {
        a.selected = (a.name == text)
    }
};

$(document).on('click', '.text', function () {
    save();
    console.log($(this).val());
    select($(this).val());
    render();
});
$(document).on('click', '.tag', function () {
    save();
    console.log($(this).text());
    select($(this).text());
    render();
});
$(document).on('click', '.opn', function () {
    save();
    console.log($(this).text());
    select($(this).text());
    render();
});

$(document).on('click', '.newtask', function () {
    newwish('new wish');
    select('new wish');
    render();
    $('.inputtext:first').focus().select();
});

let del = (text) => {
    for (let a in data.tasks) {
        // console.log(a);
        if (data.tasks[a].name == text) {
            data.tasks.splice(a, 1);
            // console.log(a, '!!!');
        }
        for (let t in data.tasks[a].tags) {
            if (data.tasks[a].tags[t] == text) {
                data.tasks[a].tags.splice(t, 1);
            }
        }
        for (let t in data.tasks[a].opns) {
            if (data.tasks[a].opns[t] == text) {
                data.tasks[a].opns.splice(t, 1);
            }
        }
    }
    sortdata();
};
$(document).on('click', '.delete', function () {
    del($(this).attr('value'));
    render();
});

