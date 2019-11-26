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

describe('Friends Screen', () => {
  it('Check Friends components', async () => {
    await element(by.id('friends')).tap();

    // Nav header
    await expect(element(by.id('navHeaderFriends'))).toBeVisible();
    await expect(element(by.id('search'))).toBeVisible();

    // Switch navigator
    await expect(element(by.id('switchNav'))).toBeVisible();
    await expect(element(by.id('switchNavOption1'))).toBeVisible();
    await expect(element(by.id('switchNavOption2'))).toBeVisible();
    await expect(element(by.text('Friends Requests'))).toBeVisible();
    await expect(element(by.text('Your Friends'))).toBeVisible();

    // User should have no pending friends
    await expect(element(by.id('navHeaderFriends'))).toBeVisible();
  });

  it('Navigate between Pending/Your Friends', async () => {
    await element(by.id('friends')).tap();
    await element(by.id('switchNavOption2')).tap();
    await element(by.id('switchNavOption1')).tap();

    // xfail once friends are added to user
    await expect(element(by.id('navHeaderFriends'))).toBeVisible();
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

  it('Users fail search sequence', async () => {
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

  it('Users search sequence', async () => {
    await element(by.id('friends')).tap();
    await element(by.id('search')).tap();

    element(by.id('searchInput')).typeText('0\n');
    await expect(element(by.text('friend'))).toBeVisible();
    await element(by.id('searchBack')).tap();

    // Go back to previous screen
    await expect(element(by.id('editFriends'))).toBeVisible();
  });

  it('Add another User sequence', async () => {
    await element(by.id('friends')).tap();
    await element(by.id('search')).tap();

    element(by.id('searchInput')).typeText('newFriend\n');
    await expect(element(by.id('search0FirstButton'))).toBeVisible();
  });
});
