"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cognitoConfig = void 0;

var ConfigHolder = function () {
  function ConfigHolder() {
    var url = null;
    var userPoolId = null;
    var appClientId = null;
    var scopes = null;
    var callbackPath = null;
    var signoutPath = null;
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
}();

var cognitoConfig = new ConfigHolder();
exports.cognitoConfig = cognitoConfig;
//# sourceMappingURL=cognitoConfig.js.map