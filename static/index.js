const socket = io();
let data;

function inputSocket() {
    socket.on('connect', function () {
        console.log('connected');
        // socket.emit('load','hi');
    });
    socket.on('update', function (msg) {
        data = msg;
        console.log("loaded");
        console.log(data);
        render();
    });
    socket.on('err', (val) => {
        alert(val);
    });
    socket.on('login', (val) => {
        onLogin(val);
    });
}


let render = () => {
    let tasks = $('.tasks');
    let tags = [];
    let tagtext = "";
    let text = "";
    let checked = false;
    let fear = false;
    let button = true;
    tasks.html("");
    for (let a of data.tasks) {
        let texthtml = "<div class='task";
        if (a.selected) {
            texthtml += " selected";
            tags = a.tags;
            text = a.name;
            checked = a.ready;
            fear = a.fear;
        }
        if (a.blocked) {
            texthtml += " cantdo";
        }
        texthtml += "'>";
        texthtml += "<button class='delete' value='" + a.name + "'>del</button>&nbsp;&nbsp;&nbsp;";
        texthtml += "<span class='text";
        if (a.ready) {
            texthtml += " ready";
        }
        if (a.fear) {
            texthtml += " red";
        }
        texthtml += "'>";
        texthtml += a.name;
        if (a.name == 'new wish') {
            button = false;
        }
        texthtml += "</span>";
        if (a.tags.length > 0) {
            texthtml += "<div class='tags'>";
            for (let t of a.tags) {
                texthtml += "<span class='tag";
                texthtml += "'>";
                texthtml += t;
                texthtml += "</span>&nbsp;";
            }
            texthtml += "</div>";
        }
        texthtml += "</div>";
        tasks.append(texthtml);
    }
    if (button) {
        tasks.prepend("<div class='task newtask'>\n" +
            "<div class='text'>...new wish</div>\n" +
            "</div>\n");
    }
    for (let t of tags) {
        tagtext += t + "\n";
    }
    $("input[type='checkbox']").prop({
        checked: checked
    });
    $("#fear").prop({
        checked: fear
    });
    $('.inputtags').val(tagtext);
    $('.inputtext').val(text);
    // localStorage.setItem('data', JSON.stringify(data));
    socket.emit('save', data);
    $('.clock').html(clock());
};


window.onload = function () {

    // data = JSON.parse(localStorage.getItem('data'));
    inputSocket();
    socket.emit('load', 'hi');
    if (!data) {
        console.log('NO DATA!!!');
        data = {
            tasks: [
                {
                    name: 'Казань',
                    tags: [],
                    selected: false,
                    ready: true,
                },
                {
                    name: '22.02.2018',
                    tags: [],
                    selected: false,
                    ready: false,
                },
                {
                    name: 'адача 2',
                    tags: ['Казань'],
                    selected: false,
                    ready: false,
                },
                {
                    name: 'задача 3',
                    tags: [],
                    selected: true,
                    ready: false,
                },
                {
                    name: 'Сама задача',
                    tags: ['Казань', '22.02.2018'],
                    selected: false,
                    ready: false,
                    blocked: true,
                },
                {
                    name: 'Другая задача',
                    tags: ['Казань', '22.02.2018'],
                    selected: false,
                    ready: false,
                    blocked: true,
                },
            ]
        };
    }
    render();
};


let newwish = (name, selected) => {
    data.tasks.unshift({
        name,
        tags: [],
        selected,
        ready: false,
    })
};
let save = () => {
    //edit
    let inpt = $('.inputtext');
    let inptval = inpt.val();
    let inptags = $(".inputtags").val();
    let ready = $(".checkbox").prop('checked');
    let fear = $("#fear").prop('checked');
    let tags = [];
    $.each(inptags.split(/\n/), function (i, name) {
        // empty string check
        if (name != "") {
            tags.push(name);
            let ok = true;
            for (let a of data.tasks) {
                if (a.name == name) {
                    ok = false;
                }
            }
            if (ok) {
                newwish(name);
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
            }
            a.name = inpt.val();
            a.tags = tags;
            a.ready = ready;
            a.fear = fear;
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
            if (a.name.length >= b.name.length) {
                return 1;
            } else if (a.name.length < b.name.length) {
                return -1;
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
    }
    sortdata();
};
$(document).on('click', '.delete', function () {
    del($(this).attr('value'));
    render();
});

