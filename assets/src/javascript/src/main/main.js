$(document).ready(function () {
    let $hamburger = $(".Header-toolbar-hamburger");
    let $menu = $(".Menu");
    let $itemsTop = $(".item-top-element");

    $hamburger.on("click", function (e) {
        $menu.toggleClass("is-active");
    });

    $itemsTop.on("click", function (e) {
        $(this).siblings(".items-below").toggleClass("is-active");
        console.log("test");
    });
});
