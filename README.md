# @kingsway/craftercms-react

Convenient React utilities for working with Crafter CMS

This package contains convenience utilities
for working with Crafter CMS, over and above
the SDK provided by Crafter.

This is a very new package. More items will be
added over time.

## Installation

### ES6 via npm

```sh
npm install @kingsway/craftercms-react
```

### ES6 via yarn

```sh
yarn add @kingsway/craftercms-react
```

## Usage

### Component: Spa

Initialize the `crafterConf` object in a single page application.

This object will look in the document for an element named `root`. Within that element, it will look in its dataset for an attribute entitled `b`, which corresponds to the Crafter CMS URL Base. (Typical values could be `http://localhost:8080`, or `https://example.com`). If it does not locate a value in that setting, or, if that setting is an un-substituted freemarker tag (i.e. starting with `'${'` and ending with `'}'`), then it is assumed that the app is not running within the Crafter CMS freemarker context and instead the urlbase is sought in an app environment variable called `REACT_APP_STUDIO_BASE_URL`. Secondly, the app will seek a dataset param called `s` in the `root` element, and if not found (or found to be an un-substituted freemarker string), then the environment variable `REACT_APP_STUDIO_SITE_NAME` is checked. This value corresponds to the Crafter CMS site name.

Once these parameters are loaded, the `crafterConf` object is configured with these values.

The process of checking first the root element dataset and then falling back to environment variables allows for the SPA to be built and deployed inside Crafter's freemarker engine runtime (using the dataset values) and also running locally in node on a developer's machine (using the environment variables), with minimal configuration.

Site is required.

These values are loaded before the app is rendered. As such, this component will not render children if configuration has failed, and instead will render a configuration error message. If properly configured, the component's children are rendered.

Typically a Crafter CMS freemarker template for a SPA would include the `index.html` file of a react SPA. It might look like this:

```html
...
<body>
  <div
    id="root"
    data-b="${request.crafterSpaBaseUrl}"
    data-s="${siteContext.siteName}"
  ></div>
  ...
</body>
```

where the `crafterSpaBaseUrl` is set in a site-specific groovy filter, and `siteName` is set automatically by Crafter CMS.

Typical usage of the Spa tag itself looks like this:

```javascript
import React from "react";
import ReactDOM from "react-dom";
import { Spa } from "@kingsway/craftercms-react";
import App from "./common/App";

ReactDOM.render(
  <React.StrictMode>
    <Spa>
      <App />
    </Spa>
  </React.StrictMode>,
  document.getElementById("root")
);
```

where `<App>` is the root component of your application.

### Component: IceSupport

This component initializes Crafter CMS's in-context editing tools and provides convenient hooks that facilitate component development.

The component automatically determines if the user is logged in, and if the user is running on the Crafter CMS authoring environment. If so, it exposes the hook `useIceAllowed` which specifies whether or not in-context editing is available.

Additional hooks will be added in the future.

Typical setup:

```javascript
import React from "react";
import ReactDOM from "react-dom";
import App from "./common/App";
import { Spa, IceSupport } from "@kingsway/craftercms-react";

ReactDOM.render(
  <React.StrictMode>
    <Spa>
      <IceSupport>
        <App />
      </IceSupport>
    </Spa>
  </React.StrictMode>,
  document.getElementById("root")
);
```

Typical usage:

```javascript
const useIce = useIceAllowed();
const navurl = window.location.pathname;
useEffect(() => {
  if (useIce) {
    reportNavigation(navurl);
  }
}, [navurl, useIce]);
```

This must be used inside the `<Spa>` context.

### Component: GlobalContextProvider

A convenient context provider that exposes a flexible context in a single object, reducing the amount of boilerplate code required to store simple data in the global context of an app.

Setup:

```javascript
import React from "react";
import { GlobalContextProvider } from "@kingsway/craftercms-react";
import { BrowserRouter } from "react-router-dom";
import AppSwitch from "./AppSwitch";

export default function App() {
  return (
    <GlobalContextProvider>
      <BrowserRouter>
        <AppSwitch />
      </BrowserRouter>
    </GlobalContextProvider>
  );
}
```

Note that this component can stand alone and does not need to be defined inside the `<Spa>` context.

Accessing values:

```javascript
const [{ user }] = useGlobalContext();

if (user) {
  console.log("User is " + user);
} else {
  console.log("User not present in context");
}
```

Multiple values can be accessed as well:

