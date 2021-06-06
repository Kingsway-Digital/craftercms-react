var ConfigHolder = (function () {
  function ConfigHolder() {
    let url = null;
    let userPoolId = null;
    let appClientId = null;
    let scopes = null;
    let callbackPath = null;
    let signoutPath = null;
  }
  ConfigHolder.prototype.configure = function (settings) {
    // console.debug("Configuring with ", settings);
    this.userPoolId = settings.userPoolId;
    this.appClientId = settings.appClientId;
    this.scopes = settings.scopes;
    this.callbackPath = settings.callbackPath;
    this.signoutPath = settings.signoutPath;
    this.url = settings.url;
  };
  ConfigHolder.prototype.getConfig = function () {
    return this;
  };
  ConfigHolder.prototype.isConfigured = function () {
    return this.url != null;
  };
  return ConfigHolder;
})();

const cognitoConfig = new ConfigHolder();
export { cognitoConfig };
