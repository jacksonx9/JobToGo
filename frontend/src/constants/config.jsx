import { serverIp, webClientId } from '../../credentials/credentials';

const config = {
  webClientId,
  COMPANY_API_ENDPT: 'https://autocomplete.clearbit.com/v1/companies/suggest?query=',
  LOGO_SIZE: 200,
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
