/* eslint-env detox/detox, mocha */

beforeEach(async () => {
  await device.reloadReactNative();
  await element(by.id('signInAuth')).tap();
  element(by.id('email')).typeText('secretUsername\n');
  await waitFor(element(by.id('password'))).toBeVisible().withTimeout(2000);
  element(by.id('password')).typeText('secretPassword\n');
  await waitFor(element(by.id('signIn'))).toBeVisible().withTimeout(2000);
  await element(by.id('signIn')).tap();
});

describe('Auth Screens', () => {
  it('Check AuthLanding component', async () => {
    await device.reloadReactNative();
    await expect(element(by.id('logoLight'))).toBeVisible();
    await expect(element(by.id('jobSeeker'))).toBeVisible();
    await expect(element(by.id('google'))).toBeVisible();
    await expect(element(by.id('signInAuth'))).toBeVisible();

    await element(by.id('signInAuth')).tap();
    await expect(element(by.id('logoSignin'))).toBeVisible();
    await expect(element(by.id('email'))).toBeVisible();
    await expect(element(by.id('password'))).toBeVisible();
    await expect(element(by.id('signIn'))).toBeVisible();
  });

  it('Correct login sequence', async () => {
    await device.reloadReactNative();
    await element(by.id('signInAuth')).tap();
    await element(by.id('email')).typeText('secretUsername\n');
    await waitFor(element(by.id('password'))).toBeVisible().withTimeout(2000);
    await element(by.id('password')).typeText('secretPassword\n');
    await waitFor(element(by.id('signIn'))).toBeVisible().withTimeout(2000);
    await element(by.id('signIn')).tap();
    await waitFor(element(by.id('jobSwipe'))).toBeVisible();
  });

  it('Incorrect login sequence', async () => {
    await device.reloadReactNative();
    await element(by.id('signInAuth')).tap();
    await element(by.id('email')).typeText('\n');
    await waitFor(element(by.id('password'))).toBeVisible().withTimeout(2000);
    await element(by.id('password')).typeText('\n');
    await waitFor(element(by.id('signIn'))).toBeVisible().withTimeout(2000);
    // await element(by.id('signIn')).tap();
    // await expect(element(by.id('loginErrorMsg'))).toBeVisible();
    // TODO: test for difference error responses
  });
});

describe('Home Screen', () => {
  it('Check Jobswipe components', async () => {
    await expect(element(by.id('mainHeader'))).toBeVisible();
    await expect(element(by.id('inbox'))).toBeVisible();
    // Check the inbox model
    await element(by.id('inbox')).tap();
    await expect(element(by.id('mainHeader'))).toBeVisible();

    // Switch back from the inbox model
    await element(by.id('inbox')).tap();
    await expect(element(by.id('mainHeader'))).toBeVisible();
  });

  it('Check share modal', async () => {
    // Check the share job modal
    await element(by.id('card0')).tap();
    await expect(element(by.id('shareModal'))).toBeVisible();

    // Close the share job modal
    await element(by.id('closeShare')).tap();
    await expect(element(by.id('shareModal'))).toBeNotVisible();
    await expect(element(by.id('mainHeader'))).toBeVisible();
  });

  it('Check info modal', async () => {
    // Check the share job modal
    await element(by.id('card0Open')).tap();
    await waitFor(element(by.id('card0Description'))).toBeVisible().withTimeout(2000);
    await expect(element(by.id('card0Description'))).toBeVisible();

    // Close the share job modal
    await element(by.id('card0Close')).tap();
    await expect(element(by.id('card0Description'))).toBeNotVisible();
  });
});

describe('Liked Screen', () => {
  it('Check Liked components', async () => {
    await element(by.id('liked')).tap();
    await expect(element(by.id('navHeaderLiked'))).toBeVisible();
    await expect(element(by.id('user'))).toBeVisible();
    await expect(element(by.text('Liked Jobs'))).toBeVisible();

    await expect(element(by.id('sendJobs'))).toBeVisible();
    await expect(element(by.id('likedJobs'))).toBeVisible();
    await expect(element(by.id('jobItem0'))).toBeVisible();
  });
});

