const serverIp = 'http://128.189.30.18:8080';
// const serverIp = 'http://3.15.8.116:8080';
const config = {
  webClientId: '617405875578-f23h0uql1ol1qhk64qd16mcubqludhah.apps.googleusercontent.com',
  ENDP_FRIENDS: `${serverIp}/friends/`,
  ENDP_PENDING_FRIENDS: `${serverIp}/friends/pending/`,
  ENDP_CONFIRM_FRIENDS: `${serverIp}/friends/confirm/`,
  ENDP_RESUME: `${serverIp}/resume/`,
  ENDP_JOBS: `${serverIp}/jobs/find/`,
  ENDP_DISLIKE: `${serverIp}/jobs/dislike/`,
  ENDP_LIKE: `${serverIp}/jobs/like/`,
  ENDP_EMAIL: `${serverIp}/messenger/email/`,
  ENDP_GOOGLE: `${serverIp}/users/googleLogin/`,
  ENDP_USERS: `${serverIp}/users/`,
};

export default config;
