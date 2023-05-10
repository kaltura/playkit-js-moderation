export const openModerationPlugin = () => {
  cy.get('[data-testid="moderationPluginButton"]').click({force: true});
};

export const closeModerationPlugin = () => {
  cy.get('.playkit-close-overlay').click({force: true});
};

export const openPopoverMenu = () => {
  cy.get('[data-testid="selectButton"').click({force: true});
  cy.get('[data-testid="popoverMenu"]').should('exist');
};

export const openAndSelectItemFromDropdown = (text: string) => {
  // open popover dropdown
  openPopoverMenu();

  // choose an item from popover menu
  cy.get('[data-testid="popoverMenu"]').contains(text).click({force: true});
  cy.get('[data-testid="popoverMenu"]').should('not.exist');

  cy.get('[data-testid="moderationRoot"]').contains(text).should('exist');
};

export const addComment = (comment: string) => {
  cy.get('textarea').type(comment, {force: true});
};

export const reportAndVerifyRequest = (flagType: number, expectedComment?: string) => {
  cy.get('[data-testid="submitButton"]').click({force: true});
  cy.wait('@submit')
    .its('request.body[2]')
    .should('deep.equal', {
      service: 'baseentry',
      action: 'flag',
      moderationFlag: {
        comments: expectedComment || '',
        flagType: flagType,
        flaggedEntryId: '0_wifqaipd',
        objectType: 'KalturaModerationFlag'
      },
      ks: '{1:result:ks}'
    });
};

const getPlayer = () => {
  // @ts-ignore
  return cy.window().then($win => $win.KalturaPlayer.getPlayers()['player-placeholder']);
};

const preparePage = (pluginConf = {}, playbackConf = {}) => {
  cy.visit('index.html');
  return cy.window().then(win => {
    try {
      // @ts-ignore
      var kalturaPlayer = win.KalturaPlayer.setup({
        targetId: 'player-placeholder',
        provider: {
          partnerId: -1,
          env: {
            cdnUrl: 'http://mock-cdn',
            serviceUrl: 'http://mock-api'
          }
        },
        playback: {muted: true, autoplay: true, ...playbackConf},
        plugins: {
          'playkit-js-moderation': pluginConf
        }
      });
      return kalturaPlayer.loadMedia({entryId: '0_wifqaipd'});
    } catch (e: any) {
      return Promise.reject(e.message);
    }
  });
};

export const loadPlayer = (pluginConf = {}, playbackConf = {}) => {
  return preparePage(pluginConf, playbackConf).then(() => getPlayer().then(kalturaPlayer => kalturaPlayer.ready().then(() => kalturaPlayer)));
};

const checkRequest = (reqBody: any, service: string, action: string) => {
  return reqBody?.service === service && reqBody?.action === action;
};

export const mockKalturaBe = (entryFixture = 'vod-entry.json') => {
  cy.intercept('http://mock-api/service/multirequest', req => {
    if (checkRequest(req.body[2], 'baseEntry', 'list')) {
      return req.reply({fixture: entryFixture});
    }
    if (checkRequest(req.body[2], 'baseentry', 'flag')) {
      req.alias = 'submit';
      return req.reply({fixture: 'report.json'});
    }
  });
  cy.intercept('GET', '**/ks/123', {fixture: 'thumb-asset.jpeg'}).as('getSlides');
  cy.intercept('GET', '**/vid_sec/*', {fixture: 'thumb-asset.jpeg'}).as('getChapters');
};
