import React, { useEffect, useRef, useState } from 'react'
// import { useParams } from 'react-router'
// import useDate from '../../hooks/useDate'
import { multiSelectRooms } from '../../services/hotelRooms'
import { 
    createReservation, updateReservation, 
    getReservationsCounter, getCurrentDayPaxLImit, getAccessCode
} 
from '../../services/restaurantService'
import { useFormik } from 'formik';
import * as Yup from 'yup'
import dayjs from 'dayjs'
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {useAuth} from '../../context/AuthContext';
// import {TimePicker} from '@material-ui/pickers'
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import {MEALTIMES, RESTAURANTS} from '../../services/constants';
import ES from '../../services/es.json'
import {db} from '../../services/firebase';

const animatedComponents = makeAnimated();

const colourStyles = {
    control: styles => ({ ...styles, backgroundColor: 'white' }),
    multiValue: (styles) => {
        return {
          ...styles,
          backgroundColor: '#C7F9CC',
          color: '#57CC99'
        };
      },
      multiValueRemove: (styles) => ({
        ...styles,
        ':hover': {
          backgroundColor: '#57CC99',
          color: '#C7F9CC',
        },
      }),
    }

export default function Form({times, reservation, selectedDate} = {reservation: false, time: ''}) {
    const [editable, setEditable] = useState(true)
    const [editedPax, setEditedPax] = useState(0)
    const [hour, setHour] = useState()
    const [schedule, setSchedule] = useState([])
    const [mealtimes, setMealtimes] = useState([])
    const [paxLimit, setPaxLimit] = useState('')
    const [totalPaxCounter, setTotalPaxCounter] = useState()
    const [limitError, setLimitError] = useState()
    const [confirmationCode, setConfirmationCode] = useState()
    const [permissionToExceedPaxLimit, setPermissionToExceedPaxLimit] = useState(false)
    const {currentUser} = useAuth()
    const reservationForm = useRef()
    const [code, setCode] = useState('')

    const reservationSchema = Yup.object().shape({
        pax: Yup.number().moreThan(0,'el numero de pax debe ser mayor a 0')
          .required('el numero de pax debe ser mayor a 0'),
        bookedby: Yup.string()
          .required('debes indicar quien crea la reserva'),
        restaurant: Yup.string()
          .required('debes seleccionar un restaurante'),
        mealtime: Yup.string()
          .required('debes seleccionar un tiempo de comida'),
        hour: Yup.string()
          .required('debes seleccionar una hora'),
        room: Yup.array()
            .min(1, 'Elige al menos una habitacion')
            .of(
                Yup.object().shape({
                    label: Yup.string().required('Elige al menos una habitacion'),
                    value: Yup.string().required('Elige al menos una habitacion')
                })
            ),
        details: Yup.string().nullable()
      });

    const formik = useFormik({
        initialValues: {
          pax: 0,
          bookedby: '', 
          room: [],
          details: '',
          restaurant: '',
          mealtime: '',
          hour: '',
        },
        onSubmit: values => {
            const rooms = values.room.map(t => t.value)
            values.room = rooms.join()
            if(values.mealtime === 'lunch'){
                if(values.hour.includes(':')){
                    let hourArr = values.hour.split(':')
                    let removeMilitarHour = Number(hourArr[0]) > 12 ? Number(hourArr[0]) - 12 : hourArr[0]
                    let formattedHour = removeMilitarHour + hourArr[1]
                    values.hour = formattedHour
                }
            }
            create(values)
            // console.log(values)
        },
        validationSchema: reservationSchema
      });

    const [errors, setErrors] = useState(false)

    function notify_created(){
        return toast.success('Reservación creada', {
            position: "top-right",
            autoClose: 1500,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            });
    }
    function notify_updated(){
        return toast.info('Reservación actualizada', {
            position: "top-right",
            autoClose: 1500,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            });
    }
    function notify_permission_denied(){
        return toast.warning('Código incorrecto', {
            position: "top-right",
            autoClose: 1500,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            });
    }

    const formatHour = (hour) =>{
        let hourString = String(hour)
        let currentTime = formik.values.mealtime === 'breakfast' ? 'am' : 'pm'
        if(hourString.length === 3)
            return `${hourString[0]}:${hourString[1]}${hourString[2]}${currentTime}`
        if(hourString.length === 4)
            return `${hourString[0]}${hourString[1]}:${hourString[2]}${hourString[3]}${currentTime}`
    }

    const formatHourForInput = hour =>{
        let hourString = String(hour)
        let militarHour = Number(hourString[0]) === 12 ? hourString[0] : Number(hourString[0]) + 12
        if(hourString.length === 3){
            return `${militarHour}:${hourString[1]}${hourString[2]}`
        }
        if(hourString.length === 4){
            return `${militarHour}${hourString[1]}:${hourString[2]}${hourString[3]}`
        }
    }
    
    const create = async  ({pax, bookedby, room, details, hour, mealtime, restaurant})=>{
        const newReservation = {pax, bookedby, room, details, hour}
        let limitExceeded = false
        
        if(mealtime !== 'lunch'){
            const totalPax = (Number(pax) - Number(editedPax)) + Number(totalPaxCounter)

            if(paxLimit < totalPax && !permissionToExceedPaxLimit){
                setLimitError(true)
                limitExceeded = true
            }
        }

        if(limitExceeded){
            setLimitError(true)
            console.log('limite excedido')
        } else{
            if(reservation){
                updateReservation({
                    date: selectedDate, data: newReservation, 
                    hour, previousReservation: reservation, mealtime, currentUser, restaurant})
                console.log('actualizando reserva...')
                     notify_updated()
                     setLimitError(false)
                }else{
                    createReservation({
                    date: selectedDate, data: newReservation , 
                    hour,  mealtime, currentUser, restaurant})
                    console.log('creando reserva...')
                    notify_created()
                    clearForm()
            }
        }

        

    }

    const clearForm = ()=>{
        reservationForm.current.reset()
        formik.resetForm()
        setLimitError(false)
    }

    useEffect(() => {
        getAccessCode()
        .then(response =>{
            setCode(response.code)
        })

        if(dayjs(selectedDate).isBefore(dayjs().locale('cr').format('YYYY-MM-DD'))){
            setEditable(false)
        }

        
    }, [selectedDate])


    useEffect(()=>{
        if(reservation){
            setEditedPax(reservation.pax)
            const restaurantLS = localStorage.getItem('restaurant')
            const mealtimeLS = localStorage.getItem('mealtime')
            formik.values.pax = reservation.pax
            formik.values.bookedby = reservation.bookedby
            const rooms = reservation.room.split(',')
            formik.values.room = rooms.map(room => ({value: room, label: room}))
            formik.values.details = reservation.details
            formik.values.restaurant = restaurantLS
            formik.values.mealtime = mealtimeLS
            let hourLS = localStorage.getItem('hour')
            formik.values.hour = hourLS
            setHour(hourLS)
        }
// eslint-disable-next-line
    },[reservation])

    useEffect(()=>{
            setTimeout(() => {
                setErrors(false)
            }, 3500);
    },[errors])

    
    const checkCode = (evt)=>{
        evt.preventDefault()
        if(code === confirmationCode){
            setPermissionToExceedPaxLimit(true)
            formik.submitForm()
        }else{
            setPermissionToExceedPaxLimit(false)
            notify_permission_denied()
        }

    }

    useEffect(()=>{
        if(formik.values.hour !== '' && formik.values.restaurant){
            getCurrentDayPaxLImit({date: selectedDate, restaurant: formik.values.restaurant, mealtime: formik.values.mealtime})
            .then(res => {
                setPaxLimit(res)
            })

            getReservationsCounter({
                date: selectedDate, mealtime: formik.values.mealtime, 
                time: formik.values.hour, restaurant: formik.values.restaurant})
            .then(res => {
                console.log('pax counter',res)
                setTotalPaxCounter(res.data)
            })
        } 
    // eslint-disable-next-line
    },[formik.values.hour])
    useEffect(() =>{
        
        if(times[0] && !reservation){
            setHour(times[0])
        }
    // eslint-disable-next-line
    }, [times])


    useEffect(() => {
        setMealtimes(MEALTIMES[formik.values.restaurant] || [])
    }, [formik.values.restaurant])

    useEffect(() => {
        if(formik.values.restaurant !== ''){
            db.collection('restaurants')
            .doc(formik.values.restaurant)
            .collection('schedules')
            .doc(formik.values.mealtime)
            .onSnapshot(querySnapshot =>{
                if(!querySnapshot.exists) return
                let schedule = querySnapshot.data()
                setSchedule(schedule.data)
            })
        }
// eslint-disable-next-line
    }, [formik.values.mealtime])

    return (
        <form className="container col-lg-6 p-4 shadow mt-2" ref={reservationForm} onSubmit={formik.handleSubmit}>
            <ToastContainer />
            {limitError && 
            <div className="m-auto col-8">
                <label htmlFor="authCode" className="text-danger">
                    el limite de pax permitidos en esta hora es exedido,
                    digite codigo de autorización para continuar</label>
                <div className="col-8 m-auto">
                    <div className="input-group">
                        <input type="password" className="form-control" onChange={({target}) => setConfirmationCode(target.value)} />
                        <button type="button" className="input-group-text bg-main text-light" onClick={checkCode}>Confirmar</button>
                    </div>
                </div>
            </div>
            }
            <div className='d-flex justify-content-between gap-2 mb-2 w-100'>
                <div className="col-6">
                    <label className='form-label color-nero fw-bold'>Restaurante</label>
                   <select name="restaurant" className='form-select' onChange={formik.handleChange}>
                   <option defaultValue="" >Elige un restaurante</option>
                   {
                       RESTAURANTS.map(restaurant => {
                            if(formik.values.restaurant === restaurant){
                                    return <option value={restaurant} selected={restaurant} >{restaurant}</option>
                            }else{
                                    return <option value={restaurant} >{restaurant}</option>
                            }
                        })
                   }
                   </select>
                    {formik.errors.restaurant ? <p className="text-danger fw-bold p-0 m-0">{formik.errors.restaurant}</p> : null}
                </div>
                <div className="col-6">
                    <label className='form-label color-nero fw-bold'>Tiempo de comida</label>
                   <select name="mealtime" className='form-select' onChange={formik.handleChange}>
                   <option defaultValue="" >Elige un tiempo de comida</option>
                   {
                       mealtimes.map(mealtime =>{ 
                           if(formik.values.mealtime === mealtime){
                                return <option value={mealtime} defaultValue={mealtime}>{ES[mealtime]}</option>
                           }else{
                                return <option value={mealtime} >{ES[mealtime]}</option>
                           }
                        })
                   }
                   </select>
                    {formik.errors.mealtime ? <p className="text-danger fw-bold p-0 m-0">{formik.errors.mealtime}</p> : null}
                </div>
            </div>
            <div className='d-flex justify-content-between gap-2 mb-2 w-100'>
                <div className="col-6">
                    <label className='form-label color-nero fw-bold'>Numero de pax</label>
                    <input type='number' disabled={!editable} min='0' name="pax" value={formik.values.pax}  onChange={formik.handleChange} className='form-control' />
                    {formik.errors.pax ? <p className="text-danger fw-bold p-0 m-0">{formik.errors.pax}</p> : null}
                </div>
                <div className="col-6">
                    <label className='form-label color-nero fw-bold'>Reservado por:</label>
                    <input type='text'  name="bookedby" value={formik.values.bookedby} disabled={!editable} onChange={formik.handleChange} className='form-control' id='bookedby' />
                    {formik.errors.bookedby ? <p className="text-danger fw-bold p-0 m-0">{formik.errors.bookedby}</p> : null}
                </div>
            </div>
            <div className="d-flex justify-content-between gap-2 mb-2  w-100">
                <div className="col-6">
                    <label className='form-label color-nero fw-bold'>Hora:</label>
                    {formik.values.mealtime === 'lunch' ? 
                    <input 
                        type="time" min="12:00" max="17:00" className='form-control' 
                        value={formatHourForInput(formik.values.hour)}  name='hour' onChange={formik.handleChange}/>
                    // <TimePicker
                    //     className='form-control'
                    //     ampm={true}
                    //     name='hour'
                    //     orientation="portrait"
                    //     value={formatHourForInput(formik.values.hour)}
                    //     onChange={handleHourChange}
                    // />
                : 
                    <select disabled={!editable} className='form-select' name='hour' aria-label='hour' onChange={formik.handleChange}>
                        {!reservation ?
                            <option defaultValue="" >
                                Escoge una hora
                            </option> : null
                        }
                        {schedule && schedule.map((time, index) => {
                            if(reservation && Number(hour) === Number(time)){
                                return <option key={index} value={time} selected={time}> {formatHour(time)} </option>    
                            }else{
                               return  <option key={index} value={time}> {formatHour(time)} </option>    
                            }
                        }
                        )}
                    </select>
                    }
                    {formik.errors.hour ? <p className="text-danger fw-bold p-0 m-0">{formik.errors.hour}</p> : null}
                </div>
                <div className="col-6">
                    <label className='form-label color-nero fw-bold'>Habitación:</label>
                    <Select
                        id="room" 
                        isDisabled={!editable}
                        placeholder="Elige una habitación"
                        closeMenuOnSelect={true}
                        components={animatedComponents}
                        value={formik.values.room}
                        isMulti
                        options={multiSelectRooms}
                        onChange={target => formik.setFieldValue('room', target)}
                        styles={colourStyles}
                    />
                    {formik.errors.room ? <p className="text-danger fw-bold p-0 m-0">{formik.errors.room}</p> : null}
                </div>

            </div>
            <div className="mb-3">
                <label className='form-label color-nero fw-bold'>Detalles:</label>
                <textarea disabled={!editable}
                    defaultValue={`${reservation ? reservation.details : ''}`}
                    className='form-control' id='details' onChange={formik.handleChange} >
                    
                </textarea>
            </div>

            {reservation ? 
             editable ?
                <button type="submit" className="btn bg-neutral fw-bold btn-block btn-lg">
                    Editar reserva
                </button>
                :
                <button disabled className="btn bg-warn fw-bold btn-block btn-lg">
                    No puedes editar reservas pasadas
                </button>
            :
            <button type="submit" className="btn bg-second fw-bold btn-block btn-lg">
                Agregar reserva
            </button>
            }
        </form>
    )
}
