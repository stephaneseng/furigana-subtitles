const CONFIGURATION = [
    {
        // Hanaichi Monnme
        videoId: 'H88kps8X4Mk',
        cues: [
            {
                line: 1,
                start: 19.600,
                end: 22.666,
                translations: [
                    '真夜中 midnight',
                    '溢 to let (one\'s feelings) show',
                    '午前 a.m.',
                    '時 o\'clock'
                ],
                furiganas: [
                    '真 ま',
                    '夜 よ',
                    '中 なか',
                    '溢 こぼ',
                    '午 ご',
                    '前 ぜん',
                    '時 じ'
                ]
            },
            {
                line: 2,
                start: 22.700,
                end: 26.533,
                translations: [
                    '目に見え to be visible',
                    '波形 waveform',
                    '腐 to rot'
                ],
                furiganas: [
                    '目 め',
                    '見 み',
                    '波 は',
                    '形 けい',
                    '腐 くさ'
                ]
            }
        ]
    }
];

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

console.debug('Extension loaded');

const urlSearchParams = new URLSearchParams(window.location.search);
const videoId = urlSearchParams.get('v');

const configuration = CONFIGURATION.filter(c => c.videoId === videoId)[0];

if (configuration !== undefined) {
    waitForElement('video').then(videoElement => {
        console.debug('Video element found');

        waitForElement('#comments #pinned-comment-badge').then(pinnedCommentBadgeElement => {
            console.debug('Pinned comment found');

            const lines = pinnedCommentBadgeElement.closest('#main').querySelector('#content-text').innerText.split(/\r\n/g);
            console.debug(lines);

            const track = videoElement.addTextTrack('captions', 'Japanese', 'jp');
            track.mode = 'showing';

            configuration.cues.forEach(cue => {
                var line = lines[cue.line - 1];

                cue.translations.forEach(translation => {
                    const left = translation.substring(0, translation.indexOf(' '));
                    const right = translation.substring(translation.indexOf(' ') + 1);

                    line = line.replace(left, `<ruby style="ruby-position: under;">${left}<rt>${right}</rt></ruby>`);
                });

                cue.furiganas.forEach(furigana => {
                    const left = furigana.substring(0, furigana.indexOf(' '));
                    const right = furigana.substring(furigana.indexOf(' ') + 1);

                    line = line.replace(left, `<ruby>${left}<rt>${right}</rt></ruby>`);
                });

                track.addCue(new VTTCue(cue.start, cue.end, line));
            });
        })
    });
}
