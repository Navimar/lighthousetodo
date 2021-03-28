// $(document).ready(function () {
//search
//   var TRange = null;

//   function findString(str) {
//     // if (parseInt(navigator.appVersion) < 4) return;
//     var strFound;
//     if (window.find) {
//       // CODE FOR BROWSERS THAT SUPPORT window.find
//       strFound = self.find(str);
//       if (strFound && self.getSelection && !self.getSelection().anchorNode) {
//         strFound = self.find(str)
//       }
//       if (!strFound) {
//         strFound = self.find(str, 0, 1)
//         while (self.find(str, 0, 1)) continue
//       }
//     } else {
//       alert("browser not supported")
//       return;
//     }
//     if (!strFound) {
//       $('.t1').addClass('red')
//       return;
//     } else {
//       $('.t1').removeClass('red')
//     }
//   };
// });
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
let scrollPosition = 0
window.onfocus = function () {
  onFocus();
};

// $(document).on('swiperight', '.text', function (event) {
//   $(event.target).addClass("red");
// });
// $(document).on('click', '#searchbutton', function () {
// render();

// });
$('.t1').bind('input propertychange', function () {
  select('');
  render();
  $(window).scrollTop(0);
});
$(document).on('click', '.text', function () {
  $('.t1').val('');
  onSelect($(this).val());
});
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
$(document).on('click', '#clearsearch', function () {
  $('.t1').val('');
  save();
  render();
  // select('');
  // render();
  // $(window).scrollTop(0);
});
$(document).on('click', '.timebutton', function () {
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
  $(window).scrollTop(0);
});




// $(this).bind('touchend', function(e) {
//   e.preventDefault();
//   // Add your code here. 
//   $(this).click();
//   // This line still calls the standard click event, in case the user needs to interact with the element that is being clicked on, but still avoids zooming in cases of double clicking.
// })

