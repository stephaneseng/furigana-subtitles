const SUPPORTED_VIDEO_IDS = [
    'I88PrE-KUPk', // 2020-07-13 MILABO
    'H88kps8X4Mk' // 2023-06-04 Hanaichi Monnme
];

function main() {
    console.debug('Furigana Subtitles extension loaded, going to wait for the video');

    waitForElement('video').then(videoElement => {
        console.debug('Video found, going to load the configuration file');

        for (const textTrack of videoElement.textTracks) {
            textTrack.mode = 'disabled';
        }

        const videoId = (new URLSearchParams(window.location.search)).get('v');

        if (!SUPPORTED_VIDEO_IDS.includes(videoId)) {
            console.debug('Video not supported');
            return;
        }

        import(chrome.runtime.getURL(`/configurations/${videoId}.js`)).then(configuration => {
            console.debug('Configuration file loaded, going to wait for the pinned comment');

            waitForElement('#comments #pinned-comment-badge').then(pinnedCommentBadgeElement => {
                console.debug('Pinned comment found, going to add cues');

                const track = videoElement.addTextTrack('captions', 'Japanese', 'jp');
                track.mode = 'showing';

                const lyricsLines = pinnedCommentBadgeElement.closest('#main').querySelector('#content-text').innerText.split(/\r\n/g);

                for (const cueConfiguration of configuration.cues) {
                    const cueLine = extractCueLine(cueConfiguration, lyricsLines);

                    const vttCue = new VTTCue(cueConfiguration.start, cueConfiguration.end, cueLine);
                    vttCue.line = -2;
                    track.addCue(vttCue);

                    console.debug(`Cue added for line ${cueConfiguration.line}`);
                }

                console.debug('All cues added');
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

function extractCueLine(cueConfiguration, lyricsLines) {
    var line = lyricsLines[cueConfiguration.line - 1];

    if (cueConfiguration.lineSliceStart !== undefined || cueConfiguration.lineSliceEnd !== undefined) {
        line = line.split(/[ 、]/).slice(cueConfiguration.lineSliceStart, cueConfiguration.lineSliceEnd).join(' ');
    }

    var cueLine = '';

    cueConfiguration.kanjis.forEach(kanjiConfiguration => {
        const kanjiConfigurationParts = kanjiConfiguration.split(/ /);
        const kanji = kanjiConfigurationParts[0];
        const furigana = kanjiConfigurationParts[1];

        var kanjiIndex = line.indexOf(kanji);
        cueLine += line.substring(0, kanjiIndex) + `<ruby>${kanji}<rt>${furigana}</rt></ruby>`;
        line = line.substring(kanjiIndex + kanji.length);
    });

    cueLine += line;

    return cueLine;
}

// https://stackoverflow.com/questions/34077641/how-to-detect-page-navigation-on-youtube-and-modify-its-appearance-seamlessly
document.addEventListener('yt-navigate-finish', main);
