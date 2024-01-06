const SUPPORTED_VIDEO_IDS = [
    'H88kps8X4Mk' // 2023-06-04 Hanaichi Monnme
];

function main() {
    console.debug('Extension loaded');

    const videoId = (new URLSearchParams(window.location.search)).get('v');

    if (!SUPPORTED_VIDEO_IDS.includes(videoId)) {
        console.debug('Video not supported');
        return;
    }

    import(browser.extension.getURL(`/configurations/${videoId}.js`)).then(configuration => {
        console.debug('Configuration file loaded');

        waitForElement('video').then(videoElement => {
            console.debug('Video found');

            for (const textTrack of videoElement.textTracks) {
                textTrack.mode = 'disabled';
            }

            waitForElement('#comments #pinned-comment-badge').then(pinnedCommentBadgeElement => {
                console.debug('Pinned comment found');

                const lines = pinnedCommentBadgeElement.closest('#main').querySelector('#content-text').innerText.split(/\r\n/g);

                const track = videoElement.addTextTrack('captions', 'Japanese', 'jp');
                track.mode = 'showing';

                for (const cue of configuration.cues) {
                    var line = lines[cue.line - 1];

                    if (cue.lineSliceStart !== undefined || cue.lineSliceEnd !== undefined) {
                        line = line.split(' ').slice(cue.lineSliceStart, cue.lineSliceEnd).join(' ');
                    }

                    var done = '';
                    var todo = line;

                    cue.kanjis.forEach(kanjiWithFurigana => {
                        const kanji = kanjiWithFurigana.substring(0, kanjiWithFurigana.indexOf(' '));
                        const furigana = kanjiWithFurigana.substring(kanjiWithFurigana.indexOf(' ') + 1);

                        var kanjiIndex = todo.indexOf(kanji);
                        done += todo.substring(0, kanjiIndex) + `<ruby>${kanji}<rt>${furigana}</rt></ruby>`;
                        todo = todo.substring(kanjiIndex + kanji.length);
                    });

                    done += todo;

                    var vttCue = new VTTCue(cue.start, cue.end, done);
                    vttCue.line = -2;
                    track.addCue(vttCue);
                }

                console.debug('Cues added');
            });
        });
    });
}

// https://stackoverflow.com/questions/5525071/how-to-wait-until-an-element-exists
function waitForElement(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                observer.disconnect();
                resolve(document.querySelector(selector));
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

// https://stackoverflow.com/questions/34077641/how-to-detect-page-navigation-on-youtube-and-modify-its-appearance-seamlessly
document.addEventListener('yt-navigate-finish', main);
