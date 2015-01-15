(function () {
    function noop() {}

    var STATE_UNSTARTED = -1,
        STATE_ENDED = 0,
        STATE_PLAY = 1,
        STATE_PAUSED = 2,
        STATE_BUFFERING = 3,
        STATE_CUED = 5,
        currentTimestamp,
        hasPaused,
        hasPlayed;

    function handlePlayerUnstarted(player) {
        hasPaused = false;
        hasPlayed = false;

        window.postMessage({
            eventName: 'YoutubeAutoplayStopper_PlayerUnstarted'
        }, '*');
    }

    function handlePlayerPaused(player) {
        player.pauseVideo();

        var hasTimeHash = /t=/.test(window.location.hash);
        if (!hasTimeHash) {
            player.seekTo(0);
        }

        setTimeout(function () {
            hasPaused = true;
        }, 500);

        window.postMessage({
            eventName: 'YoutubeAutoplayStopper_PlayerPaused'
        }, '*');
    }

    function handlePlayerPlaying(player) {
        hasPlayed = true;

        window.postMessage({
            eventName: 'YoutubeAutoplayStopper_PlayerPlaying'
        }, '*');
    }

    function initPlayer(player) {
        function handleStateChange(state) {
            if (state === STATE_UNSTARTED) {
                handlePlayerUnstarted(player);
            } else if (!hasPaused && state === STATE_PLAY) {
                handlePlayerPaused(player);
            } else if (!hasPlayed && state === STATE_PLAY) {
                handlePlayerPlaying(player);
            }
        }

        if (!player || !player.addEventListener) {
            return;
        }

        window.dispatchEvent(new Event('onInitPlayer'));

        player.timestamp = +new Date();
        currentTimestamp = player.timestamp;
        var onStateChangeFn = function (state) {
            if (player.timestamp !== currentTimestamp) {
                return;
            }

            handleStateChange(state);
        };

        player.addEventListener('onStateChange', onStateChangeFn);

        window.addEventListener('onInitPlayer', function () {
            window.removeEventListener('onInitPlayer', arguments.callee);

            player.removeEventListener('onStateChange', onStateChangeFn);
        });

        var playerState = player.getPlayerState();
        handleStateChange(playerState);
    }

    function initAutopause(player) {
        if (!player || !player.addEventListener) {
            player = document.getElementById('player-api');
        }

        initPlayer(player);
    }

    //var existingOnYouTubePlayerReady = window.onYouTubePlayerReady;
    //var existingOnYouTubeIframeAPIReady = window.onYouTubeIframeAPIReady;

    window.onYouTubePlayerReady = function (player) {
        initAutopause(player);

        //window.onYouTubePlayerReady = existingOnYouTubePlayerReady;
    };

    window.onYouTubeIframeAPIReady = function (player) {
        initAutopause(player);

        //window.onYouTubeIframeAPIReady = existingOnYouTubeIframeAPIReady;
    };
})();