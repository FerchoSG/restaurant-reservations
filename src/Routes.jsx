import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import Admin from './pages/Admin/index'
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
import Restaurants from './pages/Admin/Restaurants';
import Reservations from './pages/Admin/Reservations';
import DeletedReservations from './pages/Admin/DeletedReservations';
import Users from './pages/Admin/Users';
import Delete from './pages/Reservations/Delete'
import MealTime from './pages/Reservations/MealTime'

export default function Routes() {

    return (
        <Router>
                <Switch>
                    <Route path="/login" exact component={Login}/>
                    <Route path="/dinner" exact component={Dinner} />
                    <Route path="/breakfast" exact component={Breakfast} />
                    <Route path="/addReservation" exact component={Add} />
                    <Route path="/details/:id" exact component={Details} />
                    <Route path="/delete/:id" exact component={Delete} />
                    <Route path="/:restaurant/:mealtime" exact component={MealTime} />
                    <Route path="/admin" exact component={Admin} />
                    <Route path="/restaurants" exact component={Restaurants} />
                    <Route path="/reservations" exact component={Reservations} />
                    <Route path="/reservations-deleted" exact component={DeletedReservations} />
                    <Route path="/users" exact component={Users} />
                    <Route path="/" exact component={Home} />
                    <Route component={NotFound}/>
                </Switch>
        </Router>
    )
}
