import React from 'react'
import {useHistory} from 'react-router-dom'
import Nav from '../../components/Nav'
import DeleteForm from '../../components/Reservation/DeleteForm';

export default function Delete() {
    let history = useHistory()

    return (
        <div>
            <Nav/>
            <section className="d-flex justify-content-between align-items-center my-4 px-5">
                <h3 className="display-5">Eliminar reservación</h3>
                <button className="btn bg-nero" onClick={()=> history.goBack()} >Atras</button>
            </section>
            <DeleteForm/>
        </div>
    )
}
