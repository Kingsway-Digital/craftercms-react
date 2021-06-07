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
        var cu = asCognitoUser(session);
        update({
          user: cu
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
  var children = props.children;

  var _useState9 = (0, _react.useState)(null),
      _useState10 = _slicedToArray(_useState9, 2),
      cognitoSession = _useState10[0],
      setCognitoSession = _useState10[1];

  var _useGlobalContext5 = (0, _GlobalContext.useGlobalContext)(),
      _useGlobalContext6 = _slicedToArray(_useGlobalContext5, 2),
      user = _useGlobalContext6[0].user,
      update = _useGlobalContext6[1];

  (0, _react.useEffect)(function () {
    if (!user) {
      getCognitoUser().then(function (cu) {
        update({
          user: cu
        });
        (0, _Spa.setBearerTokenInCrafterClient)(session.idToken.jwtToken);
      })["catch"](function (e) {
        console.error("Failed to locate user: " + e);
      });
    }
  }, [user, _cognitoConfig.cognitoConfig]);
  return user ? children : null;
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

var createCognitoUserPool = function createCognitoUserPool() {
  return new _amazonCognitoIdentityJs.CognitoUserPool({
    UserPoolId: _cognitoConfig.cognitoConfig.getConfig().userPoolId,
    ClientId: _cognitoConfig.cognitoConfig.getConfig().appClientId
  });
};

var createCognitoUser = function createCognitoUser() {
  var pool = createCognitoUserPool();
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

var getCognitoUser = function getCognitoUser() {
  return new Promise(function (resolve, reject) {
    var cognitoUser = createCognitoUser();
    cognitoUser.getSession(function (error, session) {
      if (error || !session) {
        reject(new Error("Failure getting Cognito session: " + error));
        return null;
      } // console.debug("Retrieved user session:", session);


      resolve(asCognitoUser(session));
    });
  });
};

var asCognitoUser = function asCognitoUser(session) {
  var poolUrl = "".concat(_cognitoConfig.cognitoConfig.getConfig().url, "/").concat(_cognitoConfig.cognitoConfig.getConfig().uesrPoolId);
  var credentials = new _awsSdk.CognitoIdentityCredentials({
    Logins: _defineProperty({}, poolUrl, session.idToken.jwtToken)
  });
  var cu = {};
  cu.id = session.idToken.payload["cognito:username"];
  cu.email = session.idToken.payload.email;
  cu.firstname = session.idToken.payload["given_name"];
  cu.lastname = session.idToken.payload["family_name"];
  cu.credentials = credentials;
  return cu;
};
//# sourceMappingURL=CognitoUserInfo.js.map