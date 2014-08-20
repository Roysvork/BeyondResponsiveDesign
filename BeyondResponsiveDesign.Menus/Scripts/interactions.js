﻿(function (interactions) {

    interactions.init = function () {
        $.detectSwipe.preventDefault = false;
        interactions.navigate("home");

        // Disable scroll for the document, we'll handle it ourselves
        $(document).on('touchmove', function (e) {
            e.preventDefault();
        });

        // Check if we should allow scrolling up or down
        $(document.body).on("touchstart", ".vscroll", function (e) {
            // If the element is scrollable (content overflows), then...
            if (this.scrollHeight !== this.clientHeight) {
                // If we're at the top, scroll down one pixel to allow scrolling up
                if (this.scrollTop === 0) {
                    this.scrollTop = 1;
                }
                // If we're at the bottom, scroll up one pixel to allow scrolling down
                if (this.scrollTop === this.scrollHeight - this.clientHeight) {
                    this.scrollTop = this.scrollHeight - this.clientHeight - 1;
                }
            }
            // Check if we can scroll
            this.allowUp = this.scrollTop > 0;
            this.allowDown = this.scrollTop < (this.scrollHeight - this.clientHeight);
            this.lastY = e.originalEvent.pageY;
        });

        $(document.body).on('touchmove', ".vscroll", function (e) {
            var event = e.originalEvent;
            var up = event.pageY > this.lastY;
            var down = !up;
            this.lastY = event.pageY;

            if ((up && this.allowUp) || (down && this.allowDown)) {
                event.stopPropagation();
            } else {
                event.preventDefault();
            }
        });

        window.onresize = function () {
            $(document.body).width(window.innerWidth).height(window.innerHeight);
        }

        $(function () {
            window.onresize();
        });

        $(document.body).on('click', 'header>ul>li.menuToggle', function (e) {
            $(this).trigger('blur');
            e.preventDefault();
            e.stopPropagation();
            interactions.hidePopups(e);
            interactions.toggleSideBar(e);
        });

        $("main").on('click', ".modalbackground", function (e) {
            interactions.hidePopups(e);
        });

        $("main").on('swiperight', function (e) {
            if (!interactions.contentIsTabbed() || interactions.leftmostTabIsOpen()) {
                interactions.showSideBar(e);
            } else {
                interactions.slideTabsLeft();
            }
        });

        $("main").on('swipeleft', function (e) {
            if ($('body').hasClass("sidebar")) {
                interactions.HideSideBar(e);
            } else {
                interactions.slideTabsRight();
            }
        });
    };

    interactions.toggleSideBar = function (e) {
        if ($('body').hasClass('sidebar')) {
            interactions.HideSideBar(e);
        } else {
            interactions.showSideBar(e);
        }
    };

    interactions.showSideBar = function (e) {
        $('body').addClass('sidebar');
        $(window).trigger('resize');
    };

    interactions.HideSideBar = function (e) {
        $('body').removeClass('sidebar');
        $(window).trigger('resize');
        return false;
    };

    interactions.hidePopups = function (e) {
        interactions.closePropertySheet();
    };

    var titleStack = [];
    interactions.navigate = function (location) {
        $.get("content/" + location + ".html").done(function (html) {
            var target = $("main");
            target.empty();
            target.html(html);

            $("nav > div > div > ul  li").removeClass("active");
            var menuitem = $("nav > div > div > ul li#menu-" + location);
            menuitem.addClass("active");

            var title = menuitem.find("a span").first().text();
            titleStack = [title];
            $("#paneTitle").text(title);

            var parentDiv = menuitem.parents("div").first();
            var selected = null;
            if (parentDiv.hasClass("wrapper")) {
                selected = menuitem.children("li").first();
            } else {
                selected = parentDiv.parent();
            }

            if (selected) {
                selected.addClass("active");
            }
        });
    }

    interactions.openPropertySheet = function (location, title) {

        titleStack.push(title);
        $("#paneTitle").text(title);

        var modalBackground = $('<div class="modalbackground"></div>');
        modalBackground.removeAttr('style');
        modalBackground.prependTo('main');

        $("body > main > aside.propertySheet").empty().removeClass("offRight").addClass("active")
            .on('swiperight', function(e) {
                interactions.closePropertySheet();
                e.stopPropagation();
            });

        return $.get("content/" + location + ".html").done(function (html) {
            var target = $("main > aside");
            target.empty();
            target.html(html);
        });
    }

    interactions.closePropertySheet = function () {
        if ($("body > main > aside.propertySheet").hasClass("active")) {
            titleStack.pop();
            $("#paneTitle").text(titleStack[0]);

            $("body > main > .modalbackground").remove();
            $("body > main > aside.propertySheet").off('swiperight').removeClass("active").addClass("offRight");
        }
    }

    interactions.contentIsTabbed = function () {
        return $("article > nav > ul > li.active").length > 0;
    }

    interactions.leftmostTabIsOpen = function () {
        var tab = $("article > nav > ul > li.active");
        return tab.length > 0 && tab.prevAll("li").length == 0;
    }

    interactions.slideTabsLeft = function () {
        var currentTabLink = $("article > nav > ul > li.active");
        var nextTabLink = currentTabLink.prev("li");
        interactions.slideToTab(nextTabLink.attr("id").replace("tab-", ""));
    }

    interactions.slideTabsRight = function () {
        var currentTabLink = $("article > nav > ul > li.active");
        var nextTabLink = currentTabLink.next("li");
        interactions.slideToTab(nextTabLink.attr("id").replace("tab-", ""));
    }

    var shiftElements = function (element, siblingSelector) {
        element.siblings().removeClass("active");
        element.prevAll(siblingSelector).removeClass("offRight").addClass("offLeft");
        element.nextAll(siblingSelector).removeClass("offLeft").addClass("offRight");
        element.addClass("active").removeClass("offLeft").removeClass("offRight");
    }

    interactions.slideToTab = function (tab) {
        var tabLink = $("article > nav > ul > li#tab-" + tab);
        shiftElements(tabLink, "li");

        var tabContent = $("article > div.slideTabContainer > section#" + tab);
        shiftElements(tabContent, "section");
    }

})(window.interactions = window.interactions || {});