```javascript
const [{ user, debug, nav }] = useGlobalContext();
```

Setting values:

```javascript
const [{ user, debug, nav }, update] = useGlobalContext();

let myNavObj = {}
...
update({
  debug: false,
  nav: myNavObj
});
```

### AWS Cognito Login Configuration

This feature exposes several components: `CognitoLoginCallback`, `CognitoLogoutCallback`, and `CognitoUserRequired`. In addition, it exposes three convenience functions: `getCognitoSignInUri`, `getCognitoSignUpUri`, and `getCognitoSignOutUri`.

These components simplify the work required to work with Cognito inside a react app running on Crafter CMS, by encapsulating boilerplate Cognito SDK code into convenient react components.

Note, that this component _MUST_ be used within the `<Spa>` and `<GlobalContextProvider>` contexts.

In addition to existing within the above contexts, this component also needs to be explicitly configured once, before any of its functionality can be used. (This may change in future releases).

Setup:

```javascript
import React from "react";
import { Spa, GlobalContextProvider } from "@kingsway/craftercms-react";
import MyGreatAppUsingCognito from "./MyGreatAppUsingCognito";

export default function App() {
  return (
    <Spa>
      <GlobalContextProvider>
        <MyGreatAppUsingCognito />
      </GlobalContextProvider>
    </Spa>
  );
}
```

Configuration:

```javascript
import { cognitoConfig } from "@kingsway/craftercms-react"
...
   cognitoConfig.configure(json.cognitoConfig)
...
```

such that the cognitoConfig object contains the following values:

```javascript
  {
    'url': 'the Cognito domain as configured in the user pool (without a path or trailing slash)',
    'userPoolId': 'the Cognito user pool id',
    'appClientId': 'the Cognito app client id',
    'scopes': 'scopes to access, separated by a + sign, for example email+openid+profile',
    'callbackPath': 'the callback path, used after Cognito login for validation, as configured in the app client',
    'signoutPath': 'the signout path, used after Cognito signout, so that app signout can be completed by the app itself.'
  }
```

### Component: CognitoLoginCallback

Include this component in the react route corresponding to the `callbackPath` specified above. The component will validate the `code` url parameter that Cognito sends when redirecting back to the app, and then authenticate the user with Cognito.

Upon successful login, the contents of the Cognito id token are set into an object called `user` inside the global context. The app can then rely on the `user` object when necessary.

_Note_, The `user` object also contains a `credentials` object, which holds the idToken. This can be passed as a bearer token when making back-end ID calls.

