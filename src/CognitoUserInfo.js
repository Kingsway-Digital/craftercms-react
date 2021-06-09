import React, { useEffect, useState } from "react";
import { useGlobalContext } from "./GlobalContext";
import { CognitoAuth } from "amazon-cognito-auth-js/dist/amazon-cognito-auth";
import { CognitoUserPool } from "amazon-cognito-identity-js";
import { config as AWSConfig, CognitoIdentityCredentials } from "aws-sdk";
import {
  setBearerTokenInCrafterClient,
  clearBearerTokenInCrafterClient,
} from "./Spa";
import { cognitoConfig, cognitoConfig as configuration } from "./cognitoConfig";

export function CognitoLoginCallback(props) {
  ensureConfigured();
  const [{ user }, update] = useGlobalContext();
  const { onSuccessInclude, onFailureInclude, onLoadInclude } = props;
  const [cognitoSession, setCognitoSession] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(true);
      parseCognitoCallbackUrl(window.location.href)
        .then((session) => {
          // console.debug("Parsed callback got cognitoSession", session);
          setCognitoSession(session);
          const appUser = asAppUser(session);
          update({ user: appUser });
          setBearerTokenInCrafterClient(session.idToken.jwtToken);
          setLoading(false);
        })
        .catch((e) => {
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

export function CognitoLogoutCallback(props) {
  ensureConfigured();
  const [{ user }, update] = useGlobalContext();
  const { onSuccessInclude, onFailureInclude, onLoadInclude } = props;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    clearBearerTokenInCrafterClient();
    update({ user: null });
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

export function CognitoUserRequired(props) {
  ensureConfigured();
  const { children, fallback } = props;
  const [cognitoSession, setCognitoSession] = useState(null);
  const [{ user }, update] = useGlobalContext();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    if (user) {
      setIsLoggedIn(true);
    } else {
      getAppUser()
        .then((cu) => {
          update({ user: cu });
          setBearerTokenInCrafterClient(session.idToken.jwtToken);
          setIsLoggedIn(true);
        })
        .catch((e) => {
          // console.debug("Did not locate user (" + e + ")");
          setIsLoggedIn(false);
        });
    }
  }, [user, configuration]);
  return isLoggedIn ? children : fallback;
}

export const getCognitoSignInUri = () => {
  ensureConfigured();
  return `${configuration.getConfig().url}/login?scopes=${
    configuration.getConfig().scopes
  }&response_type=code&client_id=${
    configuration.getConfig().appClientId
  }&redirect_uri=${base() + configuration.getConfig().callbackPath}`;
};

export const getCognitoSignUpUri = () => {
  ensureConfigured();
  return `${configuration.getConfig().url}/signup?scopes=${
    configuration.getConfig().scopes
  }&response_type=code&client_id=${
    configuration.getConfig().appClientId
  }&redirect_uri=${base() + configuration.getConfig().callbackPath}`;
};

export const getCognitoSignOutUri = () => {
  ensureConfigured();
  return `${configuration.getConfig().url}/logout?client_id=${
    configuration.getConfig().appClientId
  }&logout_uri=${base() + configuration.getConfig().signoutPath}`;
};

const ensureConfigured = () => {
  if (configuration.isConfigured()) return;
  throw Error("Cognito settings not configured");
};

const base = () => {
  const windowUrlParts = window.location.href.split("/");
  return windowUrlParts[0] + "//" + windowUrlParts[2];
};

const createCognitoAuth = () => {
  const appWebDomain = configuration
    .getConfig()
    .url.replace("https://", "")
    .replace("http://", "");
  const auth = new CognitoAuth({
    UserPoolId: configuration.getConfig().userPoolId,
    ClientId: configuration.getConfig().appClientId,
    AppWebDomain: appWebDomain,
    TokenScopesArray: configuration.getConfig().scopes.split("+"),
    RedirectUriSignIn: base() + configuration.getConfig().callbackPath,
    RedirectUriSignOut: base() + configuration.getConfig().signoutPath,
  });
  return auth;
};

const createCognitoUser = () => {
  const pool = new CognitoUserPool({
    UserPoolId: configuration.getConfig().userPoolId,
    ClientId: configuration.getConfig().appClientId,
  });
  return pool.getCurrentUser();
};

const parseCognitoCallbackUrl = (fullCallbackUrl) => {
  // console.debug("Processing callback URL", fullCallbackUrl);
  return new Promise((resolve, reject) => {
    const auth = createCognitoAuth();

    auth.userhandler = {
      onSuccess: function (session) {
        resolve(session);
      },
      onFailure: function (e) {
        reject(new Error("Failure parsing callback URL: " + e));
      },
    };
    auth.parseCognitoWebResponse(fullCallbackUrl);
  });
};

const getAppUser = () => {
  return new Promise((resolve, reject) => {
    const cognitoUser = createCognitoUser();
    if (cognitoUser) {
      cognitoUser.getSession((error, session) => {
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

const asAppUser = (session) => {
  const poolUrl = `${configuration.getConfig().url}/${
    configuration.getConfig().userPoolId
  }`;
  const credentials = new CognitoIdentityCredentials({
    Logins: {
      [poolUrl]: session.idToken.jwtToken,
    },
  });

  let cu = {};
  for (const prop in session.idToken.payload) {
    cu[prop] = session.idToken.payload[prop];
  }
  // should we allow developer to do custom mapping?
  cu.credentials = credentials;
  return cu;
};
