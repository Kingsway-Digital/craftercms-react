import { crafterConf } from "@craftercms/classes";

const baseUrlFromEnv = process.env.REACT_APP_STUDIO_BASE_URL;
const baseUrlFromCrafter = extractConfigFromFreemarker("b", "root");

const siteNameFromEnv = process.env.REACT_APP_STUDIO_SITE_NAME;
const siteNameFromCrafter = extractConfigFromFreemarker("s", "root");

const crafterConfig = { site: null, baseUrl: null };

if (!siteNameFromEnv && !siteNameFromCrafter) {
  console.error("Site name not set");
  throw Error("Configuration error");
} else if (siteNameFromCrafter && !baseUrlFromCrafter) {
  // if crafter provided the site it better provide the base URL
  console.error("Base url not set");
  throw Error("Configuration error");
} else {
  crafterConfig.site = siteNameFromCrafter
    ? siteNameFromCrafter
    : siteNameFromEnv;
  crafterConfig.baseUrl = baseUrlFromCrafter
    ? baseUrlFromCrafter
    : baseUrlFromEnv
    ? baseUrlFromEnv
    : "";
  crafterConf.configure(crafterConfig);
  // console.debug("Crafter SDK configured", crafterConf.getConfig());
}

export const getCrafterSite = () => crafterConfig.site;
export const getCrafterBaseUrl = () => crafterConfig.baseUrl;

export const Spa = (props) => {
  const { children } = props;
  if (crafterConf.getConfig().site && crafterConf.getConfig().site.length > 0) {
    return children;
  } else {
    console.error("Site not found in configuration.");
    return "Configuration error";
  }
};

export const setBearerTokenInCrafterClient = (token) => {
  // console.debug("Adding bearer token to Crafter client");
  if (token) {
    const config = crafterConf.getConfig();
    if (config.site && config.site.length > 0) {
      crafterConf.configure({ headers: { Authentication: "Bearer " + token } });
    }
  }
};

export const clearBearerTokenInCrafterClient = () => {
  // console.debug("Clearing bearer token from Crafter client");
  crafterConf.configure({ headers: { Authentication: "" } });
};

export const crafterUrl = (url) => {
  if (!url) return null;
  const hasQry = url.indexOf("?") > -1;
  return (
    crafterConfig.baseUrl +
    url +
    (hasQry ? "&" : "?") +
    "crafterSite=" +
    crafterConfig.site
  );
};

/**
 * Grabs the param from the dataset attribute in the specified
 * element ID and returns it.
 *
 * This function is designed to ignore values that begin with
 * <code>${</code> and end with <code>}</code> - it will return
 * null in those cases.  This effectively ignores freemarker
 * includes that aren't populated.
 *
 * Typical usage:
 * html:
 * <div id="root" data-site="mySiteName" data-flag2="flag 2 value" />
 *
 * javascript:
 * import {extractConfigFromFreemarker} from '@kingsway/craftercms-utils'
 * const siteName = extractPassedFreemarkerConfig("site", "root")
 * const importantFlag = extractPassedFreemarkerConfig('flag2', 'root')
 *
 * @param param the name of the param (data-PARAM='VALUE') in the
 *              specified element
 * @param elementId the id of the element to search.
 * @returns {null|*} the value if set, or null.
 */
function extractConfigFromFreemarker(param, elementId) {
  const theElement = document.getElementById(elementId);
  const val = theElement.dataset[param];
  theElement.dataset[param] = "";
  if (val && val.startsWith("${") && val.endsWith("}")) return null;
  return val;
}
