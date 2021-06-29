import React, { useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import Nav from '../../components/Nav'
import Form from '../../components/Reservation/Form'
import { db } from '../../services/firebase'

export default function Details() {
    const { id } = useParams()
    const reservation = JSON.parse(localStorage.getItem(id))
    const [times, setTimes] = useState([])
    const selectedDate = localStorage.getItem('selectedDate')
    let history = useHistory()
    const restaurant = localStorage.getItem('restaurant')
    const mealtime = localStorage.getItem('mealtime')

    useEffect(()=>{
        db.collection('restaurants').doc(restaurant).collection('schedules').doc(mealtime).onSnapshot(querySnapshot=>{
            if(querySnapshot.exists){
                const {data}  = querySnapshot.data()
                setTimes(data)
            }   
        })
    // eslint-disable-next-line
    },[])
    
    return (
        <div>
            <Nav/>
            <div  className="d-flex justify-content-between align-items-center my-4 px-5">
                <h3 className="display-5">Editar reserva</h3>
                <button className="btn bg-nero" onClick={()=> history.goBack()} >Atras</button>
            </div>
            <div>
            <Form 
                times={times}
                reservation={reservation}
                selectedDate={selectedDate}
            />
            </div>
            
        </div>
    )
}
