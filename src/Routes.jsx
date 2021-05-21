import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
// import PrivateRoute from './components/PrivateRoute'
// import PublicRoute from './components/PublicRoute'
// import {useAuth} from './context/AuthContext'
// import {AuthProvider} from './context/AuthContext'
import Home from './pages/Home'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import Add from './pages/Reservations/Add'
import Breakfast from './pages/Reservations/Breakfast'
import Details from './pages/Reservations/Details'
import Dinner from './pages/Reservations/Dinner'

export default function Routes() {

    return (
        <Router>
                <Switch>
                    <Route path="/login" exact component={Login}/>
                    <Route path="/" exact component={Home} />
                    <Route path="/dinner" exact component={Dinner} />
                    <Route path="/breakfast" exact component={Breakfast} />
                    <Route path="/addReservation/:time" exact component={Add} />
                    <Route path="/details/:id" exact component={Details} />
                    <Route component={NotFound}/>
                </Switch>
        </Router>
    )
}
