var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-50023463-1']);
_gaq.push(['_trackPageview']);

function trackInstall(details) {
    var reason = details.reason,
        previousVersion = details.previousVersion;

    _gaq.push(['_trackEvent', 'extension', 'install', reason, previousVersion]);
}

function trackPlayerPaused() {
    _gaq.push(['_trackEvent', 'youtube', 'paused']);
}

function trackPlayerStarted() {
    _gaq.push(['_trackEvent', 'youtube', 'playing']);
}

chrome.runtime.onInstalled.addListener(trackInstall);

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.eventName === 'YoutubeAutoplayStopper_PlayerPaused_Forward') {
        var tabId = sender.tab.id;
        chrome.pageAction.show(tabId);

        trackPlayerPaused();
    } else if (message.eventName === 'YoutubeAutoplayStopper_PlayerPlaying_Forward') {
        var tabId = sender.tab.id;
        chrome.pageAction.hide(tabId);

        trackPlayerStarted();
    } else if (message.eventName === 'YoutubeAutoplayStopper_PlayerUnstarted_Forward') {
        var tabId = sender.tab.id;
        chrome.pageAction.hide(tabId);
    }
});

function loadAnalytics() {
    (function () {
        var ga = document.createElement('script');
        ga.type = 'text/javascript';
        ga.async = true;
        ga.src = 'https://ssl.google-analytics.com/ga.js';
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(ga, s);
    })();
}

loadAnalytics();

var analyticsCheckIntervalId = setInterval(function () {
    if (window._gat && window._gat._getTracker) {
        clearInterval(analyticsCheckIntervalId);
        return;
    }

    loadAnalytics();
}, 30000);