import React, { useState} from 'react'
import Nav from '../../components/Nav'
import { useHistory } from 'react-router-dom'
import Form from '../../components/Reservation/Form';
import { createReservation } from '../../services/restaurantService'
import CustomDatePicker from '../../components/CustomDatePicker';
import useDate from '../../hooks/useDate';

export default function Add() {
    // eslint-disable-next-line
    const [times, setTimes] = useState([])
    const {selectedDate, setSelectedDate} = useDate()
    let history = useHistory()

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
            <div className="container col-md-3 col-6 mb-3">
                <CustomDatePicker
                    selectedDate={selectedDate}
                    handleDateChange={handleDateChange}
                />
            </div>
            <Form 
                createReservation={createReservation}
                selectedDate={selectedDate}
                times={times}
            />
        </div>
    )
}
