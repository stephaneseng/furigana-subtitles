/**
 * @jest-environment jsdom
 */

const extractCueLine = require('./furigana-subtitles').extractCueLine;

test('Should extract cue line', () => {
    const cueConfiguration = {
        line: 1,
        kanjis: [
            '真 ま',
            '夜 よ',
            '中 なか',
            '真 ま',
            '夜 よ',
            '中 なか'
        ]
      };
      const lyricsLines = [
        'ずっと真夜中でいいのに ずっと真夜中でいいのに'
      ];

    expect(extractCueLine(cueConfiguration, lyricsLines))
        .toBe('ずっと<ruby>真<rt>ま</rt></ruby><ruby>夜<rt>よ</rt></ruby><ruby>中<rt>なか</rt></ruby>でいいのに ずっと<ruby>真<rt>ま</rt></ruby><ruby>夜<rt>よ</rt></ruby><ruby>中<rt>なか</rt></ruby>でいいのに');
});
