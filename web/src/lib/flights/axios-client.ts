import getConfig from 'next/config';
import axios from 'axios';

const { serverRuntimeConfig } = getConfig();

export default axios.create({
  baseURL: serverRuntimeConfig.flightsServiceUrl,
});
