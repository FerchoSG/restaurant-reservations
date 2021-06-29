import React, {useEffect, useState} from 'react'
import Swal from 'sweetalert2';
import { useFormik } from 'formik';
import * as Yup from 'yup'
import { useParams } from 'react-router';
import {deleteReservation} from '../../services/restaurantService';
import { useHistory } from 'react-router-dom';
import dayjs from 'dayjs'
import BounceSpinner from '../BounceSpinner';

export default function DeleteForm() {
    const [reservation, setReservation] = useState()
    const [selectedDate, setSelectedDate] = useState()
    const [isDeletable, setDeletable] = useState(true)
    const [hour, setHour] = useState()
    const [mealtime, setMealtime] = useState()
    const [restaurant, setRestaurant] = useState()
    const params = useParams()
    const history = useHistory()

    const deleteReservationSchema = Yup.object().shape({
        deletedBy: Yup.string()
        .required('debes indicar quien elimina la reserva'),
        deletedReason: Yup.string()
        .required('debes indicar el motivo para eliminar la reserva')
    });

    const formik = useFormik({
    initialValues: {
        deletedBy: '', 
        deletedReason: ''
    },
    onSubmit: values => {
        handleDelete(values)
    },
    validationSchema: deleteReservationSchema
    });

    const handleDelete = (values) => {
        getDeleteConfirmation(values)
    }

    const getDeleteConfirmation = (values) =>{
        Swal.fire({
          icon: 'warning',
          title: 'Eliminar Reserva',
          text: '¿Estas seguro de borrar esta reservación?',
          showDenyButton: true,
          confirmButtonText: 'Eliminar',
          denyButtonText: 'Cancelar'
        }).then(async res =>{
          if(res.isConfirmed){
            reservation.deletedBy = values.deletedBy
            reservation.deletedReason = values.deletedReason
            await deleteReservation({mealtime, hour, selectedDate, reservation, restaurant})
            history.goBack()
          }
        })
      }

      
    useEffect(() =>{
        setReservation(JSON.parse(localStorage.getItem(params.id)))
        setMealtime(localStorage.getItem('mealtime'))
        setRestaurant(localStorage.getItem('restaurant'))
        setHour(localStorage.getItem('hour'))
        setSelectedDate(localStorage.getItem('selectedDate'))

        
    // eslint-disable-next-line
    },[])

    useEffect(() => {
        if(selectedDate && dayjs(selectedDate).isBefore(dayjs().locale('cr').format('YYYY-MM-DD'))){
            setDeletable(false)
        }
    }, [selectedDate])

    if(!selectedDate) return <BounceSpinner />
    return (
        <form className="container col-lg-6 p-4 shadow mt-2 rounded" onSubmit={formik.handleSubmit}>
            { isDeletable ?
                <div>
                    <div className="mb-3">
                    <label htmlFor="deletedBy" className="form-label color-nero fw-bold">¿Quien elimina la reserva?</label>
                    <input 
                        type="text" id="deletedBy" className="form-control" 
                        value={formik.values.deletedBy}  onChange={formik.handleChange} />
                    {formik.errors.deletedBy ? <p className="text-danger fw-bold p-0 m-0">{formik.errors.deletedBy}</p> : null}
                </div>
                <div className="mb-3">
                    <label htmlFor="deletedReason" className="form-label color-nero fw-bold">¿Porque deseas eliminarla?</label>
                    <textarea 
                        value={formik.values.deletedReason}  onChange={formik.handleChange}
                        className='form-control' id='deletedReason' >
                    </textarea>
                    {formik.errors.deletedReason ? <p className="text-danger fw-bold p-0 m-0">{formik.errors.deletedReason}</p> : null}
                </div>
                <button type="submit" className='btn btn-lg btn-block btn-danger fw-bold fs-6'>Eliminar</button>
                </div>
                : 
                <h2>No puedes borrar reservas pasadas</h2>
            }
        </form>
    )
}
