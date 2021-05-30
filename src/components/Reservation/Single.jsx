import React, {useState} from 'react'
import { Link, useLocation, useHistory } from 'react-router-dom'
import { updateReservationStatus} from '../../services/restaurantService'

const statusColors = {
    "pendiente": "second",
    "comiendo": "light-g",
    "ya llegó": "nero",
    "no llegó": "warn",
}

export default function Single({reservation, deleteReservation, hour}) {


    const location = useLocation()
    const history = useHistory()
    const [status, setStatus] = useState(reservation.status || 'pendiente')

    const saveInLocalStorage = () => {
        localStorage.setItem(reservation.id, JSON.stringify(reservation))
        localStorage.setItem('backTo', location.pathname)
        localStorage.setItem('hour', hour)
    }

    const navigateToDeleteView = () => {
        saveInLocalStorage()
        history.push(`/delete/${reservation.id}`)
    }

    const ChangeStatus = (evt) => {
        evt.preventDefault()
        let status = evt.target.dataset.status
        setStatus(status);
        console.log(status);

        reservation.status = status;
        let typeOfMeal = location.pathname.split('/')[1]
        let date = localStorage.getItem('selectedDate')

        updateReservationStatus({date, data: reservation, hour, typeOfMeal})
    }



    return (
        <div 
            className={`card m-1 d-flex flex-column align-items-start p-2 shadow-sm border-${statusColors[status]} border-4`} 
            style={{minWidth: '250px', minHeight: '200px'}}>
            <Link className="text-dark" to={`/details/${reservation.id}`} onClick={saveInLocalStorage}>
                <p>Room: {reservation.room} </p>
                <p>Pax: {reservation.pax} </p>
                <p>Reservado por: {reservation.bookedby} </p>
                <p>Detalles: {reservation.details} </p>
                <p>Estado: {status} </p>

            </Link>
            <button 
                onClick={navigateToDeleteView}
                className="btn btn-sm btn-danger " style={{position: 'absolute', top: '-5px', right: '-5px', zIndex: 2}}>
                <i className="fas fa-times"></i>
            </button>
            <div className="btn-group  dropup" style={{position: 'absolute', bottom: '-5px', right: '-5px', zIndex: 2}}>
            <button 
                className="btn btn-sm bg-nero dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"
                >
                <i className="fas fa-cog"></i>
            </button>
            <ul className="dropdown-menu shadow status-menu border">
                <div className="m-1" style={{minHeight: '8rem'}}>
                <h5 className="text-center">Estado</h5>
                <li >
                    <button 
                        onClick={ChangeStatus}
                        data-status="pendiente"
                        className="dropdown-item btn mb-2 bg-second">Pendiente</button>
                </li>
                <li>
                    <button 
                        onClick={ChangeStatus}
                        data-status="comiendo"
                        className="dropdown-item btn mb-2 bg-light-g" >Comiendo</button>
                </li>
                <li>
                    <button 
                        onClick={ChangeStatus}
                        data-status="ya llegó"
                        className="dropdown-item btn mb-2 bg-nero" >Ya llegó</button>
                </li>
                <li>
                    <button 
                        onClick={ChangeStatus}
                        data-status="no llegó"
                        className="dropdown-item btn mb-2 bg-warn" >No llegó</button>
                </li>
                </div>
            </ul>

            </div>

        </div>
    )
}
