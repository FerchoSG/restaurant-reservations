import React from 'react'
import { NavLink} from 'react-router-dom'

export default function Sidebar({collapsed}) {

    return (
        <aside className={`bg-main shadow custom-nav p-3  ${collapsed ? 'collapsed': null}`}>
            <a href="/" className="d-flex align-items-center link-dark text-decoration-none">
                <span className="fs-4 color-bianco text-center">Admin</span>
            </a>
            <hr/>
            <ul className="nav nav-pills flex-column align-items-center justify-content-center mb-auto ">
                <li className={` nav-btn ${collapsed && 'collapsed'}`}>
                    <NavLink to="/admin" activeClassName="bg-neutral color-bianco" className="btn nav-link color-nero" aria-current="page">
                    {collapsed ? <i className="fa fa-home"></i> : 'Inicio'}
                    </NavLink>
                </li>
                <li className={` nav-btn ${collapsed && 'collapsed'}`}>
                    <NavLink to="/restaurants" activeClassName="bg-neutral color-bianco" className="btn nav-link link-dark color-nero">
                    {collapsed ? <i className="fa fa-utensils"></i> : 'Restaurantes'}
                    </NavLink>
                </li>
                <li className={`nav-btn ${collapsed && 'collapsed'}`}>
                    <NavLink to="/reservations" activeClassName="bg-neutral color-bianco" className="btn nav-link link-dark color-nero">
                    {collapsed ? <i className="fa fa-archive"></i> : 'Reservas'}
                    </NavLink>
                </li>
                <li className={`nav-btn ${collapsed && 'collapsed'}`}>
                    <NavLink to="/reservations-deleted" activeClassName="bg-neutral color-bianco" className="btn nav-link link-dark color-nero">
                    {collapsed ? <i className="fa fa-trash"></i> : 'Reservas Eliminadas'}
                    </NavLink>
                </li>
                <li className={`nav-btn ${collapsed && 'collapsed'}`}>
                    <NavLink to="/users" activeClassName="bg-neutral color-bianco" className="btn nav-link link-dark color-nero">
                    {collapsed ? <i className="fa fa-users"></i> : 'Usuarios'}
                    </NavLink>
                </li>
            </ul>
            <hr/>
            <div>
                <button className="btn bg-nero">
                    <i className="fs-5 fa fa-sign-out-alt"></i>
                </button>
            </div>

        </aside>
    )
}
