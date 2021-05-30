import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router';
import { db } from '../../services/firebase';
import {updatePaxLimit} from '../../services/restaurantService';
import Single from './Single';
import Swal from 'sweetalert2'

export default function List({time, selectedDate}) {
    const [reservations, setReservations] = useState([])
    const [reservationsCounter, setReservationsCounter] = useState(0)
    const [reservationsLimit, setReservationsLimit] = useState(0)
    const [reservationsPending, setReservationsPending] = useState(0)
    const [reservationsEating, setReservationsEating] = useState(0)
    const [reservationsDone, setReservationsDone] = useState(0)
    const [reservationsGone, setReservationsGone] = useState(0)
    const location = useLocation()
    const locationName = location.pathname.split('/')[1]

    const deleteReservation = (id, pax) => {
      let newLimit = reservationsLimit - pax;
      if(reservationsLimit > 40 && newLimit > 40){
        updatePaxLimit({
          date: selectedDate,
          typeOfMeal: locationName, hour: time, 
          newLimit
        })
      }else if(newLimit < 40){
        updatePaxLimit({
          date: selectedDate,
          typeOfMeal: locationName, hour: time, 
          newLimit: 40
        })
      }
      
      db.collection(selectedDate)
      .doc(locationName)
      .collection(time).doc(id).delete()

      substractPaxDeletedFromCounter(pax)
    }

    const substractPaxDeletedFromCounter = (pax)=>{
      db
      .collection(selectedDate)
      .doc(locationName)
      .collection(time)
      .doc('reservation-counter')
      .update({data: Number(reservationsCounter) - Number(pax)})
    }

    const getReservations = async () => {
        db.collection(selectedDate)
          .doc(locationName)
          .collection(time)
          .onSnapshot((querySnapshot) => {
            const docs = [];
            querySnapshot.forEach((doc) => {
              if(doc.id !== 'reservation-counter' && doc.id !== 'limit'){
                docs.push({ ...doc.data(), id: doc.id });
              }
            });
            // eslint-disable-next-line 
            let pending = docs.filter((doc) => doc.status === 'pendiente' || doc.status == undefined).length
            setReservationsPending(pending);
            let eating = docs.filter((doc) => doc.status === 'comiendo').length
            setReservationsEating(eating);
            let done = docs.filter((doc) => doc.status === 'ya llegó').length
            setReservationsDone(done);
            let gone = docs.filter((doc) => doc.status === 'no llegó').length
            setReservationsGone(gone);
            setReservations(docs)
          });
      }

    const getReservationsLimit = ()=>{
      db.collection(selectedDate)
      .doc(locationName)
      .collection(time)
      .doc('limit')
      .onSnapshot((querySnapshot) => {
        const limit = querySnapshot.data()
        limit ? setReservationsLimit(limit.data) : setReservationsLimit(40)
      })
    }
    const getReservationsCounter = ()=>{
      db.collection(selectedDate)
      .doc(locationName)
      .collection(time)
      .doc('reservation-counter')
      .onSnapshot((querySnapshot) => {
        const counter = querySnapshot.data()
        counter ? setReservationsCounter(counter.data) : setReservationsCounter(0)
      })
    }

    const confirmDeleteReservation = (id, pax) =>{
      Swal.fire({
        icon: 'warning',
        title: 'Eliminar Reserva',
        text: '¿Estas seguro de borrar esta reservación?',
        showDenyButton: true,
        confirmButtonText: 'Eliminar',
        denyButtonText: 'Cancelar'
      }).then(res =>{
        if(res.isConfirmed){
          deleteReservation(id, pax)
        }
      })
    }

    useEffect(()=>{
        getReservations()
        getReservationsCounter()
        getReservationsLimit()

        
        // eslint-disable-next-line
      },[selectedDate])
      
    return (
        <div className="m-1 d-flex flex-nowrap align-items-start" style={{maxWidth: '100%',overflowX: 'auto', paddingTop: '2rem'}}>
          <div  
            className={`card m-1 d-flex justify-content-center align-items-center p-2 shadow-sm bg-nero`}
            style={{minWidth: '250px', minHeight: '220px'}} >
              <div className="d-flex justify-content-between align-items-center w-100">
                  <p >reservas pendientes: </p>
                  <p className="badge bg-bianco fs-6">{reservationsPending}</p>
              </div>
              <div className="d-flex justify-content-between align-items-center  w-100">
                <p >reservas comiendo: </p>
                <p className="badge bg-bianco fs-6">{reservationsEating}</p>
              </div>
              <div className="d-flex justify-content-between align-items-center  w-100">
                <p >reservas que ya llegaron: </p>
                <p className="badge bg-bianco fs-6">{reservationsDone}</p>
              </div>
              <div className="d-flex justify-content-between align-items-center  w-100">
                <p >reservas que no llegaron: </p>
                <p className="badge bg-bianco fs-6">{reservationsGone}</p>
              </div>
          </div>
            {reservations.map((reservation, index) => 
                <Single 
                  key={index} hour={time} 
                  reservation={reservation} deleteReservation={confirmDeleteReservation} />    
            )}
            <div  
              className="d-flex  justify-content-between align-items-center gap-2 rounded" 
              style={{position: 'absolute', top: '-4px', left: '0'}} >
              <button className="btn bg-nero fw-bold" style={{padding: '5px', margin: 0}}>
                Limite <span className="badge bg-bianco" style={{fontSize: '.9rem'}}>
                  {reservationsLimit}
                </span>
              </button>
              <button className="btn bg-second fw-bold" style={{padding: '5px', margin: 0}}>
                Reservados <span className="badge bg-bianco" style={{fontSize: '.9rem'}}>
                  { reservationsCounter }
                </span>
              </button>
              <button className="btn bg-main fw-bold" style={{padding: '5px', margin: 0}}>
                Disponible <span className="badge bg-bianco" style={{fontSize: '.9rem'}}>
                  { (reservationsLimit - reservationsCounter) < 0 ? 0 :  reservationsLimit - reservationsCounter }
                </span>
              </button>
            </div>
        </div>
    )
}
