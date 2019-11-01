import keys from './keys';

const config = {
  webClientId: keys.webClientId,
  ENDP_FRIENDS: `${keys.serverIp}/friends/`,
  ENDP_PENDING_FRIENDS: `${keys.serverIp}/friends/pending/`,
  ENDP_CONFIRM_FRIENDS: `${keys.serverIp}/friends/confirm/`,
  ENDP_RESUME: `${keys.serverIp}/resume/`,
  ENDP_JOBS: `${keys.serverIp}/jobs/find/`,
  ENDP_DISLIKE: `${keys.serverIp}/jobs/dislike/`,
  ENDP_LIKE: `${keys.serverIp}/jobs/like/`,
  ENDP_EMAIL: `${keys.serverIp}/messenger/email/`,
  ENDP_GOOGLE: `${keys.serverIp}/users/googleLogin/`,
  ENDP_USERS: `${keys.serverIp}/users/`,
};

export default config;
