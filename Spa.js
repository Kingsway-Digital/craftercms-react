"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.clearBearerTokenInCrafterClient = exports.setBearerTokenInCrafterClient = exports.Spa = exports.getCrafterBaseUrl = exports.getCrafterSite = void 0;

var _classes = require("@craftercms/classes");

var baseUrlFromEnv = process.env.REACT_APP_STUDIO_BASE_URL;
var baseUrlFromCrafter = extractConfigFromFreemarker("b", "root");
var siteNameFromEnv = process.env.REACT_APP_STUDIO_SITE_NAME;
var siteNameFromCrafter = extractConfigFromFreemarker("s", "root");
var crafterConfig = {
  site: null,
  baseUrl: null
};

if (!siteNameFromEnv && !siteNameFromCrafter) {
  console.error("Site name not set");
  throw Error("Configuration error");
} else if (siteNameFromCrafter && !baseUrlFromCrafter) {
  // if crafter provided the site it better provide the base URL
  console.error("Base url not set");
  throw Error("Configuration error");
} else {
  crafterConfig.site = siteNameFromCrafter ? siteNameFromCrafter : siteNameFromEnv;
  crafterConfig.baseUrl = baseUrlFromCrafter ? baseUrlFromCrafter : baseUrlFromEnv ? baseUrlFromEnv : "";

  _classes.crafterConf.configure(crafterConfig); // console.debug("Crafter SDK configured", crafterConf.getConfig());

}

var getCrafterSite = function getCrafterSite() {
  return crafterConfig.site;
};

exports.getCrafterSite = getCrafterSite;

var getCrafterBaseUrl = function getCrafterBaseUrl() {
  return crafterConfig.baseUrl;
};

exports.getCrafterBaseUrl = getCrafterBaseUrl;

var Spa = function Spa(props) {
  var children = props.children;

  if (_classes.crafterConf.getConfig().site && _classes.crafterConf.getConfig().site.length > 0) {
    return children;
  } else {
    console.error("Site not found in configuration.");
    return "Configuration error";
  }
};

exports.Spa = Spa;

var setBearerTokenInCrafterClient = function setBearerTokenInCrafterClient(token) {
  // console.debug("Adding bearer token to Crafter client");
  if (token) {
    var config = _classes.crafterConf.getConfig();

    if (config.site && config.site.length > 0) {
      _classes.crafterConf.configure({
        headers: {
          Authentication: "Bearer " + token
        }
      });
    }
  }
};

exports.setBearerTokenInCrafterClient = setBearerTokenInCrafterClient;

var clearBearerTokenInCrafterClient = function clearBearerTokenInCrafterClient() {
  // console.debug("Clearing bearer token from Crafter client");
  _classes.crafterConf.configure({
    headers: {
      Authentication: ""
    }
  });
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


exports.clearBearerTokenInCrafterClient = clearBearerTokenInCrafterClient;

function extractConfigFromFreemarker(param, elementId) {
  var theElement = document.getElementById(elementId);
  var val = theElement.dataset[param];
  theElement.dataset[param] = "";
  if (val && val.startsWith("${") && val.endsWith("}")) return null;
  return val;
}
//# sourceMappingURL=Spa.js.map