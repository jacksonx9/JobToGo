/* eslint-env detox/detox, mocha */

describe('Auth Screens', () => {
  it('Check AuthLanding component', async () => {
    await device.reloadReactNative();
    await expect(element(by.id('logoLight'))).toBeVisible();
    await expect(element(by.id('jobSeeker'))).toBeVisible();
    await expect(element(by.id('google'))).toBeVisible();
    await expect(element(by.id('signInAuth'))).toBeVisible();

    await element(by.id('signInAuth')).tap();
    await expect(element(by.id('logoSignin'))).toBeVisible();
    await expect(element(by.id('usernameSignIn'))).toBeVisible();
    await expect(element(by.id('passwordSignIn'))).toBeVisible();
    await expect(element(by.id('signIn'))).toBeVisible();
  });

  it('Correct login sequence', async () => {
    await device.reloadReactNative();
    await element(by.id('signInAuth')).tap();
    await element(by.id('usernameSignIn')).typeText('jobtogo\n');
    await waitFor(element(by.id('passwordSignIn'))).toBeVisible().withTimeout(2000);
    await element(by.id('passwordSignIn')).typeText('jobtogo\n');
    await waitFor(element(by.id('signIn'))).toBeVisible().withTimeout(2000);
    await element(by.id('signIn')).tap();
    await waitFor(element(by.id('jobSwipe'))).toBeVisible();
  });

  it('Blank login sequence', async () => {
    await device.reloadReactNative();
    await element(by.id('signInAuth')).tap();
    await element(by.id('usernameSignIn')).typeText('\n');
    await waitFor(element(by.id('passwordSignIn'))).toBeVisible().withTimeout(2000);
    await element(by.id('passwordSignIn')).typeText('\n');
    await waitFor(element(by.id('signIn'))).toBeVisible().withTimeout(2000);
    await element(by.id('signIn')).tap();
    await expect(element(by.id('emptySignIn'))).toBeVisible();
  });

  it('Incorrect login sequence', async () => {
    await device.reloadReactNative();
    await element(by.id('signInAuth')).tap();
    await element(by.id('usernameSignIn')).typeText('random\n');
    await waitFor(element(by.id('passwordSignIn'))).toBeVisible().withTimeout(2000);
    await element(by.id('passwordSignIn')).typeText('random\n');
    await waitFor(element(by.id('signIn'))).toBeVisible().withTimeout(2000);
    await element(by.id('signIn')).tap();
    await expect(element(by.id('incorrectSignIn'))).toBeVisible();
  });

  it('Blank Sign Up', async () => {
    await device.reloadReactNative();
    await element(by.id('signUpAuth')).tap();
    await waitFor(element(by.id('signUp'))).toBeVisible().withTimeout(2000);
    await element(by.id('signUp')).tap();
    await expect(element(by.id('blankSignUp'))).toBeVisible();
  });

  it('Invalid Email Sign Up', async () => {
    await device.reloadReactNative();
    await element(by.id('signUpAuth')).tap();
    await element(by.id('emailSignUp')).typeText('info.jobtogo@gmail.com\n');
    await waitFor(element(by.id('usernameSignUp'))).toBeVisible().withTimeout(2000);
    await element(by.id('usernameSignUp')).typeText('jobtogo\n');
    await waitFor(element(by.id('passwordSignUp'))).toBeVisible().withTimeout(2000);
    await element(by.id('passwordSignUp')).typeText('jobtogo\n');
    await waitFor(element(by.id('signUp'))).toBeVisible().withTimeout(2000);
    await element(by.id('signUp')).tap();
    await expect(element(by.id('incorrectEmailSignUp'))).toBeVisible();
  });

  it('Invalid Username Sign Up', async () => {
    await device.reloadReactNative();
    await element(by.id('signUpAuth')).tap();
    await element(by.id('emailSignUp')).typeText('job@gmail.com\n');
    await waitFor(element(by.id('usernameSignUp'))).toBeVisible().withTimeout(2000);
    await element(by.id('usernameSignUp')).typeText('jobtogo\n');
    await waitFor(element(by.id('passwordSignUp'))).toBeVisible().withTimeout(2000);
    await element(by.id('passwordSignUp')).typeText('jobtogo\n');
    await waitFor(element(by.id('signUp'))).toBeVisible().withTimeout(2000);
    await element(by.id('signUp')).tap();
    await expect(element(by.id('incorrectUsernameSignUp'))).toBeVisible();
  });
});
