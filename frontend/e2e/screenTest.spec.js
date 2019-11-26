/* eslint-env detox/detox, mocha */

beforeEach(async () => {
  await device.reloadReactNative();
  await element(by.id('signInAuth')).tap();
  element(by.id('usernameSignIn')).typeText('jobtogo\n');
  await waitFor(element(by.id('passwordSignIn'))).toBeVisible().withTimeout(2000);
  element(by.id('passwordSignIn')).typeText('jobtogo\n');
  await waitFor(element(by.id('signIn'))).toBeVisible().withTimeout(2000);
  await element(by.id('signIn')).tap();
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
});

describe('Liked Screen', () => {
  it('Check Liked components', async () => {
    await element(by.id('liked')).tap();
    await expect(element(by.id('navHeaderLiked'))).toBeVisible();
    await expect(element(by.text('Liked Jobs'))).toBeVisible();

    await expect(element(by.id('sendJobs'))).toBeVisible();
    await expect(element(by.id('likedJobs'))).toBeVisible();
    await expect(element(by.id('jobItem0'))).toBeVisible();
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

describe('DrawerNavigation', () => {
  it('Open and Close Drawer', async () => {

    await element(by.id('liked')).tap();
    await expect(element(by.id('navHeaderLiked')));
    await element(by.id('navHeaderLikedMenu')).tap();
    await expect(element(by.id('userNameDisplay')));
    await expect(element(by.id('emailDisplay')));
    await element(by.id('closeDrawer')).tap();
  });

  it('Use Drawer Navigator', async () => {
    await element(by.id('Profile')).tap();
    await element(by.id('updateUserName')).tap();
    await element(by.id('navHeaderUsernameBack')).tap();
    await element(by.id('Profile')).tap();
    await element(by.id('updatePassword')).tap();
    await element(by.id('navHeaderPasswordBack')).tap();
    await element(by.id('Profile')).tap();
    await element(by.id('updateKeywords')).tap();
    await element(by.id('navHeaderKeywordsBack')).tap();

    await element(by.id('liked')).tap();
    await expect(element(by.id('navHeaderLiked')));
    await element(by.id('navHeaderLikedMenu')).tap();
    await element(by.id('updateUserName')).tap();
    await element(by.id('navHeaderUsernameBack')).tap();
    await element(by.id('navHeaderLikedMenu')).tap();
    await element(by.id('updatePassword')).tap();
    await element(by.id('navHeaderPasswordBack')).tap();
    await element(by.id('navHeaderLikedMenu')).tap();
    await element(by.id('updateKeywords')).tap();
    await element(by.id('navHeaderKeywordsBack')).tap();
  });

  it('Log Out', async () => {
    await element(by.id('Profile')).tap();
    await element(by.id('logOut')).tap();
    await waitFor(element(by.id('logoLight'))).toBeVisible().withTimeout(4000);
    await expect(element(by.id('jobSeeker'))).toBeVisible();
    await expect(element(by.id('google'))).toBeVisible();
    await expect(element(by.id('signInAuth'))).toBeVisible();
  });
});


describe('DrawerPages', () => {
  it('Update Username Page', async () => {
    await element(by.id('Profile')).tap();
    await element(by.id('updateUserName')).tap();
    await expect(element(by.id('navHeaderUsername')));
    await element(by.id('submitUsername')).tap();
    await expect(element(by.id('blankUsername')));
  });

  it('Update Password Page', async () => {
    await element(by.id('Profile')).tap();
    await element(by.id('updatePassword')).tap();
    await expect(element(by.id('navHeaderPassword')));
    await element(by.id('submitPassword')).tap();
    await expect(element(by.id('blankPassword')));
  });

  it('Keyword List Page', async () => {
    await element(by.id('Profile')).tap();
    await element(by.id('updateKeywords')).tap();
    await element(by.id('keywordInput')).tap();
    element(by.id('keywordInput')).typeText('newSkill\n');
    await element(by.id('submitKeyword')).tap();
    await element(by.id('keyword2Remove')).tap();
    await expect(element(by.id('keyword2Remove'))).toBeNotVisible();
  });
});
