import React, {useEffect, useState} from 'react'
import Nav from '../../components/Nav'
import { Link, useParams } from 'react-router-dom'
import { db } from '../../services/firebase';
import Form from '../../components/Reservation/Form';
import { createReservation } from '../../services/restaurantService'
import CustomDatePicker from '../../components/CustomDatePicker';
import useDate from '../../hooks/useDate';

export default function Add() {
    const [times, setTimes] = useState([])
    const { time } = useParams()
    const {selectedDate, setSelectedDate} = useDate()

    useEffect(()=>{
        db.collection('schedules').doc(time).onSnapshot(querySnapshot=>{
            const { data } = querySnapshot.data()
            setTimes(data)
        })
    },[time])

    const handleDateChange = (date) => {
        setSelectedDate(date);
    };


    return (
        <div>
            <Nav/>
            <section className="d-flex justify-content-between align-items-center my-4 px-5">
                <h3 className="display-5">Agrega una reservacion</h3>
                <Link className="btn btn-dark" to={`/${time}`} >Atras</Link>
            </section>
            <CustomDatePicker
                selectedDate={selectedDate}
                handleDateChange={handleDateChange}
            />
            <Form 
                createReservation={createReservation}
                selectedDate={selectedDate}
                times={times}
                time={time}
            />
        </div>
    )
}
