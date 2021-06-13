import React from 'react'
import {useAuth} from '../context/AuthContext'
import logo from '../logo.png'
import { Link, useHistory } from 'react-router-dom';

export default function Nav() {
    const history = useHistory()
    const {currentUser, logout} = useAuth()
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-ligh d-flex align-items-center justify-content-between p-2">
            <div className="d-flex align-items-center gap-2">
                <Link to="/">
                    <img 
                        src={logo}
                        alt="avatar"  style={{width: '60px', objectFit: 'fill'}} />
                </Link>
                <h3 className="nav-title text-center">Arenal Springs Resort & Spa</h3>
            </div>
            <div>
                {currentUser !== null ? 
                    <p onClick={() => logout(history)} className="fs-3" style={{cursor: 'pointer'}}>
                        <i className="fa fa-sign-out-alt"></i>
                    </p>
                    : null
                }
            </div>

        </nav>
    )
}
