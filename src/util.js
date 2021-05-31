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
 * const siteName = extractPassedFreemarkerConfig("site")
 * const importantFlag = extractPassedFreemarkerConfig('flag2')
 *
 * @param param the name of the param (data-PARAM='VALUE') in the
 *              specified element
 * @param elementId optional, the id of the element to search. If
 *                  not specified, an element called 'root' is sought.
 * @returns {null|*} the value if set, or null.
 */
export function extractConfigFromFreemarker(param, elementId = "root") {
  console.log("Hello world from extractConfigFromFreemarker");
  const theElement = document.getElementById(elementId);
  const val = theElement.dataset[param];
  theElement.dataset[param] = "";
  if (val && val.startsWith("${") && val.endsWith("}")) return null;
  return val;
}
