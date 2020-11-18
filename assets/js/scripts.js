    (function($) {
    "use strict";

    // Add active state to sidbar nav links
    var path = window.location.href; // because the 'href' property of the DOM element is the absolute path
        $("#layoutSidenav_nav .sb-sidenav a.nav-link").each(function() {
            //if (this.href === path) {
               // $(this).addClass("active");
           // }
        });

    // Toggle the side navigation
    $("#sidebarToggle").on("click", function(e) {
        e.preventDefault();
        $("body").toggleClass("sb-sidenav-toggled");
    });
	let $updatedOn_ = document.querySelector('#updatedOn');
	fetch('https://cbpfapi.unocha.org/vo2/odata/LastModified')
    .then(function(response) {
        if (response.ok) {
            response.json().then(function(data) {
                //$div1_.textContent = JSON.stringify(data);
                var obj = data;
                if ($updatedOn_ != undefined && $updatedOn_ != null)
                    $updatedOn_.textContent = ConvertJsonDateTime(obj.value[0].last_updated_date);
            });
        } else console.log('Network response was not ok.');
    })
    .catch(function(error) {
        console.log('Fetch error: ');
    });

function ConvertJsonDateTime(jsonDate) {
    var date = new Date(jsonDate);
    var month = date.getMonth() + 1;
    month = month.toString().length > 1 ? month : "0" + month;

    return date.getDate() + "/" + month + "/" + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
}
})(jQuery);
