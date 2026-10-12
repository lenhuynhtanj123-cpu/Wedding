/* ============================================================
   Trang web đám cưới — JavaScript
   Xử lý: loader, đếm ngược, menu mobile, hiệu ứng cuộn,
          lightbox, nhạc nền, form RSVP
   ============================================================ */

(function () {
    "use strict";

    /* ===== 1. Loader mở màn ===== */
    var loader = document.getElementById("loader");
    window.addEventListener("load", function () {
        setTimeout(function () {
            loader.classList.add("hidden");
        }, 1200);
    });
    // Dự phòng nếu sự kiện load không kịp chạy
    setTimeout(function () {
        loader.classList.add("hidden");
    }, 3500);

    /* ===== 2. Đếm ngược đến ngày cưới ===== */
    // TODO: Đổi ngày cưới tại đây (năm, tháng-1, ngày, giờ, phút)
    var weddingDate = new Date(2026, 11, 20, 18, 0, 0); // 20/12/2026 18:00

    var cdDays = document.getElementById("cdDays");
    var cdHours = document.getElementById("cdHours");
    var cdMinutes = document.getElementById("cdMinutes");
    var cdSeconds = document.getElementById("cdSeconds");

    function pad(n) {
        return String(n).padStart(2, "0");
    }

    function updateCountdown() {
        var now = new Date().getTime();
        var distance = weddingDate.getTime() - now;

        if (distance <= 0) {
            cdDays.textContent = "00";
            cdHours.textContent = "00";
            cdMinutes.textContent = "00";
            cdSeconds.textContent = "00";
            return;
        }

        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        cdDays.textContent = pad(days);
        cdHours.textContent = pad(hours);
        cdMinutes.textContent = pad(minutes);
        cdSeconds.textContent = pad(seconds);
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);

    /* ===== 3. Navbar đổi nền khi cuộn ===== */
    var navbar = document.getElementById("navbar");
    function onScroll() {
        if (window.scrollY > 60) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    }
    window.addEventListener("scroll", onScroll);
    onScroll();

    /* ===== 4. Menu mobile ===== */
    var navToggle = document.getElementById("navToggle");
    var navLinks = document.getElementById("navLinks");

    navToggle.addEventListener("click", function () {
        navLinks.classList.toggle("open");
        navToggle.classList.toggle("active");
    });

    // Đóng menu khi bấm vào 1 liên kết
    navLinks.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
            navLinks.classList.remove("open");
            navToggle.classList.remove("active");
        });
    });

    /* ===== 5. Hiệu ứng hiện khi cuộn (reveal) ===== */
    var revealEls = document.querySelectorAll(".reveal");

    if ("IntersectionObserver" in window) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        revealEls.forEach(function (el) {
            observer.observe(el);
        });
    } else {
        // Dự phòng: hiện tất cả nếu trình duyệt không hỗ trợ
        revealEls.forEach(function (el) {
            el.classList.add("visible");
        });
    }

    /* ===== 6. Lightbox xem ảnh lớn ===== */
    var lightbox = document.getElementById("lightbox");
    var lbImg = document.getElementById("lbImg");
    var lbClose = document.getElementById("lbClose");
    var galleryItems = document.querySelectorAll(".g-item");

    galleryItems.forEach(function (item) {
        item.addEventListener("click", function (e) {
            e.preventDefault();
            lbImg.src = item.getAttribute("href");
            lightbox.classList.add("open");
            lightbox.setAttribute("aria-hidden", "false");
        });
    });

    function closeLightbox() {
        lightbox.classList.remove("open");
        lightbox.setAttribute("aria-hidden", "true");
    }

    lbClose.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", function (e) {
        if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeLightbox();
    });

    /* ===== 7. Nhạc nền — SoundCloud Widget API ===== */
    var musicToggle = document.getElementById("musicToggle");
    var scFrame = document.getElementById("scFrame");
    var isPlaying = false;

    // Widget điều khiển trình phát SoundCloud nhúng
    var widget = null;
    var ready = false;
    var pendingPlay = false;

    if (window.SC && scFrame) {
        widget = SC.Widget(scFrame);
        widget.bind(SC.Widget.Events.READY, function () {
            ready = true;
            widget.setVolume(80); // âm lượng 0–100
            // Nếu người dùng bấm phát trước khi iframe tải xong
            if (pendingPlay) {
                widget.play();
            }
        });
        // Khi bài hát kết thúc -> cho phát lại (lặp)
        widget.bind(SC.Widget.Events.FINISH, function () {
            if (isPlaying) {
                widget.seekTo(0);
                widget.play();
            }
        });
    }

    musicToggle.addEventListener("click", function () {
        if (!widget) return;

        if (isPlaying) {
            widget.pause();
            musicToggle.classList.remove("playing");
        } else {
            if (ready) {
                widget.play();
            } else {
                pendingPlay = true; // phát ngay khi iframe sẵn sàng
            }
            musicToggle.classList.add("playing");
        }
        isPlaying = !isPlaying;
    });

    /* ===== 8. Form RSVP (validate + phản hồi) ===== */
    var rsvpForm = document.getElementById("rsvpForm");
    var formMsg = document.getElementById("formMsg");

    function setInvalid(el, invalid) {
        el.classList.toggle("invalid", invalid);
    }

    rsvpForm.addEventListener("submit", function (e) {
        e.preventDefault();

        var fullname = document.getElementById("fullname");
        var email = document.getElementById("email");
        var attend = document.getElementById("attend");

        var valid = true;

        if (!fullname.value.trim()) {
            setInvalid(fullname, true);
            valid = false;
        } else setInvalid(fullname, false);

        if (!email.value.trim()) {
            setInvalid(email, true);
            valid = false;
        } else setInvalid(email, false);

        if (!attend.value) {
            setInvalid(attend, true);
            valid = false;
        } else setInvalid(attend, false);

        if (!valid) {
            formMsg.textContent = "Vui lòng điền đầy đủ Họ tên, Liên hệ và Xác nhận tham dự.";
            formMsg.className = "form-msg err";
            return;
        }

        // Gửi thành công (demo — chưa gửi lên server)
        formMsg.textContent =
            "Cảm ơn " + fullname.value.trim() + "! Chúng tôi đã nhận được xác nhận của bạn. ❤";
        formMsg.className = "form-msg ok";
        rsvpForm.reset();
    });
})();

