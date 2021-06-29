import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router';
import { db } from '../../services/firebase';
import {updatePaxLimit, getDefaultPaxLImit} from '../../services/restaurantService';
import Single from './Single';
import Swal from 'sweetalert2'
import BounceSpinner from '../BounceSpinner';
import EN from '../../services/en.json'

export default function List({time, selectedDate}) {
    const [reservations, setReservations] = useState([])
    const [reservationsCounter, setReservationsCounter] = useState(0)
    const [reservationsLimit, setReservationsLimit] = useState(0)
    const [loading, setLoading] = useState(false)
    const params = useParams()
    const mealtime = EN[params.mealtime]
    const restaurant = params.restaurant

    const deleteReservation = async (id, pax) => {
      const defaultPaxLimit = await getDefaultPaxLImit({restaurant, mealtime})
      let newLimit = reservationsLimit - pax;
      if(reservationsLimit > defaultPaxLimit && newLimit > defaultPaxLimit){
        updatePaxLimit({
          date: selectedDate,
          mealtime, hour: time, 
          newLimit, restaurant
        })
      }else if(newLimit < defaultPaxLimit){
        updatePaxLimit({
          date: selectedDate,
          mealtime, hour: time, 
          newLimit: defaultPaxLimit,
          restaurant
        })
      }
      
      db.collection(selectedDate)
      .doc(restaurant)
      .collection(mealtime)
      .doc(time)
      .collection('reservations').doc(id).delete()

      substractPaxDeletedFromCounter(pax)
    }

    const substractPaxDeletedFromCounter = (pax)=>{
      db
      .collection(selectedDate)
      .doc(restaurant)
      .collection(mealtime)
      .doc(time)
      .collection('counter')
      .doc('reservations')
      .update({data: Number(reservationsCounter) - Number(pax)})
    }

    const getReservations = async () => {
      setLoading(true)
        db.collection(selectedDate)
          .doc(restaurant)
          .collection(mealtime)
          .doc(String(time))
          .collection('reservations')
          .onSnapshot((querySnapshot) => {
            const docs = [];
            querySnapshot.forEach((doc) => {
                docs.push({ ...doc.data(), id: doc.id });
            });
            // eslint-disable-next-line 
            setReservations(docs)
            setLoading(false)
          });
      }

    const getReservationsLimit = async ()=>{
      const defaultPaxLimit = await getDefaultPaxLImit({restaurant, mealtime})
      db.collection(selectedDate)
      .doc(restaurant)
      .collection(mealtime)
      .doc('limit')
      .onSnapshot((querySnapshot) => {
        const limit = querySnapshot.data()
        limit ? setReservationsLimit(limit.data) : setReservationsLimit(defaultPaxLimit)
      })
    }
    const getReservationsCounter = ()=>{
      db.collection(selectedDate)
      .doc(restaurant)
      .collection(mealtime)
      .doc(String(time))
      .collection('counter')
      .doc('reservations')
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
        if(mealtime !== 'lunch')
          getReservationsLimit()

        
        // eslint-disable-next-line
      },[selectedDate])

    if(loading) return <BounceSpinner />
      
    return (
        <div className="m-1 d-flex flex-nowrap align-items-start" style={{maxWidth: '100%',overflowX: 'auto', paddingTop: '2rem'}}>
            {reservations.map((reservation, index) => 
                <Single 
                  key={index} hour={time} 
                  reservation={reservation} deleteReservation={confirmDeleteReservation} />    
            )}
            <div  
              className="d-flex  justify-content-between align-items-center gap-2 rounded" 
              style={{position: 'absolute', top: '-4px', left: '0'}} >
                { mealtime !== 'lunch' ?
                  <button className="btn bg-nero fw-bold" style={{padding: '5px', margin: 0}}>
                    Limite <span className="badge bg-bianco" style={{fontSize: '.9rem'}}>
                      {reservationsLimit}
                    </span>
                  </button> : null
                }
              <button className="btn bg-second fw-bold" style={{padding: '5px', margin: 0}}>
                Reservados <span className="badge bg-bianco" style={{fontSize: '.9rem'}}>
                  { reservationsCounter }
                </span>
              </button>
              { mealtime !== 'lunch' ?
                <button className="btn bg-main fw-bold" style={{padding: '5px', margin: 0}}>
                  Disponible <span className="badge bg-bianco" style={{fontSize: '.9rem'}}>
                    { (reservationsLimit - reservationsCounter) < 0 ? 0 :  reservationsLimit - reservationsCounter }
                  </span>
                </button> : null
              }
            </div>
        </div>
    )
}
