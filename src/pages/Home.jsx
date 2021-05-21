import React, {useEffect} from 'react'
import Nav from '../components/Nav'
import { Link, useHistory } from 'react-router-dom'
import {useAuth} from '../context/AuthContext'



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
                



                <section className="d-flex flex-column flex-md-row container m-auto p-4 gap-2">
                    <Link to="/breakfast" className="bg-neutral shadow rounded col text-light" style={{cursor: "pointer", padding: '4rem'}}>
                        <div className="d-flex justify-content-between align-items-center">
                            <h3 className="display-6">Desayuno</h3>
                            <div className="display-1">
                                <i className="fas fa-coffee"></i>
                            </div>
                        </div>
                    </Link>
                    <Link to="/dinner" className="shadow col bg-second rounded text-light"  style={{cursor: "pointer", padding: '4rem'}}>
                        <div className="d-flex justify-content-between align-items-center" >
                            <h3  className="display-6">Cena</h3>
                            <div className="display-1">
                                <i className="fas fa-cocktail"></i>
                            </div>
                        </div>
                    </Link>
                </section>
            </section>
        </main>
    )
}
