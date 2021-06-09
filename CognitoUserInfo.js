"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CognitoLoginCallback = CognitoLoginCallback;
exports.CognitoLogoutCallback = CognitoLogoutCallback;
exports.CognitoUserRequired = CognitoUserRequired;
exports.getCognitoSignOutUri = exports.getCognitoSignUpUri = exports.getCognitoSignInUri = void 0;

var _react = _interopRequireWildcard(require("react"));

var _GlobalContext = require("./GlobalContext");

var _amazonCognitoAuth = require("amazon-cognito-auth-js/dist/amazon-cognito-auth");

var _amazonCognitoIdentityJs = require("amazon-cognito-identity-js");

var _awsSdk = require("aws-sdk");

var _Spa = require("./Spa");

var _cognitoConfig = require("./cognitoConfig");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr && (typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]); if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function CognitoLoginCallback(props) {
  ensureConfigured();

  var _useGlobalContext = (0, _GlobalContext.useGlobalContext)(),
      _useGlobalContext2 = _slicedToArray(_useGlobalContext, 2),
      user = _useGlobalContext2[0].user,
      update = _useGlobalContext2[1];

  var onSuccessInclude = props.onSuccessInclude,
      onFailureInclude = props.onFailureInclude,
      onLoadInclude = props.onLoadInclude;

  var _useState = (0, _react.useState)(null),
      _useState2 = _slicedToArray(_useState, 2),
      cognitoSession = _useState2[0],
      setCognitoSession = _useState2[1];

  var _useState3 = (0, _react.useState)(false),
      _useState4 = _slicedToArray(_useState3, 2),
      loading = _useState4[0],
      setLoading = _useState4[1];

  (0, _react.useEffect)(function () {
    if (!user) {
      setLoading(true);
      parseCognitoCallbackUrl(window.location.href).then(function (session) {
        // console.debug("Parsed callback got cognitoSession", session);
        setCognitoSession(session);
        var appUser = asAppUser(session);
        update({
          user: appUser
        });
        (0, _Spa.setBearerTokenInCrafterClient)(session.idToken.jwtToken);
        setLoading(false);
      })["catch"](function (e) {
        console.error("Failure parsing callback url", e);
        setLoading(false);
      });
    }
  }, []);

  if (loading) {
    return onLoadInclude ? onLoadInclude : "";
  } else {
    if (cognitoSession) {
      return onSuccessInclude;
    } else {
      return onFailureInclude;
    }
  }
}

function CognitoLogoutCallback(props) {
  ensureConfigured();

  var _useGlobalContext3 = (0, _GlobalContext.useGlobalContext)(),
      _useGlobalContext4 = _slicedToArray(_useGlobalContext3, 2),
      user = _useGlobalContext4[0].user,
      update = _useGlobalContext4[1];

  var onSuccessInclude = props.onSuccessInclude,
      onFailureInclude = props.onFailureInclude,
      onLoadInclude = props.onLoadInclude;

  var _useState5 = (0, _react.useState)(false),
      _useState6 = _slicedToArray(_useState5, 2),
      loading = _useState6[0],
      setLoading = _useState6[1];

  var _useState7 = (0, _react.useState)(null),
      _useState8 = _slicedToArray(_useState7, 2),
      error = _useState8[0],
      setError = _useState8[1];

  (0, _react.useEffect)(function () {
    setLoading(true);
    (0, _Spa.clearBearerTokenInCrafterClient)();
    update({
      user: null
    });
    setLoading(false);
  }, [user, loading]);

  if (loading) {
    return onLoadInclude ? onLoadInclude : "";
  } else {
    if (error) {
      console.error("Failure in CognitoLogoutCallback", error);
      return onFailureInclude;
    } else {
      return onSuccessInclude;
    }
  }
}

function CognitoUserRequired(props) {
  ensureConfigured();
  var children = props.children,
      fallback = props.fallback;

  var _useState9 = (0, _react.useState)(null),
      _useState10 = _slicedToArray(_useState9, 2),
      cognitoSession = _useState10[0],
      setCognitoSession = _useState10[1];

  var _useGlobalContext5 = (0, _GlobalContext.useGlobalContext)(),
      _useGlobalContext6 = _slicedToArray(_useGlobalContext5, 2),
      user = _useGlobalContext6[0].user,
      update = _useGlobalContext6[1];

  var _useState11 = (0, _react.useState)(false),
      _useState12 = _slicedToArray(_useState11, 2),
      isLoggedIn = _useState12[0],
      setIsLoggedIn = _useState12[1];

  (0, _react.useEffect)(function () {
    if (user) {
      setIsLoggedIn(true);
    } else {
      getAppUser().then(function (cu) {
        update({
          user: cu
        });
        (0, _Spa.setBearerTokenInCrafterClient)(session.idToken.jwtToken);
        setIsLoggedIn(true);
      })["catch"](function (e) {
        // console.debug("Did not locate user (" + e + ")");
        setIsLoggedIn(false);
      });
    }
  }, [user, _cognitoConfig.cognitoConfig]);
  return isLoggedIn ? children : fallback;
}

