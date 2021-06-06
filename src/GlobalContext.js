import React, {createContext, useContext, useMemo, useReducer} from 'react';

const GlobalContext = createContext(null);

export function useGlobalContext() {
    const context = useContext(GlobalContext);
    if (!context) {
        throw new Error(`useGlobalContext() must be used within GlobalContextProvider`);
    }
    return context;
}

// usage: const [{debug}, update] = useGlobalContext();
export function GlobalContextProvider(props) {

    const [state, setState] = useSpreadState({
        debug: process.env.REACT_APP_DEBUG === "true",
        user: null
    });

    const value = useMemo(() => [state, setState], [state, setState]);
    return <GlobalContext.Provider value={value} {...props} />;
}

function useSpreadState(initializerArg, initializer) {
    return useReducer(reducer, initializerArg, initializer);
}

function reducer(state, nextState) {
    return {...state, ...nextState};
}