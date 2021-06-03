import React, {createContext, useContext, useEffect, useState} from 'react';
import {addAuthoringSupport, fetchIsAuthoring} from "@craftercms/ice";
import {useDropZone, useICE} from "@craftercms/ice/react";

const IceIsAuthoringContext = createContext();
const IceIsLoggedInContext = createContext();

export function IceSupport(props) {
  const [isAuthoring, setIsAuthoring] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthoring === null) {
      // console.log("Authoring environment status is not known")
      if (!loading) {
        // console.log("Looking up authoring status.")
        setLoading(true);
        fetchIsAuthoring().then((isAuthSvrResp) => {
          if (isAuthSvrResp) {
            // console.log("Authoring environment detected.");
            // we are in authoring. Go figure out if we're logged in or not.
            fetch('/studio/api/1/services/api/1/security/validate-session.json')
                .then(res => res.json())
                .then(
                    (result) => {
                      if (result.active) {
                        // console.log("User "+result.user.username+" is logged in.  Loading authoring tools.");
                        setIsLoggedIn(true)
                        addAuthoringSupport()
                            .then(() => {
                              console.debug('Authoring tools have loaded and are ready to use by user {' + result.user.username + '}.');
                              setIsAuthoring(isAuthSvrResp);
                              setLoading(false);
                            })
                            .catch((err) => {
                              console.error("Failure adding authoring support: " + JSON.stringify(err))
                            });
                      } else {
                        // console.log("User is not logged in");
                        setIsLoggedIn(false)
                      }
                    },
                    (error) => {
                      console.error("Failure checking for active user: " + JSON.stringify(error));
                    }
                )
          } else {
            // console.log("Authoring environment not detected.");
            setIsAuthoring(isAuthSvrResp);
            setLoading(false);
          }
        });
      }
    }
  }, [isAuthoring, loading]);

  return <IceIsLoggedInContext.Provider value={isLoggedIn}>
    <IceIsAuthoringContext.Provider value={isAuthoring}>
      {props.children}
    </IceIsAuthoringContext.Provider>
  </IceIsLoggedInContext.Provider>
}

export function usePencil(props) {
  const {model, parentModelId} = props;
  const isAuthoring = useContext(IceIsAuthoringContext);
  return useICE({model, parentModelId, isAuthoring}).props;
}

export function useDnD(props) {
  const {model, fieldId} = props;
  const isAuthoring = useContext(IceIsAuthoringContext);
  // Note on version 1.2.3 of SDK, zoneName will be deprecated, in favour of fieldId
  return useDropZone({model, zoneName: fieldId, isAuthoring}).props;
}

export function useIceAllowed() {
  const isAuthoring = useContext(IceIsAuthoringContext);
  const isLoggedIn = useContext(IceIsLoggedInContext);
  return isAuthoring && isLoggedIn;
}
