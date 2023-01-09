export const openModerationPlugin = () => {
    cy.get('.playkit-pre-playback-play-button').click({force: true});
    cy.get('[data-testid="moderationPluginButton"]').click({force: true});
}

export const closeModerationPlugin = () => {
    cy.get('.playkit-close-overlay').click({force: true});
}

export const openPopoverMenu = () => {
    cy.get('[data-testid="selectButton"').click({force: true});
    cy.get('[data-testid="popoverMenu"]').should('exist');
}

export const openAndSelectItemFromDropdown = (text: string) => {
    // open popover dropdown
    openPopoverMenu();

    // choose an item from popover menu
    cy.get('[data-testid="popoverMenu"]').contains(text).click({force: true});
    cy.get('[data-testid="popoverMenu"]').should('not.exist');

    cy.get('[data-testid="moderationRoot"]').contains(text).should('exist');
}

export const addComment = (comment: string) => {
    cy.get('textarea').type(comment, {force: true});
}

export const reportAndVerifyRequest = (flagType: number, expectedComment?: string) => {
    cy.intercept('POST', 'http://mock-api/service/multirequest').as('submit');
    cy.get('[data-testid="submitButton"]').click({force: true});
    cy.get('@submit').its('request.body[2]').should('deep.equal', {
            service: "baseentry",
            action: "flag",
            moderationFlag: {
                comments: expectedComment || "",
                flagType: flagType,
                flaggedEntryId: "0_wifqaipd",
                objectType: "KalturaModerationFlag"
            },
            ks: "{1:result:ks}"
        }
    );
}