In addition, a bearer token is set inside the `crafterConf` object so that privileged SPA calls can be made (requires version 1.2.5 or later of `@craftercms/classes`.

After successful login, the passed-in `onSuccessInclude` component is rendered.

If login fails, the passed-in `onFailureInclude` component is rendered, and the `user` object is not added to the global context.

While validation is occuring, the `onLoadInclude` component is rendered.

Example usage:

```javascript
<Route exact path={"/callback"}>
  <LoginCallback />
</Route>
```

such that `LoginCallback` looks like this:

```javascript
import React from "react";
import { CognitoLoginCallback } from "@kingsway/craftercms-react";
import Layout from "./Layout";
import Home from "../components/homepage/Home";
import SplashLayout from "./SplashLayout";
import Splash from "../components/splashpage/Splash";
import { CircularProgress } from "@material-ui/core";

export default function LoginCallback() {
  return (
    <CognitoLoginCallback
      onSuccessInclude={
        <Layout>
          <Home />
        </Layout>
      }
      onFailureInclude={
        <SplashLayout>
          <Splash />
        </SplashLayout>
      }
      onLoadInclude={<CircularProgress />}
    />
  );
}
```

### Component: CognitoLogoutCallback

This component logs the user out of Cognito (clearing the bearer token from the `crafterConf`), and logs the user out of the Spa (clearing the `user` object from the global context).

As above, it includes success, failure, and loading include options.

Example usage:

```javascript
<Route exact path={"/signout"}>
  <LogoutCallback>
    <Redirect to={"/"} />
  </LogoutCallback>
</Route>
```

```javascript
import React from "react";
import { CognitoLogoutCallback } from "@kingsway/craftercms-react";
import { CircularProgress } from "@material-ui/core";

export default function LogoutCallback(props) {
  const { children } = props;
  return (
    <CognitoLogoutCallback
      onSuccessInclude={children}
      onFailureInclude={children}
      onLoadInclude={<CircularProgress />}
    />
  );
}
```

### Component: CognitoUserRequired

This component will return the `children` specified, or else a fallback (or nothing if no fallback is provided), depending on whether the user is logged in or not.

The component first checks the global context for the `user` object, and if found, simply returns the children. However if no `user` is found in global context, it will attempt to locate and validate a logged-in Cognito user by checking Cognito cookies. If the user is logged in to Cognito, they will be logged back into the app and the `children` will be returned. If the user is not logged in to Cognito, then the fallback (or nothing if no fallback is specified) is returned.

This allows parts of the app to be hidden unless the user is logged in, and at the same time, allows the app to be reloaded in a browser, while still preserving the path and login state with Cognito.

_IMPORTANT NOTE:_ The downside of this approach, is that upon logout, the app MUST log users out by calling the signout url provided by `getCognitoSignOutUri` provided here (or else they won't be signed out of Cognito and can then in turn be logged in again). This may or may not be consistent with your app logout requirements, so be sure you are using this appropriately. If automatic re-login is not desired, simply check for the presence of the `user` object in the global context in your app instead of calling this component.

Typical usage:

```javascript
import React, {useEffect} from 'react';
import {Redirect, Route, useLocation} from "react-router-dom";
import {reportNavigation} from '@craftercms/ice';
import {Switch} from "react-router";
import {useIceAllowed,CognitoUserRequired } from "@kingsway/craftercms-react";
import LogoutCallback from "./LogoutCallback";
import LoginCallback from "./LoginCallback";
...
export default function AppSwitch() {
  const trackForIce = useIceAllowed();
  const navurl = useLocation().pathname;
  useEffect(() => {
    if (trackForIce) {
      reportNavigation(navurl);
    }
  }, [navurl, trackForIce]);

  return (
    <Switch>
      ... public routes ...
      <Route exact path={"/"}>
        <SplashLayout><Splash/></SplashLayout>
      </Route>
      <Route exact path={"/callback"}>
        <LoginCallback />
      </Route>
      <Route exact path={"/signout"}>
        <LogoutCallback>
          <Redirect to={"/"} />
        </LogoutCallback>
      </Route>

      <CognitoUserRequired fallback={<SplashLayout><Splash/></SplashLayout>}>
        ... routes requiring authentication ...
      </CognitoUserRequired>
    </Switch>
  )
}

```

### getCognitoSignInUri

This function returns the Cognito sign-in URI, configured as appropriate given the configuration of this component. The URL is as defined by AWS Cognito, and is the `/login` endpoint on your Cognito domain, plus parameters corresponding to `scope`, `response_type=code`, the app `client_id`, and the callback `redirect_uri`.

Typical usage:

```javascript
...
import {getCognitoSignInUri} from "@kingsway/craftercms-react"

...

  <Button onClick={(e) => {
    window.location = getCognitoSignInUri()
  }}>Log In</Button>

```

### getCognitoSignUpUri

This function returns the Cognito create account URI, configured as appropriate given the configuration of this component. The URL is as defined by AWS Cognito, and is the `/signup` endpoint on your Cognito domain, plus parameters corresponding to `scope`, `response_type=code`, the app `client_id`, and the callback `redirect_uri`.

Typical usage:

```javascript
...
import {getCognitoSignUpUri} from "@kingsway/craftercms-react"

...

  <Button onClick={(e) => {
    window.location = getCognitoSignUpUri()
  }}>Create Account</Button>

```

### getCognitoSignOutUri

This function returns the Cognito signout URI, configured as appropriate given the configuration of this component. The URL is as defined by AWS Cognito, and is the `/logout` endpoint on your Cognito domain, plus parameters corresponding to the app `client_id` and the logout callback `logout_uri`.

Typical usage:

```javascript
...
import {getCognitoSignUpUri} from "@kingsway/craftercms-react"

...

  <Button onClick={(e) => {
    window.location = getCognitoSignUpUri()
  }}>Create Account</Button>

```

## Feedback Welcome

This component is currently in active development and feedback is welcome in the git repository.

## Development Support

To contribute to this package, upate this project's `package.json` file to build to your favourite working directory, and then run `yarn dev`. Then, in your project that relies on the package, remove the version-specific dependency in your project's `package.json` and replace it with a link to the package instead, like this:

```javascript
      "@kingsway/craftercms-react": "link:/Users/tfield/Projects/npmjs/kingsway/dev-build",
```
