module.exports = [

  {
    sourceName: 'Vertical WebStorm',
    visibleWhen: [
      `eaciest [D:\\projects\\eaciest]`,
      `eacy [D:\\projects\\eacy]`,
      `eacy-ui [D:\\projects\\eacy-ui]`,
    ],
    setFromTitle: true
  },

  {
    sourceName: 'chrome keep it alive',
    visibleWhen: [
      `Keep it alive - Google Chrome`
    ]
  },

  {
    sourceName: 'Main WebStorm',
    visibleWhen: [
      `obs-ws-switcher`
    ]
  },

];

const frames = module.exports.frames = [
  {
    // type: 'window',
    predicate: window => {
      const rect = window.get('rect');
      return window.get('title').includes('- WebStorm')
          && rect.left >= -5;
    },
    destination: 'Main WebStorm'
  },
  {
    // type: 'window',
    title: {
      oneOf: [/поиск в google - Google Chrome/i],
    },
    hide: true,
    destination: 'Browser Window',
  },
  {
    // type: 'window',
    title: {
      oneOf:  [`Keep it alive - Google Chrome`]
    },
    hide: true,
    destination: 'chrome keep it alive',
  },
  {
    // type: 'window',
    predicate: window => {
      const rect = window.get('rect');
      return window.get('title').includes('- WebStorm')
        && rect.right <= 15;
    },
    title: {
      oneOf: [
        `eaciest [D:\\projects\\eaciest]`,
        `eacy [D:\\projects\\eacy]`,
        `eacy-ui [D:\\projects\\eacy-ui]`,
      ],
    },
    hide: true,
    destination: 'Vertical WebStorm',
  },

];
