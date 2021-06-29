import React, {useEffect} from 'react'
import Nav from '../components/Nav'
import { Link, useHistory } from 'react-router-dom'
import {useAuth} from '../context/AuthContext'

import { MEALTIMES, RESTAURANTS } from "../services/constants"
import ES from '../services/es.json'
const bg = ['bg-main', 'bg-second']

export default function Home() {
    const history = useHistory()
    const { currentUser } = useAuth()
    useEffect(() =>{
        if(!currentUser){
            history.push('/login')
        }
    // eslint-disable-next-line
    },[currentUser])


    return (
        <main>
            <Nav/>
            <section>
                <h2 className="display-4 text-center my-3">Elige un tiempo de alimentación</h2>
                
                <section className="d-flex flex-column flex-wrap flex-md-row container m-auto p-4 gap-2">
                    {
                        RESTAURANTS.map((restaurant, index) => (
                            <article className={`shadow rounded col text-light restaurant__card ${bg[index]}`}>
                                <h3 className="display-6 text-center"> {restaurant} </h3>
                                <div className="restaurant__card-content">
                                    {
                                        MEALTIMES[restaurant].map(mealTime => (
                                            <Link
                                                to={`${restaurant}/${ES[mealTime]}`} 
                                                className={`bg-bianco`}> {ES[mealTime]} </Link>
                                        ))
                                    }
                                </div>
                            </article>
                        ))
                    }
                </section>
            </section>
        </main>
    )
}
