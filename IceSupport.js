"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.IceSupport = IceSupport;
exports.useIceAllowed = useIceAllowed;

var _react = _interopRequireWildcard(require("react"));

var _ice = require("@craftercms/ice");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var IceIsAuthoringContext = /*#__PURE__*/(0, _react.createContext)();
var IceIsLoggedInContext = /*#__PURE__*/(0, _react.createContext)();

function IceSupport(props) {
  var _useState = (0, _react.useState)(null),
      _useState2 = _slicedToArray(_useState, 2),
      isAuthoring = _useState2[0],
      setIsAuthoring = _useState2[1];

  var _useState3 = (0, _react.useState)(null),
      _useState4 = _slicedToArray(_useState3, 2),
      isLoggedIn = _useState4[0],
      setIsLoggedIn = _useState4[1];

  var _useState5 = (0, _react.useState)(false),
      _useState6 = _slicedToArray(_useState5, 2),
      loading = _useState6[0],
      setLoading = _useState6[1];

  (0, _react.useEffect)(function () {
    if (isAuthoring === null) {
      // console.log("Authoring environment status is not known")
      if (!loading) {
        // console.log("Looking up authoring status.")
        setLoading(true);
        (0, _ice.fetchIsAuthoring)().then(function (isAuthSvrResp) {
          if (isAuthSvrResp) {
            // console.log("Authoring environment detected.");
            // we are in authoring. Go figure out if we're logged in or not.
            fetch("/studio/api/1/services/api/1/security/validate-session.json").then(function (res) {
              return res.json();
            }).then(function (result) {
              if (result.active) {
                // console.log("User "+result.user.username+" is logged in.  Loading authoring tools.");
                setIsLoggedIn(true);
                (0, _ice.addAuthoringSupport)().then(function () {
                  console.debug("Authoring tools have loaded and are ready to use by user {" + result.user.username + "}.");
                  setIsAuthoring(isAuthSvrResp);
                  setLoading(false);
                })["catch"](function (err) {
                  console.error("Failure adding authoring support: " + JSON.stringify(err));
                });
              } else {
                // console.log("User is not logged in");
                setIsLoggedIn(false);
              }
            }, function (error) {
              console.error("Failure checking for active user: " + JSON.stringify(error));
            });
          } else {
            // console.log("Authoring environment not detected.");
            setIsAuthoring(isAuthSvrResp);
            setLoading(false);
          }
        });
      }
    }
  }, [isAuthoring, loading]);
  return /*#__PURE__*/_react["default"].createElement(IceIsLoggedInContext.Provider, {
    value: isLoggedIn
  }, /*#__PURE__*/_react["default"].createElement(IceIsAuthoringContext.Provider, {
    value: isAuthoring
  }, props.children));
}

function useIceAllowed() {
  var isAuthoring = (0, _react.useContext)(IceIsAuthoringContext);
  var isLoggedIn = (0, _react.useContext)(IceIsLoggedInContext);
  return isAuthoring && isLoggedIn;
}
//# sourceMappingURL=IceSupport.js.map