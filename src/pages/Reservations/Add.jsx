import React, {useEffect, useState} from 'react'
import Nav from '../../components/Nav'
import { useHistory, useParams } from 'react-router-dom'
import { db } from '../../services/firebase';
import Form from '../../components/Reservation/Form';
import { createReservation } from '../../services/restaurantService'
import CustomDatePicker from '../../components/CustomDatePicker';
import useDate from '../../hooks/useDate';

export default function Add() {
    const [times, setTimes] = useState([])
    const { time } = useParams()
    const {selectedDate, setSelectedDate} = useDate()
    let history = useHistory()

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
                <button className="btn bg-nero" onClick={()=> history.goBack()} >Atras</button>
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
