module.exports.frames = [
  {
    destination: 'Main WebStorm',
    predicate: window => {
      const rect = window.get('rect');
      return window.get('title').includes('- WebStorm')
          && rect.left >= -5;
    },
  },

  {
    destination: 'Browser Window',
    title: {
      oneOf: [/ - Google Chrome/i],
      noneOf: [
        /Auth/i,
        /login/i,
        /password/i,
        /Personal access tokens/i,
      ],
    },
    hide: true,
  },

  {
    destination: 'Vertical WebStorm',
    predicate: window => {
      const rect = window.get('rect');
      return window.get('title').includes('- WebStorm')
        && rect.right <= 15;
    },
    hide: true,
  },

  {
    destination: 'chrome keep it alive',
    title: {
      oneOf:  [`Keep it alive - Google Chrome`]
    },
    hide: true,
    // onActi
  },

  {
    destination: 'Left Upper side',
    title: {
      oneOf: [
        `Keep it alive - Google Chrome`,
      ],
    },
    transformTo: {
      position: {x: 740, y: 203},
      scale: { x: 1.1, y : 1.1 },
    },
    async cacheTransform (orchestrator) {
      const {
        position, scale, crop, bounds, width, height
      } = await orchestrator.obs.send('GetSceneItemProperties', {
        item: this.destination
      });
      console.log(scale);
      this.cachedTransform = {
        position, scale, crop, bounds, width, height
      };
    },
    async onActive (window, orchestrator) {
      await this.cacheTransform(orchestrator);
      await orchestrator.obs.send('SetSceneItemProperties', {
        item: this.destination,
        ...this.transformTo
      });
    },
    async onRelease (window, orchestrator) {
      await orchestrator.obs.send('SetSceneItemProperties', {
        item: this.destination,
        ...this.cachedTransform
      });
    }
  },

];
