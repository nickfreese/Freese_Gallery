define(['jquery'], function($){

var nfGallery = (function(images, target, settings, badges) {
    images = images || [];
    settings = settings || {};
    target = target || "*";
    badges = badges || [];
    var widget = {

        init: function() {
            var _this = this;

            /* make sure we have custo events*/
            _this.ensureCustomEvents();

            /* setup our data */
            _this.images = images;
            _this.target = target;
            _this.s = settings;
            _this.badges = badges;
            _this.fullscreen = false;
            _this.thumbsOn = false;
            _this.scrollThumbs = _this.s.scrollThumbs || false;
            _this.hideThumbs = _this.s.hideThumbs || false;
            _this.thumbnailSliderEnabled = false;
            _this.thumbArrowsAdded = false;
            _this.ZOOM_ENABLED = false;
            _this.imagesLoaded = 0;

            /* ensure we have initial gallery HTML */
            if (typeof _this.s.renderHtml !== "undefined") {
                if (_this.s.renderHtml === true) {
                    _this.initHtml();
                } else{
                    _this.imagesLoaded = 1;
                }

            } else {
                _this.imagesLoaded = 1;
            }

            /* initialize actual gallery*/
            _this.initializeGallery();

            _this.setListenForImages();

            _this.initZoom();

            var event = new CustomEvent("galleryloaded", {
                "detail": _this
            });
            window.dispatchEvent(event);

            return _this;
        },

        initHtml: function() {
            var _this = this;

            var html = "<div class='nf-close'>&#215;</div><div class='nf-view'><div class='nf-view-wrap'><div class='nf-view-inner'></div></div></div><div class='nf-thumb'><div class='nf-thumb-inner'></div></div>";

            document.querySelector(_this.target).innerHTML = html;

        },

        isSetting: function(settingName) {
            var _this = this;
            if (typeof _this.s[settingName] !== "undefined") {
                return true;
            } else {
                return false;
            }

        },

        imagesAreLoaded: function(){
            var _this = this;

            var images = _this.app.querySelectorAll('.nf-view-slide img');

            if(images.length == _this.imagesLoaded){
                return true;
            }
            return false;

        },

        initializeGallery: function() {
            var _this = this;

            var app = document.querySelector(_this.target);
            _this.app = app;
            var width = app.querySelector(".nf-view-wrap").offsetWidth;

            _this.s.width = width;

            console.log(_this.s.width);

            if (typeof _this.s.square !== "undefined") {
                if (_this.s.square === true) {
                    _this.s.height == _this.s.width;
                }
            }

            app.querySelector(".nf-view-wrap").style.height = _this.s.height + "px";


            _this.p = {
                currentSlide: 0,
                slideAmount: _this.s.width,
                currentThumbSlide: 0
            };
            console.log(_this.images.length);
            var innerSlider = app.querySelector(".nf-view-inner");
            innerSlider.style.width = (_this.s.width * _this.images.length) + "px";

            for (var i = 0; i < _this.images.length; i++) {
                if (_this.isSetting("renderHtml")) {
                    if (!_this.s.renderHtml && i == 0) {
                        app.querySelector(".nf-view-slide").style.width = _this.s.width + "px";
                        app.querySelector(".nf-view-slide").style.height = _this.s.height + "px";
                        app.querySelector(".nf-view-slide").style.paddingTop = 0 + "px";
                        continue;
                    }
                }
                var slide = document.createElement('div');
                slide.className = "nf-view-slide";
                slide.setAttribute("data-nf-slide", i);
                slide.style.width = _this.s.width;
                slide.style.height = _this.s.height;


                if (typeof _this.images[i].html !== "undefined") {
                    var htmlWrapper = document.createElement('div');
                    htmlWrapper.className = "nf-html-slide-wrapper";
                    htmlWrapper.innerHTML = _this.images[i].html;

                    slide.appendChild(htmlWrapper);


                } else {
                    var img = document.createElement('img');
                        let iter = i;
                        img.onload = function(){

                            _this.imagesLoaded++;
                            //_this.imageZoom(this, "nf-zoom-" + iter);
                        }
                    
                    img.src = _this.images[i].img + _this.getUrlParam(_this.app.offsetWidth);
                    slide.appendChild(img);
                }


                innerSlider.appendChild(slide);
            }



            if (typeof _this.s.arrows !== "undefined") {
                if (_this.s.arrows === true) {
                    _this.initGalleryArrows();
                }
            }

            _this.initGalleryBadges();

            _this.resize();
            _this.initNavigation();
            _this.setListeners();
            _this.enableThumbScroller();
            _this.manageThumbnails();




            _this.moveToSlide(0);

        },

        getUrlParam: function(size) {
            var _this = this;
            if (typeof _this.s.hasFastly !== "undefined") {
                if (_this.s.hasFastly === true) {
                    return "?width=" + size;
                }
            }
            return "";
        },


        insertSlide: function(i, slideData) {
            var _this = this;

            _this.images.splice(i, 0, slideData);

            var innerSlider = _this.app.querySelector(".nf-view-inner");
            innerSlider.style.width = (_this.s.width * _this.images.length) + "px";

            var slide = document.createElement('div');
            slide.className = "nf-view-slide";
            slide.setAttribute("data-nf-slide", i);
            slide.style.width = _this.s.width + "px";
            slide.style.height = _this.s.height + "px";

            if (typeof _this.images[i].html !== "undefined") {

                slide.innerHTML = _this.images[i].html;

            } else {
                var img = document.createElement('img');
                img.src = _this.images[i].img + _this.getUrlParam(_this.app.offsetWidth);
                slide.appendChild(img);
            }

            var slides = _this.getSlides();
            var insertedNode = innerSlider.insertBefore(slide, slides[i]);


            /* do thumbnails */

            _this.initNavigation();
            _this.setThumbnailListeners();

            if (parseInt(_this.p.currentSlide) > i) {
                console.log('greter');
                if (typeof _this.images[parseInt(mainGallery.p.currentSlide) + 1 + 1] !== "undefined") {
                    console.log('up one');
                    _this.p.currentSlide = (parseInt(_this.p.currentSlide) + 1).toString(10);
                }
            }

            _this.updateNfId();
            _this.manageThumbnails();
            _this.moveToSlide(_this.p.currentSlide);

            var event = new CustomEvent("slideinserted", {
                "detail": _this.getSlides()[i]
            });
            window.dispatchEvent(event);

        },

        getSlides: function() {

            var _this = this;

            var elems = _this.app.querySelectorAll('.nf-view-slide');
            if (elems.length > 0) {
                return elems;
            } else {
                return [];
            }
        },

        updateNfId: function() {
            var _this = this;

            var slides = _this.getSlides();
            for (var i = 0; i < slides.length; i++) {
                slides[i].setAttribute("data-nf-id", i);
            }
            if (_this.thumbsOn === true) {
                var thumbs = _this.app.querySelectorAll('nf-thumb-slide');
                for (var i = 0; i < thumbs.length; i++) {
                    thumbs[i].setAttribute("data-nf-id", i);
                }
            }

        },



        /* 
         * sizing functions
         */

        resize: function() {
            var _this = this;

            var width = _this.app.querySelector(".nf-view-wrap").offsetWidth;
            _this.s.width = width;
            _this.p.slideAmount = width;

            if (typeof _this.s.square !== "undefined") {
                if (_this.s.square === true) {
                    _this.s.height = _this.s.width;
                }
            }

            _this.app.querySelector(".nf-view-wrap").style.height = _this.s.height + "px";
            _this.app.querySelector(".nf-view-wrap").style.width = "";

            var innerSlider = _this.app.querySelector(".nf-view-inner");
            innerSlider.style.width = (_this.s.width * _this.images.length) + "px";

            var slides = _this.app.querySelectorAll(".nf-view-slide");
            for (var i = 0; i < slides.length; i++) {
                slides[i].style.width = _this.s.width + "px";
                slides[i].style.height = _this.s.height + "px";
            }
            if (_this.thumbsOn) {
                _this.enableThumbScroller();
            }


            _this.moveToSlide(_this.p.currentSlide);

        },


        sizeForFullscreen: function() {
            var _this = this;
            /* set fullscreen dimensions */
            if (_this.fullscreen === true) {
                _this.s.height = Math.max(window.innerHeight || 0) - 100;

                _this.app.querySelector(".nf-view-wrap").style.height = _this.s.height + "px";
                _this.app.querySelector(".nf-view-wrap").style.width = "";

                var height = _this.s.height;
                var img = _this.images[_this.p.currentSlide].img;
                var imgElem = document.createElement('img');
                imgElem.onload = function() {

                    var imgwidth = imgElem.naturalWidth;
                    var imgheight = imgElem.naturalHeight;

                    console.log('width: ' + imgwidth);

                    var newWidth = (height / imgheight) * imgwidth;

                    if (window.innerHeight < window.innerWidth) {
                        _this.s.width = newWidth;
                    } else {
                        var style = window.getComputedStyle(_this.app, null);
                        _this.s.width, newWidth = parseInt(style.getPropertyValue("width").replace("px", ""));
                        var newheight = parseInt(style.getPropertyValue("height").replace("px", "")) - 100;
                        _this.s.height = newheight;
                    }

                    _this.p.slideAmount = _this.s.width;

                    var view = _this.app.querySelector(".nf-view");
                    view.style.width = _this.s.width + "px";

                    var viewWrap = _this.app.querySelector(".nf-view-wrap");
                    viewWrap.style.width = _this.s.width + "px";

                    var innerSlider = _this.app.querySelector(".nf-view-inner");
                    innerSlider.style.width = (_this.s.width * _this.images.length) + "px";

                    var slides = _this.app.querySelectorAll(".nf-view-slide");
                    for (var i = 0; i < slides.length; i++) {
                        slides[i].style.width = _this.s.width + "px";
                        slides[i].style.height = _this.s.height + "px";
                    }


                    var px = _this.p.slideAmount * _this.p.currentSlide;
                    _this.setTransform(_this.app.querySelector(".nf-view-wrap").querySelector(".nf-view-inner"), "transform", "translate3d(-" + px + "px,0px,0px)");

                }

                imgElem.src = img;


            }
        },




        /*
         *. position functions
         */

        moveToSlide: function(slideId) {
            var _this = this;
            _this.p.currentSlide = slideId;
            _this.updateNavigation();
            var px = _this.p.slideAmount * _this.p.currentSlide;
            _this.setTransform(_this.app.querySelector(".nf-view-wrap").querySelector(".nf-view-inner"), "transform", "translate3d(-" + px + "px,0px,0px)");
            _this.sizeForFullscreen();
            _this.adjustArrowVisibility();
            _this.setAllZoomInvisible();
        },

        setTransform: function(element, property, value) {
            var _this = this;
            _this.setVendorPrefix(element, property, value);
        },

        nextSlide: function() {
            var _this = this;

            if (typeof _this.images[parseInt(_this.p.currentSlide) + 1] !== "undefined") {
                _this.moveToSlide(_this.p.currentSlide + 1);
            }
        },

        prevSlide: function() {
            var _this = this;

            if (typeof _this.images[parseInt(_this.p.currentSlide) - 1] !== "undefined") {
                _this.moveToSlide(_this.p.currentSlide - 1);
            }

        },


        initGalleryArrows: function() {

            var _this = this;

            var viewArea = _this.app.querySelector('.nf-view');
            var leftArrow = document.createElement('div');
            var rightArrow = document.createElement('div');

            leftArrow.innerHTML = "";
            rightArrow.innerHTML = "";

            leftArrow.className = "nf-view-arrow nf-left";
            rightArrow.className = "nf-view-arrow nf-right";

            rightArrow.addEventListener('click', function(e) {
                e = e || window.e;
                _this.nextSlide();
            }, false);

            leftArrow.addEventListener('click', function(e) {
                e = e || window.e;

                _this.prevSlide();
            }, false);

            viewArea.appendChild(leftArrow);
            viewArea.appendChild(rightArrow);

        },

        adjustArrowVisibility: function() {
            var _this = this;

            if (typeof _this.s.arrows !== "undefined") {
                if (_this.s.arrows === true) {
                    if (_this.p.currentSlide == "0") {
                        _this.app.querySelector('.nf-view').querySelector('.nf-left').style.opacity = '0';
                    } else {
                        _this.app.querySelector('.nf-view').querySelector('.nf-left').style.opacity = '100';
                    }

                    if (_this.p.currentSlide == (_this.images.length - 1)) {
                        _this.app.querySelector('.nf-view').querySelector('.nf-right').style.opacity = '0';
                    } else {
                        _this.app.querySelector('.nf-view').querySelector('.nf-right').style.opacity = '100';
                    }
                }
            }

        },

        initNavigation: function() {
            var _this = this;

            if (typeof _this.s.nav !== "undefined") {

                if (_this.s.nav == "dots") {
                    _this.initDots();
                } else if (_this.s.nav == "thumbnails") {
                    _this.initThumbnails();
                }

            }

        },

        initDots: function() {
            var _this = this;
            var thumbContainer = _this.app.querySelector(".nf-thumb-inner");
            var thumbHTML = "";
            for (var i = 0; i < _this.images.length; i++) {
                thumbHTML += "<div class='nf-thumb-slide nf-dot' data-nf-id='" + i + "'></div>";
            }

            thumbContainer.innerHTML = thumbHTML;


        },

        initThumbnails: function() {
            var _this = this;
            var thumbContainer = _this.app.querySelector(".nf-thumb-inner");
            var thumbHTML = "";
            for (var i = 0; i < _this.images.length; i++) {
                thumbHTML += "<div class='nf-thumb-slide nf-thumb' data-nf-id='" + i + "' style='background-image:url(" + _this.getThumbImage(i) + _this.getUrlParam(200) + ")'></div>";
            }

            thumbContainer.innerHTML = thumbHTML;

        },

        getThumbImage: function(i) {
            var _this = this;
            if (typeof _this.images[i] !== "undefined") {
                if (typeof _this.images[i].thumb !== "undefined") {
                    return _this.images[i].thumb;
                } else {
                    return _this.images[i].img;
                }
            }
            return "";
        },

        updateNavigation: function() {
            var _this = this;
            var thumbContainer = _this.app.querySelector(".nf-thumb-inner");

            list = thumbContainer.querySelectorAll(".nf-thumb-slide");
            for (var i = 0; i < list.length; i++) {
                if (_this.s.nav == "thumbnails") {
                    list[i].style.border = "1px solid #e3e3e3";
                } else {
                    list[i].style.background = "#e3e3e3";
                }

                if (i == _this.p.currentSlide) {
                    if (_this.s.nav == "thumbnails") {
                        list[i].style.border = "2px solid rgb(117, 134, 185)";
                    } else {
                        list[i].style.background = "#333333";
                    }

                }
            }

            _this.manageThumbnails();


        },

        getThumbnails: function() {
            var _this = this;
            var thumbs = _this.app.querySelectorAll('.nf-thumb-slide');
            if (thumbs.length > 0) {
                return thumbs;
            } else {
                return [];
            }

        },


        /* 
         * thumbnail manager 
         * - Hide extra thumbnails outside of fullscreen
         */

        manageThumbnails: function() {
            var _this = this;
            if (_this.hideThumbs === true) {


                if (_this.thumbsOn === true) {
                    var thumbnails = _this.getThumbnails();
                    var thumbWidth = _this.getThumbnailWidth(thumbnails[0]);
                    if (_this.fullscreen === false) {
                        _this.s.thumbMax = Math.floor(_this.s.width / thumbWidth);
                        for (var i = (_this.s.thumbMax); i < thumbnails.length; i++) {
                            thumbnails[i].style.display = "none";
                        }
                    } else {
                        _this.s.thumbMax = Math.floor(window.innerWidth / thumbWidth);
                        for (var i = 0; i < thumbnails.length; i++) {
                            thumbnails[i].style.display = "inline-block";
                        }
                    }

                }
            }
        },


        /*
         * Thumbnail Scrolling
         */

        enableThumbScroller: function() {
            var _this = this;
            if (_this.scrollThumbs) {
                _this.p.thumbSlides = 0;

                var thumbParentContainer = _this.app.querySelector('.nf-thumb');
                thumbParentContainer.style.overflowX = "hidden";

                var thumbContainer = _this.app.querySelector('.nf-thumb-inner');

                var thumbnails = _this.getThumbnails();

                _this.p.thumbWidth = _this.getThumbnailWidth(thumbnails[0]);
                thumbContainer.style.width = _this.p.thumbWidth * thumbnails.length;

                _this.s.thumbMax = Math.floor((_this.s.width - (_this.p.thumbWidth / 2)) / _this.p.thumbWidth);

                _this.p.thumbSlideWidth = _this.p.thumbWidth * _this.s.thumbMax;

                _this.p.thumbSlideCount = Math.ceil(thumbnails.length / _this.s.thumbMax);

                _this.addThumbArrows();

                _this.thumbnailSliderEnabled = true;
            }
        },

        addThumbArrows: function() {
            var _this = this;

            if (_this.thumbArrowsAdded === false) {


                var viewArea = _this.app.querySelector('.nf-thumb');
                var leftArrow = document.createElement('div');
                var rightArrow = document.createElement('div');

                leftArrow.innerHTML = "";
                rightArrow.innerHTML = "";

                leftArrow.className = "nf-thumb-arrow nf-left";
                rightArrow.className = "nf-thumb-arrow nf-right";

                rightArrow.addEventListener('click', function(e) {
                    e = e || window.e;
                    _this.nextThumbSlide();
                }, false);

                leftArrow.addEventListener('click', function(e) {
                    e = e || window.e;
                    _this.prevThumbSlide();
                }, false);

                viewArea.appendChild(leftArrow);
                viewArea.appendChild(rightArrow);

                _this.adjustThumbnailArrowVisibility();

                _this.thumbArrowsAdded = true;
            }

        },

        adjustThumbnailArrowVisibility: function() {
            var _this = this;

            if (typeof _this.scrollThumbs !== "undefined") {
                if (_this.scrollThumbs === true) {
                    if (_this.p.currentThumbSlide == "0") {
                        _this.app.querySelector('.nf-thumb').querySelector('.nf-left').style.opacity = '0';
                        _this.app.querySelector('.nf-thumb').querySelector('.nf-left').style.visibility = 'hidden';
                    } else {
                        _this.app.querySelector('.nf-thumb').querySelector('.nf-left').style.opacity = '100';
                        _this.app.querySelector('.nf-thumb').querySelector('.nf-left').style.visibility = 'visible';
                    }

                    if (_this.p.currentThumbSlide == (_this.p.thumbSlideCount - 1) && (_this.p.thumbSlideCount - 1) !== 0) {
                        _this.app.querySelector('.nf-thumb').querySelector('.nf-right').style.opacity = '0';
                    } else {
                        _this.app.querySelector('.nf-thumb').querySelector('.nf-right').style.opacity = '100';
                    }
                }
            }

        },


        moveToThumbnailSlide: function(slideId) {
            var _this = this;
            if (_this.thumbnailSliderEnabled) {
                _this.p.currentThumbSlide = slideId;
                var px = _this.p.thumbSlideWidth * _this.p.currentThumbSlide;
                _this.setTransform(_this.app.querySelector(".nf-thumb-inner"), "transform", "translate3d(-" + px + "px,0px,0px)");
            }
            _this.adjustThumbnailArrowVisibility();
        },

        nextThumbSlide: function() {
            var _this = this;

            if ((parseInt(_this.p.currentThumbSlide) + 1) < _this.p.thumbSlideCount) {
                _this.moveToThumbnailSlide(parseInt(_this.p.currentThumbSlide) + 1);
            }
        },

        prevThumbSlide: function() {
            var _this = this;

            if ((parseInt(_this.p.currentThumbSlide) - 1) >= 0) {
                _this.moveToThumbnailSlide(parseInt(_this.p.currentThumbSlide) - 1);
            }

        },


        getThumbnailWidth: function(element) {
            var _this = this;
            var style = element.currentStyle || window.getComputedStyle(element),
                width = element.offsetWidth, // or use style.width
                margin = parseFloat(style.marginLeft) + parseFloat(style.marginRight),
                padding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight),
                border = parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth);

            return width + margin - padding + border;
        },




        /*
         *.  Listeners
         */

        setListeners: function() {
            var _this = this;

            _this.setResizeListeners();
            _this.setSwipingListeners();
            _this.setThumbnailListeners();
            _this.setFullScreenListeners();

        },

        setFullScreenListeners: function() {
            var _this = this;

            var viewWrap = _this.app.querySelector(".nf-view-wrap");
            viewWrap.addEventListener('click', function() {
                _this.openFullScreen();
            });

            var close = _this.app.querySelector(".nf-close");
            close.addEventListener('click', function() {
                _this.closeFullScreen();
            });


        },

        setResizeListeners: function() {
            var _this = this;

            window.addEventListener('resize', function(e) {
                e = e || window.e;
                _this.resize();
            });

        },

        setThumbnailListeners: function() {

            var _this = this;
            var thumbContainer = _this.app.querySelector(".nf-thumb-inner");
            var list = thumbContainer.querySelectorAll(".nf-thumb-slide");
            for (let i = 0; i < list.length; i++) {
                var iter = i;
                list[iter].addEventListener('click', function(e) {
                    e = e || window.e;
                    _this.navClick(e.target);

                });
            }
            _this.thumbsOn = true;

            var event = new CustomEvent("thumbnailscomplete", {
                "detail": list
            });
            window.dispatchEvent(event);

        },

        navClick: function(div) {
            var _this = this;
            console.log("clicked")
            var id = parseInt(div.getAttribute('data-nf-id'));
            _this.moveToSlide(id);

        },

        setSwipingListeners: function() {
            var _this = this;

            var container = _this.app.querySelector(".nf-view-wrap");

            container.addEventListener("touchstart", startTouch, false);
            container.addEventListener("touchmove", moveTouch, false);
            container.addEventListener("mousedown", startTouch, false);
            container.addEventListener("mouseup", moveTouch, false);

            var initialX = null;
            var initialY = null;

            function startTouch(e) {
                e = e || window.e;
                initialX = e.clientX;
                initialY = e.clientY;
                if (typeof e.touches !== "undefined") {
                    initialX = e.touches[0].clientX || e.clientX;
                    initialY = e.touches[0].clientY || e.clientY;
                }

            };

            function moveTouch(e) {
                e = e || window.e;
                if (initialX === null) {
                    return;
                }

                if (initialY === null) {
                    return;
                }

                var currentX = e.clientX;
                var currentY = e.clientY;
                if (typeof e.touches !== "undefined") {
                    currentX = e.touches[0].clientX || e.clientX;
                    currentY = e.touches[0].clientY || e.clientY;
                }


                var diffX = initialX - currentX;
                var diffY = initialY - currentY;

                if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 75) {
                    // sliding horizontally
                    if (diffX > 0) {
                        // swiped left
                        _this.nextSlide();
                    } else {
                        // swiped right
                        _this.prevSlide();
                    }
                }

                initialX = null;
                initialY = null;

                e.preventDefault();
            };

        },


        /*
         * full screen
         */

        openFullScreen: function() {
            var _this = this;
            _this.fullscreen = true;
            var ret = _this.app.className.replace(/ fullscreen/g, '');
            _this.app.className = ret + " fullscreen";
            _this.hideLens();
            _this.resize();
            _this.manageThumbnails();
            _this.moveToThumbnailSlide(0);
        },

        closeFullScreen: function() {
            var _this = this;
            _this.fullscreen = false;
            _this.app.className = _this.app.className.replace(/ fullscreen/g, '');
            var view = _this.app.querySelector(".nf-view");
            view.style.width = "";
            _this.resize();
            _this.resize();
            _this.manageThumbnails();
        },


        initGalleryBadges: function() {
            var _this = this;

            for (var i = 0; i < _this.badges.length; i++) {
                _this.addBadgeHtml(_this.badges[i]);
            }

            return _this.badges;

        },


        addBadge: function(data) {
            var _this = this;
            _this.badges.push(data);
            _this.addBadgeHtml(data);
        },

        /* private only */
        addBadgeHtml: function(data) {
            var _this = this;
            var badge = document.createElement('div');
            badge.className = "nf-badge " + _this.getBadgePosition(data.corner);
            badge.innerHTML = data.html;
            _this.app.querySelector('.nf-view').insertBefore(badge, _this.app.querySelector('.nf-view').firstChild);
            if (typeof data.callback !== "undefined") {
                data.callback(badge);
            }
        },

        getBadgePosition: function(corner) {

            if (corner == "top-right") {
                return corner;
            } else if (corner == "bottom-left") {
                return corner;
            } else if (corner == "bottom-right") {
                return corner;
            } else {
                return "top-left";
            }

        },



        setListenForImages: function(){
            var _this = this;
            
            var loop = function(){
                 if(_this.imagesAreLoaded()){
                    var event = new CustomEvent("galleryimagesloaded", {
                        "detail": _this.images
                    });
                    window.dispatchEvent(event);
                    return true;
                 } else {
                    setTimeout(function(){
                        loop();
                    },100)
                 }
            }

            loop();
        },



        /*
         * Zoom feature
         */

        initZoom: function() {
            var _this = this;

            if(typeof _this.s.zoom !== "undefined"){
                if(_this.s.zoom === true && !_this.isMobile()){
                    window.addEventListener('galleryimagesloaded', function(e){
                        e = e || window.e;
                        var imageElems = _this.app.querySelectorAll('.nf-view-slide img');
                        for(let i = 0;i < imageElems.length;i++){
                            _this.imageZoom(imageElems[i], "nf-zoom-" + i);
                            _this.setAllZoomInvisible();
                        }
                        window.addEventListener('mousemove', function(e){
                            e = e || window.e;
                            if(!_this.isHoveringAtAll('img-zoom-lens', e)){
                                _this.hideLens();
                                _this.setAllZoomInvisible();
                            } else {
                                _this.showLens();    
                            }
                        });
                    });
                }
            }
            

        },

        hideLens: function(){
            var _this = this;
            lenses = _this.app.querySelectorAll('.img-zoom-lens');
            for(var i = 0; i < lenses.length;i++){
                lenses[i].style.visibility = "hidden";
            }

        },

        showLens: function(){
            var _this = this;
            if(_this.fullscreen || _this.isMobile()){
                return false;
            }
            lenses = _this.app.querySelectorAll('.img-zoom-lens');
            for(var i = 0; i < lenses.length;i++){
                lenses[i].style.visibility = "visible";
            }

        },

        setAllZoomInvisible: function(){
            var _this = this;

            var zommWindows = _this.app.querySelectorAll(".nf-zoom-result");
            for(var i = 0; i < zommWindows.length;i++){
               zommWindows[i].style.display = "none";
            }

        },

        isHoveringAtAll: function(elementClass, e){
            var _this = this;

            var x = e.clientX; 
            var y = e.clientY;
            elementMouseIsOver = document.elementFromPoint(x, y);

            if(elementMouseIsOver.className.indexOf(elementClass) !== -1){
                return true;
            }

            return false;

        },

        imageZoom: function(_img, resultID) {
            var _this = this;

            var img, lens, result, cx, cy;

            img = _img;
            console.log(img);
            
            var zoomResult = document.createElement('div');
            zoomResult.id = resultID;
            zoomResult.className = "nf-zoom-result";
            _this.insertAfter(zoomResult, _this.app.querySelector('.nf-view'));

            result = document.getElementById(resultID);
            /* Create lens: */
            lens = document.createElement("DIV");
            lens.setAttribute("class", "img-zoom-lens");
            /* Insert lens: */
            img.parentElement.insertBefore(lens, img);
            /* Calculate the ratio between result DIV and lens: */
            
            //result.style.height = result.offsetWidth*(img.height/img.width);

            var parentRect = img.offsetParent;//.getBoundingClientRect();
            var fromTop = (parentRect.offsetHeight/2)-(img.height/2);
            var fromLeft = (parentRect.offsetWidth/2)-(img.width/2);

            cx = result.offsetWidth / lens.offsetWidth;
            cy = result.offsetHeight / lens.offsetHeight;

            /* Set background properties for the result DIV */
            var src = img.src;
            result.style.backgroundImage = "url('" + src.split('?')[0] + _this.getUrlParam(screen.width) + "')";
            result.style.backgroundSize = (img.width * cx) + "px " + (img.height * cy) + "px";

            /* Execute a function when someone moves the cursor over the image, or the lens: */
            lens.addEventListener("mousemove", moveLens);
            lens.addEventListener("touchmove", moveLens);


            img.addEventListener("mouseout", function(e){
                e = e || window.e;
                result.style.display = "none";
            });
            img.addEventListener("mousemove", moveLens);
            img.addEventListener("touchstop", function(e){
                e = e || window.e;
                result.style.display = "none";
            });
            img.addEventListener("touchmove", moveLens);


            function moveLens(e) {
                _this.showLens();
                var pos, x, y;
                result.style.display = "block";
                //result.style.visibility = "visible";

                /* Prevent any other actions that may occur when moving over the image */
                e.preventDefault();
                /* Get the cursor's x and y positions: */

                pos = getCursorPos(e, fromTop);

                /* Calculate the position of the lens: */
                x = pos.x - (lens.offsetWidth / 2);
                y = pos.y - (lens.offsetHeight / 2);
                /* Prevent the lens from being positioned outside the image: */
                if (x > img.width - lens.offsetWidth) {
                    x = img.width - lens.offsetWidth;
                }
                if (x < 0) {
                    x = 0;
                }
                if (y > img.height - lens.offsetHeight) {
                    y = img.height - lens.offsetHeight;
                }
                if (y < 0) {
                    y = 0;
                }
                /* Set the position of the lens: */
                lens.style.left = x + "px";
                lens.style.top = (y +fromTop)+ "px";
                /* Display what the lens "sees": */
                
                result.style.backgroundPosition = "-" + (x * cx) + "px -" + ((y * cy)+fromTop) + "px";
            }
            function getCursorPos(e, fromTop) {
                var a, x = 0,
                    y = 0;
                e = e || window.event;
                /* Get the x and y positions of the image: */
                a = img.getBoundingClientRect();
                /* Calculate the cursor's x and y coordinates, relative to the image: */
                
                //console.log(fromTop);
                x = e.pageX - a.left;
                y = e.pageY - a.top ;//+ fromTop;
                /* Consider any page scrolling: */
                x = x - window.pageXOffset;
                y = y - window.pageYOffset;
                return {
                    x: x,
                    y: y
                };
            }

            _this.ZOOM_ENABLED = true;
        },

        isOutOfZoom: function(){

        },

        /*
         * utility
         */
        setVendorPrefix: function(element, property, value) {
            element.style["webkit" + property] = value;
            element.style["Moz" + property] = value;
            element.style["ms" + property] = value;
            element.style["o" + property] = value;
            element.style["" + property] = value;
        },

        insertAfter: function (newNode, referenceNode) {
            referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
        },

        isMobile: function() {
            if(window.innerWidth <= 1024) {
                return true;
            } else {
                return false;
            }
        },

        ensureCustomEvents: function() {
            (function() {

                if (typeof window.CustomEvent === "function") return false;

                function CustomEvent(event, params) {
                    params = params || {
                        bubbles: false,
                        cancelable: false,
                        detail: undefined
                    };
                    var evt = document.createEvent('CustomEvent');
                    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
                    return evt;
                }

                CustomEvent.prototype = window.Event.prototype;

                window.CustomEvent = CustomEvent;
            })();
        },



    };
    return widget.init();
});
return nfGallery;
});