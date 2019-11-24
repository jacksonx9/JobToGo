import { serverIp, webClientId } from '../../credentials/credentials';

const config = {
  webClientId,
  ENDP_COMPANY_API: 'https://autocomplete.clearbit.com/v1/companies/suggest?query=',
  ENDP_FRIENDS: `${serverIp}/friends/`,
  ENDP_PENDING_FRIENDS: `${serverIp}/friends/pending/`,
  ENDP_CONFIRM_FRIEND_REQ: `${serverIp}/friends/confirm/`,
  ENDP_RESUME: `${serverIp}/resume/`,
  ENDP_JOBS_FIND: `${serverIp}/jobs/find/`,
  ENDP_JOBS: `${serverIp}/jobs/`,
  ENDP_JOBS_ALL: `${serverIp}/jobs/all/`,
  ENDP_DISLIKE: `${serverIp}/jobs/dislike/`,
  ENDP_LIKE: `${serverIp}/jobs/like/`,
  ENDP_SHARE_JOB: `${serverIp}/friends/sendJob/`,
  ENDP_SHARED_JOBS: `${serverIp}/friends/recommendedJobs/`,
  ENDP_LIKE_SHARED: `${serverIp}/friends/confirmJob/`,
  ENDP_DISLIKE_SHARED: `${serverIp}/friends/rejectJob/`,
  ENDP_EMAIL: `${serverIp}/messenger/email/`,
  ENDP_GOOGLE: `${serverIp}/users/googleLogin/`,
  ENDP_USERS: `${serverIp}/users/`,
  ENDP_LOGIN: `${serverIp}/users/login`,

  SOCKET_FRIENDS: 'friends',
  SOCKET_USERID: 'userId',
  SOCKET_PENDING: 'friends-pending',
  SOCKET_GET_SEARCH: 'users',
  SOCKET_SEND_SEARCH: 'users-search',
  SOCKET_SHARED: 'friends-recommendedJobs',
};

export default config;
