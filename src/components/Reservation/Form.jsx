import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router'
// import useDate from '../../hooks/useDate'
import rooms from '../../services/hotelRooms'
import { 
    createReservation, updateReservation, 
    getReservationsLimit, getReservationsCounter, 
    updatePaxLimit, getDefaultPaxLImit
} 
from '../../services/restaurantService'

import { useFormik } from 'formik';
import * as Yup from 'yup'

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Form({times, reservation, time, selectedDate} = {reservation: false, time: ''}) {
    const [editedPax, setEditedPax] = useState(0)
    const [hour, setHour] = useState(0)
    const [paxLimit, setPaxLimit] = useState('')
    const [totalPaxCounter, setTotalPaxCounter] = useState()
    const [limitError, setLimitError] = useState()
    const [confirmationCode, setConfirmationCode] = useState()
    const [permissionToExceedPaxLimit, setPermissionToExceedPaxLimit] = useState(false)
    const params = useParams()
    const reservationForm = useRef()
    const typeOfMeal = params.time || localStorage.getItem('backTo').split('/')[1]
    const backTo = '/'+typeOfMeal

    const code = 'hasrs2020'

    const reservationSchema = Yup.object().shape({
        pax: Yup.number().moreThan(0,'el numero de pax debe ser mayor a 0')
          .required('el numero de pax debe ser mayor a 0'),
        bookedby: Yup.string()
          .required('debes indicar quien crea la reserva'),
        room: Yup.string().required('debes elegir un numero de habitación'),
        details: Yup.string().nullable()
      });

    const formik = useFormik({
        initialValues: {
          pax: 0,
          bookedby: '', 
          room: '',
          details: ''
        },
        onSubmit: values => {
          create(values)
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
    
    const create = async  ({pax, bookedby, room, details})=>{
        const newReservation = {pax, bookedby, room, details}
        const defaultPaxLimit = await getDefaultPaxLImit()
        console.log(defaultPaxLimit)

        if(paxLimit < (Number(pax) - Number(editedPax)) + Number(totalPaxCounter) && !permissionToExceedPaxLimit){
            setLimitError(true)
            return
        }
        if(reservation && paxLimit < ((Number(pax) - Number(editedPax)) + Number(totalPaxCounter)) && !permissionToExceedPaxLimit){
            setLimitError(true)
            return
        }


        if(defaultPaxLimit.data >= (Number(pax) - Number(editedPax)) + Number(totalPaxCounter) ){
            let newLimit = defaultPaxLimit.data
            updatePaxLimit({
                date: selectedDate,
                typeOfMeal, hour, 
                newLimit
            })
        }

        if(permissionToExceedPaxLimit){
            let newLimit = Number(pax) - Number(editedPax) + Number(totalPaxCounter)
            updatePaxLimit({
                date: selectedDate,
                typeOfMeal, hour, 
                newLimit
            })
        }



   
        if(reservation){
            let previousHour = localStorage.getItem('hour')
            newReservation.status = reservation.status
            updateReservation({
                date: selectedDate, data: newReservation, 
                hour, id: reservation.id, typeOfMeal,
                previousHour, previousPax: reservation.pax})
                // history.push(backTo)
                 notify_updated()
                 setLimitError(false)
            }else{
                createReservation({
                date: selectedDate, data: newReservation , 
                hour, typeOfMeal})
                notify_created()
                    clearForm()
        //         // history.push(backTo)
        }
        

    }

    const clearForm = ()=>{
        reservationForm.current.reset()
        formik.resetForm()
        setLimitError(false)
    }


    useEffect(()=>{
        if(reservation){
            setEditedPax(reservation.pax)
            formik.values.pax = reservation.pax
            formik.values.bookedby = reservation.bookedby
            formik.values.room = reservation.room
            formik.values.details = reservation.details
            let hourLS = localStorage.getItem('hour')
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
        if(hour !== 0 && hour !== undefined){
            getReservationsLimit({date: selectedDate, typeOfMeal, time: hour})
            .then(res => {
                setPaxLimit(res.data)
            })

            getReservationsCounter({date: selectedDate, typeOfMeal, time: hour})
            .then(res => {
                setTotalPaxCounter(res.data)
            })
        } 
    // eslint-disable-next-line
    },[hour])
    useEffect(() =>{
        
        if(times[0] && !reservation){
            setHour(times[0])
        }
    // eslint-disable-next-line
    }, [times])
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
                    <label className='form-label color-nero fw-bold'>Numero de pax</label>
                    <input type='number' min='0' name="pax" value={formik.values.pax}  onChange={formik.handleChange} className='form-control' />
                    {formik.errors.pax ? <p className="text-danger fw-bold p-0 m-0">{formik.errors.pax}</p> : null}
                </div>
                <div className="col-6">
                    <label className='form-label color-nero fw-bold'>Reservado por:</label>
                    <input type='text'  name="bookedby" value={formik.values.bookedby}  onChange={formik.handleChange} className='form-control' id='bookedby' />
                    {formik.errors.bookedby ? <p className="text-danger fw-bold p-0 m-0">{formik.errors.bookedby}</p> : null}
                </div>
            </div>
            <div className="d-flex justify-content-between gap-2 mb-2  w-100">
                <div className="col-6">
                    <label className='form-label color-nero fw-bold'>Hora:</label>
                    <select className='form-select' aria-label='habitación' onChange={({target}) => setHour(target.value)}>
                        {!reservation ?? 
                            <option defaultValue="" >
                                Escoge una hora
                            </option>
                        }
                        {times.map((time, index) => {
                            if(reservation && hour === time){
                                return <option key={index} value={hour} selected={hour}> {hour[0]}:{hour[1]}{hour[2]} {backTo === '/dinner' ? 'pm' : 'am'} </option>    
                            }else{
                               return  <option key={index} value={time}> {time[0]}:{time[1]}{time[2]} {backTo === '/dinner' ? 'pm' : 'am'} </option>    
                            }
                        }
                        )}
                    </select>
                </div>
                <div className="col-6">
                    <label className='form-label color-nero fw-bold'>Habitación:</label>
                    <select id="room" className='form-select' aria-label='habitación' onChange={formik.handleChange}>
                        <option defaultValue={formik.values.room} >
                            {reservation ? formik.values.room : 'Escoge una habitacion'}
                        </option>
                        { rooms.map((room, index) =>
                            <option key={index} value={room}> {room} </option>
                        )}
                    </select>
                    {/* {formik.errors.room ? <p className="text-danger fw-bold p-0 m-0">{formik.errors.room}</p> : null} */}
                </div>

            </div>
            <div className="mb-3">
                <label className='form-label color-nero fw-bold'>Detalles:</label>
                <textarea 
                    defaultValue={`${reservation ? reservation.details : ''}`}
                    className='form-control' id='details' onChange={formik.handleChange} >
                    
                </textarea>
            </div>

            {reservation ? 
            <button type="submit" className="btn bg-neutral fw-bold btn-block btn-lg">
                Editar reserva
            </button>
            :
            <button type="submit" className="btn bg-second fw-bold btn-block btn-lg">
                Agregar reserva
            </button>
            }
        </form>
    )
}
