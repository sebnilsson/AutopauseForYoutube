(function injectScript() {
    var s = document.createElement('script');
    s.src = chrome.extension.getURL('youtube.js');
    s.onload = function () {
        this.parentNode.removeChild(this);
    };
    (document.head || document.documentElement).appendChild(s);
})();

function throttleFn(fn, wait) {
    wait = wait || 1000;
    var last, deferTimer;

    return function () {
        var now = +new Date();

        if (last && now < last + wait) {
            clearTimeout(deferTimer);
            deferTimer = setTimeout(function () {
                last = now;
            }, wait);
        } else {
            last = now;
            fn.apply(this, arguments);
        }
    };
}

function getChromeMessageThrottled(eventName) {
    return throttleFn(function () {
        chrome.runtime.sendMessage({
            eventName: eventName
        });
    }, 200);
}

var forwardPlayerPausedThrottled = getChromeMessageThrottled('YoutubeAutoplayStopper_PlayerPaused_Forward'),
    forwardPlayerPlayingThrottled = getChromeMessageThrottled('YoutubeAutoplayStopper_PlayerPlaying_Forward'),
    forwardPlayerUnstartedThrottled = getChromeMessageThrottled('YoutubeAutoplayStopper_PlayerUnstarted_Forward');

window.addEventListener('message', function (event) {
    if (event.data.eventName === 'YoutubeAutoplayStopper_PlayerPaused') {
        resetVideoVolumes();

        forwardPlayerPausedThrottled();
    } else if (event.data.eventName === 'YoutubeAutoplayStopper_PlayerPlaying') {
        forwardPlayerPlayingThrottled();
    } else if (event.data.eventName === 'YoutubeAutoplayStopper_PlayerUnstarted') {
        forwardPlayerUnstartedThrottled();
    }
});

var videoEls = [];

function muteVideoVolumes() {
    var videoNodes = document.querySelectorAll('video');
    videoEls = [].slice.call(videoNodes);

    videoEls.forEach(function (x) {
        x.dataset.originalVolume = x.volume;
        x.volume = 0;
    });
}

function resetVideoVolumes() {
    videoEls.forEach(function (x) {
        var originalVolume = x.dataset.originalVolume;

        if (originalVolume) {
            x.volume = originalVolume;
        }
    });
}

function onDocumentReady() {
    muteVideoVolumes();
}

var acceptableReadyState = 'interactive';

if (document.readyState === 'complete' || document.readyState === acceptableReadyState) {
    onDocumentReady();
} else {
    document.onreadystatechange = function () {
        if (document.readyState === acceptableReadyState) {
            document.onreadystatechange = undefined;
            onDocumentReady();
        }
    };
}

// document.addEventListener('DOMContentLoaded', function() {
//     console.log('content.js: DOMContentLoaded');
//     document.removeEventListener('DOMContentLoaded', arguments.callee, true);
//     onDocumentReady();
// }, true);