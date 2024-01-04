const CONFIGURATION = [
    {
        // ZUTOMAYO – Hanaichi Monnme (Music Video)
        videoId: 'H88kps8X4Mk',
        cues: [
            {
                line: 1,
                start: 19.600,
                end: 22.666,
                furiganas: [
                    { kanji: '真', kana: 'ま' },
                    { kanji: '夜', kana: 'よ' },
                    { kanji: '中', kana: 'なか' },
                    { kanji: '溢', kana: 'こぼ' },
                    { kanji: '午', kana: 'ご' },
                    { kanji: '前', kana: 'ぜん' },
                    { kanji: '時', kana: 'じ' }
                ]
            },
            {
                line: 2,
                start: 22.700,
                end: 26.533,
                furiganas: [
                    { kanji: '目', kana: 'め' },
                    { kanji: '見', kana: 'み' },
                    { kanji: '波', kana: 'は' },
                    { kanji: '形', kana: 'けい' },
                    { kanji: '腐', kana: 'くさ' }
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

                cue.furiganas.forEach(furigana => {
                    line = line.replace(furigana.kanji, `<ruby>${furigana.kanji}<rt>${furigana.kana}</rt></ruby>`)
                });

                track.addCue(new VTTCue(cue.start, cue.end, line));
            });
        })
    });
}
