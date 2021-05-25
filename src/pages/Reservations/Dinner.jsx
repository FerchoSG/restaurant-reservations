import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Nav from '../../components/Nav'
import List from '../../components/Reservation/List';
import useDate from '../../hooks/useDate';
import { db } from './../../services/firebase';
import CustomDatePicker from '../../components/CustomDatePicker';

export default function Dinner() {
    const [times, setTimes] = useState([])
    const {selectedDate, setSelectedDate} = useDate()
    const location = useLocation()


    useEffect(()=>{
        let isMounted = true;
        const typeOfMeal = location.pathname.split('/')[1]
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
            <CustomDatePicker
                selectedDate={selectedDate}
                handleDateChange={handleDateChange}
            />
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
