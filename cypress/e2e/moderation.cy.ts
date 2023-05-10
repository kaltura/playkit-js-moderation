import {
  addComment,
  closeModerationPlugin,
  openModerationPlugin,
  openPopoverMenu,
  reportAndVerifyRequest,
  openAndSelectItemFromDropdown,
  loadPlayer,
  mockKalturaBe
} from './utils';

const MANIFEST = `#EXTM3U
#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio",LANGUAGE="en",NAME="English",AUTOSELECT=YES,DEFAULT=YES,URI="${location.origin}/media/index_1.m3u8",SUBTITLES="subs"
#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=509496,RESOLUTION=480x272,AUDIO="audio",SUBTITLES="subs"
${location.origin}/media/index.m3u8`;

const MANIFEST_SAFARI = `#EXTM3U
#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="subs",NAME="English",DEFAULT=NO,AUTOSELECT=YES,FORCED=NO,LANGUAGE="en",URI="${location.origin}/media/index_1.m3u8"
#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=504265,RESOLUTION=480x272,AUDIO="audio",SUBTITLES="subs"
${location.origin}/media/index.m3u8`;

const moderateItems = [
  {id: 1, label: 'Sexual Content'},
  {id: 2, label: 'Violent Or Repulsive'},
  {id: 3, label: 'Harmful Or Dangerous Act'},
  {id: 4, label: 'Spam / Commercials'}
];

describe('Moderation plugin', () => {
  beforeEach(() => {
    // manifest
    cy.intercept('GET', '**/a.m3u8*', Cypress.browser.name === 'webkit' ? MANIFEST_SAFARI : MANIFEST);
    // thumbnails
    cy.intercept('GET', '**/width/164/vid_slices/100', {fixture: '100.jpeg'});
    cy.intercept('GET', '**/height/360/width/640', {fixture: '640.jpeg'});
    // kava
    cy.intercept('GET', '**/index.php?service=analytics*', {});
    // go to test page
    cy.intercept('POST', 'http://mock-api/service/multirequest', {fixture: 'vod-entry.json'});
  });

  it('should open and close Moderation plugin', () => {
    mockKalturaBe();
    loadPlayer().then(() => {
      openModerationPlugin();
      cy.get('[data-testid="moderationRoot"]').should('exist');
      closeModerationPlugin();
      cy.get('[data-testid="moderationRoot"]').should('not.exist');
    });
  });

  it('should not allow clicking on report button', () => {
    mockKalturaBe();
    loadPlayer().then(() => {
      openModerationPlugin();
      cy.get('[data-testid="submitButton"]').should('have.attr', 'aria-disabled', 'true');
      closeModerationPlugin();
    });
  });

  it('should validate labels of popover menu items', () => {
    mockKalturaBe();
    loadPlayer().then(() => {
      openModerationPlugin();
      openPopoverMenu();
      for (let index = 0; index < moderateItems.length; index++) {
        const itemLabel = moderateItems[index].label;
        cy.get('[data-testid="popoverMenu"]').contains(itemLabel).should('exist');
      }
      closeModerationPlugin();
    });
  });

  it('should allow clicking on report button', () => {
    mockKalturaBe();
    loadPlayer().then(() => {
      openModerationPlugin();
      cy.get('[data-testid="submitButton"]').should('have.attr', 'aria-disabled', 'true');
      openAndSelectItemFromDropdown(moderateItems[0].label);
      cy.get('[data-testid="submitButton"]').should('have.attr', 'aria-disabled', 'false');
      closeModerationPlugin();
    });
  });

  it('should submit a report without a comment', () => {
    mockKalturaBe();
    loadPlayer().then(() => {
      openModerationPlugin();
      openAndSelectItemFromDropdown(moderateItems[0].label);
      reportAndVerifyRequest(moderateItems[0].id);
      // verify overlay was closed
      cy.get('[data-testid="moderationRoot"]').should('not.exist');
      // verify toast appears
      cy.get('.playkit-interactive-area').contains('The report was sent successfully').should('exist');
    });
  });

  it('should submit a report with a comment', () => {
    const comment = 'Writing a comment to report on this video';
    mockKalturaBe();
    loadPlayer().then(() => {
      openModerationPlugin();
      openAndSelectItemFromDropdown(moderateItems[2].label);
      addComment(comment);
      reportAndVerifyRequest(moderateItems[2].id, comment);
    });
  });

  it('should reach textarea limit of 500 chars', () => {
    // define text with more than 500 chars
    let longText = '';
    for (let i = 0; i < 510; i++) {
      longText += 'a';
    }
    mockKalturaBe();
    loadPlayer().then(() => {
      openModerationPlugin();
      addComment(longText);
      cy.get('textarea').should($div => {
        expect($div[0].textLength).to.eq(500);
      });
      cy.get('[data-testid="characterCounter"]').should($div => {
        expect($div[0].textContent).to.eq('500/500');
      });
      closeModerationPlugin();
    });
  });
});
