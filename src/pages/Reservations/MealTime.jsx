import React, {useEffect, useRef, useState} from 'react'
import { useParams, Link, useHistory } from 'react-router-dom'
import CustomDatePicker from '../../components/CustomDatePicker'
import Nav from '../../components/Nav'
import List from '../../components/Reservation/List'
import useDate from '../../hooks/useDate'
import EN from '../../services/en.json'
import {db} from '../../services/firebase'
import {checkIfCounterOrCreate} from '../../services/restaurantService';

export default function MealTime() {
    const params = useParams()
    const history = useHistory()
    const [paxArrived, setPaxArrived] = useState(0)
    const [pendingPax, setPendingPax] = useState(0)
    const [schedule, setSchedule] = useState([])
    const {selectedDate, setSelectedDate} = useDate()
    const [showScroll, setShowScroll] = useState(false)
    const scrollToTopBtn = useRef()
    const mealtime = EN[params.mealtime]
    const restaurant = params.restaurant

    const handleDateChange = (date) => {
        setSelectedDate(date);
    };

    const formatHour = (hour) =>{
        let hourString = String(hour)
        let currentTime = params.mealtime === 'desayuno' ? 'am' : 'pm'
        if(hourString.length === 3)
            return `${hourString[0]}:${hourString[1]}${hourString[2]}${currentTime}`
        if(hourString.length === 4)
            return `${hourString[0]}${hourString[1]}:${hourString[2]}${hourString[3]}${currentTime}`
    }

    const getLunchTimes = ()=>{
        if(selectedDate){
            db.collection(selectedDate)
            .doc('Italiano')
            .collection('lunch')
            .doc('hours')
            .onSnapshot((querySnapshot) =>{
                setSchedule([])
                if(querySnapshot.exists){
                    let schedule = querySnapshot.data()
                    let scheduleSorted = schedule.data.sort()
                    setSchedule(scheduleSorted)
                }
            })
        }
    }

    useEffect(() => {
        if(mealtime === 'lunch'){
            getLunchTimes()
        }else{
            db.collection('restaurants')
            .doc(restaurant)
            .collection('schedules')
            .doc(mealtime)
            .onSnapshot(querySnapshot =>{
                setSchedule([])
                if(querySnapshot.exists){
                    let schedule = querySnapshot.data()
                    setSchedule(schedule.data)
                }
            })
        }

        localStorage.setItem('selectedDate',selectedDate)

        if(selectedDate){
           getArrivedPaxCounter()
           getPendingPaxCounter()
        }
        // eslint-disable-next-line
    }, [selectedDate])

    const checkScrollTop = () => {
        if (!showScroll && window.pageYOffset > 100){
          setShowScroll(true)
        } else if (showScroll && window.pageYOffset <= 100){
          setShowScroll(false)
        }
      };

      const scrollTop = () =>{
        window.scrollTo({top: 0, behavior: 'smooth'});
      };
    
      window.addEventListener('scroll', checkScrollTop)

    const getArrivedPaxCounter = async () => {
        await checkIfCounterOrCreate({date: selectedDate, mealtime, restaurant})
    
        db.collection(selectedDate)
        .doc(restaurant)
        .collection(mealtime)
        .doc('paxArrived')
        .onSnapshot((querySnapshot =>{
            if(querySnapshot.exists){
                let paxArrived = querySnapshot.data()
                setPaxArrived(paxArrived.data)
            }
        }))
    }
    const getPendingPaxCounter = async () => {
        await checkIfCounterOrCreate({date: selectedDate, mealtime, restaurant})
    
        db.collection(selectedDate)
        .doc(restaurant)
        .collection(mealtime)
        .doc('paxPending')
        .onSnapshot((querySnapshot =>{
            if(querySnapshot.exists){
                let paxArrived = querySnapshot.data()
                setPendingPax(paxArrived.data)
            }
        }))
    }

    return (
        <div style={{position: 'relative'}}>
            <Nav/>
            <h2 className="display-4 text-center mt-2">
                Restaurante {params.restaurant}
            </h2>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center px-4">
                <h3 className="display-6">Reservas para {params.mealtime}</h3>
                <div className="d-flex gap-4 align-items-center ">
                    <Link to='/addReservation' className="btn bg-light-g">Agregar Reservación</Link>
                    <Link to='' onClick={() => history.goBack() } className="btn bg-nero">Atras</Link>
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
            {schedule && schedule.map((time, index) =>
                  <div key={index} className="d-flex align-items-center mb-3 p-2">
                    <p 
                        style={{transform: 'rotate(-90deg)', width: '3rem'}} 
                        className="m-0 text-center p-0 color-nero fw-bold fs-3"> {formatHour(time)} </p>
                    <div
                      className="card d-flex flex-row align-items-start w-100 "
                      style={{ minHeight: "200px" }}
                    >
                    <List 
                        key={index}
                        selectedDate={selectedDate}
                        time={time} />
                      
                    </div>
                </div>
                )}

                <span   
                    style={{display: showScroll ? 'block' : 'none', 
                            position: 'fixed', zIndex: 100, 
                            bottom: '1rem', right: '1rem', 
                            cursor: 'pointer'}}
                    onClick={scrollTop} ref={scrollToTopBtn}>
                    <i class="fas fa-arrow-circle-up fs-1 text-danger"></i>
                </span>
        </div>
    )
}