var getCognitoSignInUri = function getCognitoSignInUri() {
  ensureConfigured();
  return "".concat(_cognitoConfig.cognitoConfig.getConfig().url, "/login?scopes=").concat(_cognitoConfig.cognitoConfig.getConfig().scopes, "&response_type=code&client_id=").concat(_cognitoConfig.cognitoConfig.getConfig().appClientId, "&redirect_uri=").concat(base() + _cognitoConfig.cognitoConfig.getConfig().callbackPath);
};

exports.getCognitoSignInUri = getCognitoSignInUri;

var getCognitoSignUpUri = function getCognitoSignUpUri() {
  ensureConfigured();
  return "".concat(_cognitoConfig.cognitoConfig.getConfig().url, "/signup?scopes=").concat(_cognitoConfig.cognitoConfig.getConfig().scopes, "&response_type=code&client_id=").concat(_cognitoConfig.cognitoConfig.getConfig().appClientId, "&redirect_uri=").concat(base() + _cognitoConfig.cognitoConfig.getConfig().callbackPath);
};

exports.getCognitoSignUpUri = getCognitoSignUpUri;

var getCognitoSignOutUri = function getCognitoSignOutUri() {
  ensureConfigured();
  return "".concat(_cognitoConfig.cognitoConfig.getConfig().url, "/logout?client_id=").concat(_cognitoConfig.cognitoConfig.getConfig().appClientId, "&logout_uri=").concat(base() + _cognitoConfig.cognitoConfig.getConfig().signoutPath);
};

exports.getCognitoSignOutUri = getCognitoSignOutUri;

var ensureConfigured = function ensureConfigured() {
  if (_cognitoConfig.cognitoConfig.isConfigured()) return;
  throw Error("Cognito settings not configured");
};

var base = function base() {
  var windowUrlParts = window.location.href.split("/");
  return windowUrlParts[0] + "//" + windowUrlParts[2];
};

var createCognitoAuth = function createCognitoAuth() {
  var appWebDomain = _cognitoConfig.cognitoConfig.getConfig().url.replace("https://", "").replace("http://", "");

  var auth = new _amazonCognitoAuth.CognitoAuth({
    UserPoolId: _cognitoConfig.cognitoConfig.getConfig().userPoolId,
    ClientId: _cognitoConfig.cognitoConfig.getConfig().appClientId,
    AppWebDomain: appWebDomain,
    TokenScopesArray: _cognitoConfig.cognitoConfig.getConfig().scopes.split("+"),
    RedirectUriSignIn: base() + _cognitoConfig.cognitoConfig.getConfig().callbackPath,
    RedirectUriSignOut: base() + _cognitoConfig.cognitoConfig.getConfig().signoutPath
  });
  return auth;
};

var createCognitoUser = function createCognitoUser() {
  var pool = new _amazonCognitoIdentityJs.CognitoUserPool({
    UserPoolId: _cognitoConfig.cognitoConfig.getConfig().userPoolId,
    ClientId: _cognitoConfig.cognitoConfig.getConfig().appClientId
  });
  return pool.getCurrentUser();
};

var parseCognitoCallbackUrl = function parseCognitoCallbackUrl(fullCallbackUrl) {
  // console.debug("Processing callback URL", fullCallbackUrl);
  return new Promise(function (resolve, reject) {
    var auth = createCognitoAuth();
    auth.userhandler = {
      onSuccess: function onSuccess(session) {
        resolve(session);
      },
      onFailure: function onFailure(e) {
        reject(new Error("Failure parsing callback URL: " + e));
      }
    };
    auth.parseCognitoWebResponse(fullCallbackUrl);
  });
};

var getAppUser = function getAppUser() {
  return new Promise(function (resolve, reject) {
    var cognitoUser = createCognitoUser();

    if (cognitoUser) {
      cognitoUser.getSession(function (error, session) {
        if (error || !session) {
          reject(new Error("Failure getting Cognito session: " + error));
        }

        resolve(asAppUser(session));
      });
    } else {
      reject("User not logged in");
    }
  });
};

var asAppUser = function asAppUser(session) {
  var poolUrl = "".concat(_cognitoConfig.cognitoConfig.getConfig().url, "/").concat(_cognitoConfig.cognitoConfig.getConfig().userPoolId);
  var credentials = new _awsSdk.CognitoIdentityCredentials({
    Logins: _defineProperty({}, poolUrl, session.idToken.jwtToken)
  });
  var cu = {};

  for (var prop in session.idToken.payload) {
    cu[prop] = session.idToken.payload[prop];
  } // should we allow developer to do custom mapping?


  cu.credentials = credentials;
  return cu;
};
//# sourceMappingURL=CognitoUserInfo.js.map