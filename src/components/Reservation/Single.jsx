import React from 'react'
import { Link, useLocation, useHistory } from 'react-router-dom'

const colors = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'dark']

export default function Single({reservation, deleteReservation, hour}) {

    const bgColor = colors[Math.floor(Math.random() * 8)]

    const location = useLocation()
    const history = useHistory()

    const saveInLocalStorage = () => {
        localStorage.setItem(reservation.id, JSON.stringify(reservation))
        localStorage.setItem('backTo', location.pathname)
        localStorage.setItem('hour', hour)
    }

    const navigateToDeleteView = () => {
        saveInLocalStorage()
        history.push(`/delete/${reservation.id}`)
    }

    return (
        <div className={`card m-1 d-flex flex-column align-items-start p-2 shadow-sm border border-${bgColor}`} style={{minWidth: '200px'}}>
            <Link className="text-dark"
                to={`/details/${reservation.id}`} onClick={saveInLocalStorage} 
                >
                <p>Room: {reservation.room} </p>
                <p>Pax: {reservation.pax} </p>
                <p>Reservado por: {reservation.bookedby} </p>
                <p>Detalles: {reservation.details} </p>

            </Link>
            <button 
                onClick={navigateToDeleteView}
                className="btn btn-sm btn-danger " style={{position: 'absolute', top: '-5px', right: '-5px', zIndex: 2}}>
                <i className="fas fa-times"></i>
            </button>

        </div>
    )
}