describe('Friends Screen', () => {
  it('Check Friends components', async () => {
    await element(by.id('friends')).tap();

    // Nav header
    await expect(element(by.id('navHeaderFriends'))).toBeVisible();
    await expect(element(by.id('search'))).toBeVisible();
    // await expect(element(by.id('user'))).toBeVisible();

    // Switch navigator
    await expect(element(by.id('switchNav'))).toBeVisible();
    await expect(element(by.id('switchNavOption1'))).toBeVisible();
    await expect(element(by.id('switchNavOption2'))).toBeVisible();
    await expect(element(by.text('Friends Requests'))).toBeVisible();
    await expect(element(by.text('Your Friends'))).toBeVisible();

    // User should have no pending friends
    // await expect(element(by.id('infoDisplay'))).toBeVisible();
  });

  it('Navigate between Pending/Your Friends', async () => {
    await element(by.id('friends')).tap();
    await element(by.id('switchNavOption2')).tap();
    await element(by.id('switchNavOption1')).tap();

    // xfail once friends are added to user
    // await expect(element(by.id('infoDisplay'))).toBeVisible();
  });

  it('Display 100 friends', async () => {
    const NON_FUNC_REQ_FRIEND_COUNT = 100;
    await element(by.id('friends')).tap();
    await element(by.id('switchNavOption2')).tap();
    const userNums = Array.from(Array(NON_FUNC_REQ_FRIEND_COUNT).keys());

    await Promise.all(userNums.map(async num => {
      await waitFor(element(by.id(`userItem${num}`)))
        .toBeVisible().whileElement(by.id('friendList')).scroll(300, 'down');
    }));
  });

  it('Check user search component', async () => {
    await element(by.id('friends')).tap();
    await element(by.id('search')).tap();
    await expect(element(by.id('searchBack'))).toBeVisible();
    await expect(element(by.id('searchInput'))).toBeVisible();
  });

  it('Users search sequence', async () => {
    await element(by.id('friends')).tap();
    await element(by.id('search')).tap();

    await expect(element(by.id('friendList'))).toBeNotVisible();
    await expect(element(by.id('searchableUserList'))).toBeNotVisible();
    await expect(element(by.id('pendingUserList'))).toBeNotVisible();

    element(by.id('searchInput')).typeText('search query\n');
    await element(by.id('searchBack')).tap();

    // Go back to previous screen
    await expect(element(by.id('editFriends'))).toBeVisible();
  });
});

describe('Resume Page', () => {
  it('Check resume components', async () => {
    await element(by.id('resume')).tap();
    await expect(element(by.id('navHeaderSkills'))).toBeVisible();
    await expect(element(by.id('textSkills'))).toBeVisible();
    await expect(element(by.id('checkingDoc'))).toBeVisible();
    await expect(element(by.id('uploadResume'))).toBeVisible();
  });
});

describe('Navigation', () => {
  it('Navigation between pages', async () => {
    // Check navigation buttons
    await expect(element(by.id('home'))).toBeVisible();
    await expect(element(by.id('liked'))).toBeVisible();
    await expect(element(by.id('friends'))).toBeVisible();
    await expect(element(by.id('resume'))).toBeVisible();

    await element(by.id('friends')).tap();
    await expect(element(by.id('editFriends'))).toBeVisible();
    await element(by.id('resume')).tap();
    await expect(element(by.id('editSkills'))).toBeVisible();
    await element(by.id('home')).tap();
    await expect(element(by.id('jobSwipe'))).toBeVisible();
    await element(by.id('liked')).tap();
    await expect(element(by.id('sendLikedJobs'))).toBeVisible();
  });
});
