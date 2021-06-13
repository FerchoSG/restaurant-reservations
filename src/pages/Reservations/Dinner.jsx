import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Nav from '../../components/Nav'
import List from '../../components/Reservation/List';
import useDate from '../../hooks/useDate';
import { db } from './../../services/firebase';
import CustomDatePicker from '../../components/CustomDatePicker';
import {checkIfCounterOrCreate} from '../../services/restaurantService';

export default function Dinner() {
    const [times, setTimes] = useState([])
    const {selectedDate, setSelectedDate} = useDate()
    const [paxArrived, setPaxArrived] = useState(0)
    const [pendingPax, setPendingPax] = useState(0)
    const location = useLocation()
    const typeOfMeal = location.pathname.split('/')[1]

    useEffect(()=>{
        let isMounted = true;
        if(isMounted){
            db.collection('schedules').doc(typeOfMeal).onSnapshot(querySnapshot=>{
              const { data } = querySnapshot.data()
              setTimes(data)
           })
        }

        return () => {isMounted = false}
        
    // eslint-disable-next-line
    },[])

    const handleDateChange = (date) => {
        setSelectedDate(date);
    };

    useEffect(()=>{
        localStorage.setItem('selectedDate',selectedDate)
        if(selectedDate){
            getArrivedCounter()
            getPendingPaxCounter()
         }
         // eslint-disable-next-line
    },[selectedDate])

    const getArrivedCounter = async () => {
        await checkIfCounterOrCreate({date: selectedDate, mealTime: typeOfMeal})
    
        db.collection(selectedDate)
        .doc(typeOfMeal)
        .collection('counter')
        .doc('paxArrived')
        .onSnapshot((querySnapshot =>{
            if(querySnapshot.exists){
                let paxArrived = querySnapshot.data()
                setPaxArrived(paxArrived.data)
            }
        }))
    }

    const getPendingPaxCounter = async () => {
        await checkIfCounterOrCreate({date: selectedDate, mealTime: typeOfMeal})
    
        db.collection(selectedDate)
        .doc(typeOfMeal)
        .collection('counter')
        .doc('paxPending')
        .onSnapshot((querySnapshot =>{
            if(querySnapshot.exists){
                let paxArrived = querySnapshot.data()
                setPendingPax(paxArrived.data)
            }
        }))
    }

    return (
        <div>
            <Nav/>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center p-4">
                <h3 className="display-5">Reservas para cena</h3>
                <div className="d-flex gap-4 align-items-center ">
                    <Link to='/addReservation/dinner' className="btn bg-light-g">Agregar Reservación</Link>
                    <Link to='/' className="btn bg-nero">Atras</Link>
                </div>
            </div>
            <div className="container col-md-3 col-6 mb-3">
            <CustomDatePicker
                selectedDate={selectedDate}
                handleDateChange={handleDateChange}
            />

            </div>

            <div 
                className="d-flex flex-column flex-md-row justify-content-center align-items-center gap-4 mb-3 b-ody">
                    <div className="btn btn-sm bg-nero p-3">
                        ya llegarón
                        <span className="badge bg-bianco mx-2" style={{fontSize: '1.1rem'}}>
                            {paxArrived}
                        </span>
                        pax
                    </div>
                    <div className="btn btn-sm bg-neutral p-3">
                        <span className="badge bg-bianco mx-2" style={{fontSize: '1.1rem'}}>
                            {pendingPax}
                        </span>
                        pax pendientes
                    </div>
            </div>
            {times.map((time, index) =>
                  <div key={index} className="d-flex align-items-center mb-3 p-2">
                    <p 
                        style={{transform: 'rotate(-90deg)', width: '3rem'}} 
                        className="m-0 text-center p-0 color-nero fw-bold fs-3">{time[0]}:{time[1]}{time[2]}pm</p>
                    <div
                      className="card d-flex flex-row align-items-start w-100 "
                      style={{ minHeight: "200px" }}
                    >
                    <List 
                        selectedDate={selectedDate}
                        time={time} />
                      
                    </div>
                </div>
                )}
        </div>
    )
}
