const APP_REF: string = 'appRef.current';

/**
 * Set the given state to the <App> component.
 * @example
 *   { imageUrl: 'http://image.com/img.jpg', input: 'http://image.com/img.jpg',  isSignedIn: true }
 * @param {{}} state
 */
export const setAppState = (state: {}) =>
{
    cy.window().its(APP_REF).invoke('setState', state);
}