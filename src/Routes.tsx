import React, {useContext, createContext, useEffect, useState} from 'react'
import {Route, Switch, Redirect} from 'react-router-dom'
import {useLocation, useRouteMatch} from 'react-router-dom'
import SubscribeLATAM from './views/Subscribe'

function BaseRouter(){

    let {url, path} = useRouteMatch()
    let location : any = useLocation()
    let [userState, setUserState] = useState<any>()

    return(
        <>
        <Switch>
            <Route path="/" exact component={SubscribeLATAM}/>
        </Switch>
        </>
    )
}

export default BaseRouter