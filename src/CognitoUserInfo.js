import React, { useEffect, useState } from "react";
import { useGlobalContext } from "./GlobalContext";
import { CognitoAuth } from "amazon-cognito-auth-js/dist/amazon-cognito-auth";
import { CognitoUserPool } from "amazon-cognito-identity-js";
import { config as AWSConfig, CognitoIdentityCredentials } from "aws-sdk";
import {
  setBearerTokenInCrafterClient,
  clearBearerTokenInCrafterClient,
} from "./Spa";

export function CognitoLoginCallback(props) {
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
          const cu = asCognitoUser(session);
          update({ user: cu });
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
  const { children } = props;
  const [cognitoSession, setCognitoSession] = useState(null);
  const [{ user }, update] = useGlobalContext();
  useEffect(() => {
    if (!user) {
      getCognitoUser()
        .then((cu) => {
          update({ user: cu });
          setBearerTokenInCrafterClient(session.idToken.jwtToken);
        })
        .catch((e) => {
          console.error("Failed to locate user: " + e);
        });
    }
  }, [user]);
  return user ? children : null;
}

const windowurl = window.location.href;
const arr = windowurl.split("/");
const base = arr[0] + "//" + arr[2];
const callbackUrl = () => {
  return base + process.env.REACT_APP_COGNITO_CALLBACK_PATH;
};
const signoutUrl = () => {
  return base + process.env.REACT_APP_COGNITO_SIGNOUT_PATH;
};

const createCognitoAuth = () => {
  const appWebDomain = process.env.REACT_APP_COGNITO_URL.replace(
    "https://",
    ""
  ).replace("http://", "");
  const auth = new CognitoAuth({
    UserPoolId: process.env.REACT_APP_COGNITO_USER_POOL,
    ClientId: process.env.REACT_APP_COGNITO_APP_CLIENT,
    AppWebDomain: appWebDomain,
    TokenScopesArray: process.env.REACT_APP_COGNITO_SCOPES.split("+"),
    RedirectUriSignIn: callbackUrl(),
    RedirectUriSignOut: signoutUrl(),
  });
  return auth;
};

const createCognitoUserPool = () =>
  new CognitoUserPool({
    UserPoolId: process.env.REACT_APP_COGNITO_USER_POOL,
    ClientId: process.env.REACT_APP_COGNITO_APP_CLIENT,
  });

const createCognitoUser = () => {
  const pool = createCognitoUserPool();
  return pool.getCurrentUser();
};

export const getCognitoSignInUri = () => {
  return `${process.env.REACT_APP_COGNITO_URL}/login?scopes=${
    process.env.REACT_APP_COGNITO_SCOPES
  }&response_type=code&client_id=${
    process.env.REACT_APP_COGNITO_APP_CLIENT
  }&redirect_uri=${callbackUrl()}`;
};

export const getCognitoSignUpUri = () => {
  return `${process.env.REACT_APP_COGNITO_URL}/signup?scopes=${
    process.env.REACT_APP_COGNITO_SCOPES
  }&response_type=code&client_id=${
    process.env.REACT_APP_COGNITO_APP_CLIENT
  }&redirect_uri=${callbackUrl()}`;
};

export const getCognitoSignOutUri = () => {
  return `${process.env.REACT_APP_COGNITO_URL}/logout?client_id=${
    process.env.REACT_APP_COGNITO_APP_CLIENT
  }&logout_uri=${signoutUrl()}`;
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

const getCognitoUser = () => {
  return new Promise((resolve, reject) => {
    const cognitoUser = createCognitoUser();
    cognitoUser.getSession((error, session) => {
      if (error || !session) {
        reject(new Error("Failure getting Cognito session: " + error));
        return null;
      }

      // console.debug("Retrieved user session:", session);
      resolve(asCognitoUser(session));
    });
  });
};

const asCognitoUser = (session) => {
  const poolUrl = `${process.env.REACT_APP_COGNITO_URL}/${process.env.REACT_APP_COGNITO_USER_POOL}`;
  const credentials = new CognitoIdentityCredentials({
    Logins: {
      [poolUrl]: session.idToken.jwtToken,
    },
  });

  const cu = new CognitoUser();
  cu.id = session.idToken.payload["cognito:username"];
  cu.email = session.idToken.payload.email;
  cu.firstname = session.idToken.payload["given_name"];
  cu.lastname = session.idToken.payload["family_name"];
  cu.credentials = credentials;
  return cu;
};

export class CognitoUser {
  id = null;
  firstname = null;
  lastname = null;
  email = null;
  credentials = null;
}
