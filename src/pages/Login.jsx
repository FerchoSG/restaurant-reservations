import React, {useEffect, useState} from 'react'
import {useAuth} from '../context/AuthContext'
import { useHistory } from 'react-router-dom'


export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const { login, currentUser } = useAuth()
    const [authError, setAuthError] = useState(false)
    const history = useHistory()

    function handleSubmit (evt) {
        evt.preventDefault()

            const response = login({email, password})
            response
            // eslint-disable-next-line
            .then(res => {
                
                setAuthError(false)
            })
            // eslint-disable-next-line
            .catch(res => {
                setAuthError(true)
            })
 
    }

    useEffect(() =>{
        if(currentUser){
            history.push('/')
        }
    // eslint-disable-next-line
    },[currentUser])

    useEffect(() =>{
        if(authError){
            setTimeout(() => {
                setAuthError(false)
            }, 1000);
        }
    },[authError])

    return (
        <div className="d-flex justify-content-center align-items-center login-container" >
            <div className="hotel-image">
                <img className="login-image rounded shadow"
                    src="https://i.ytimg.com/vi/bD0FdB2FDu4/maxresdefault.jpg" alt="hotel " />
            </div>
            <div 
                className="container bg-light d-flex flex-column justify-content-center align-items-center shadow rounded login-form ">
                <form className="w-100" onSubmit={handleSubmit}>
                    <h2 className="display-6 mb-3 fw-bold text-muted">Login</h2>
                    {authError && 
                        <p className="text-danger fw-bold" role="alert">
                            Credenciales no coinciden
                        </p>
                     }
                    <div className="form-floating mb-3">
                        <input 
                            type="email" className="form-control col-sm-6" 
                            id="floatingInput" value={email}  
                            onChange={({target}) => setEmail(target.value)} required/>
                        <label htmlFor="floatingInput">Email address</label>
                    </div>
                    <div className="form-floating mb-3">
                        <input 
                            type="password" className="form-control" 
                            id="floatingPassword" value={password} 
                            onChange={({target}) => setPassword(target.value)} required/>
                        <label htmlFor="floatingPassword">Password</label>
                    </div>
                    <input type="submit" className="btn btn-secondary btn-block" value="Log In"/> 
                </form>
            </div>
        </div>
    )
}
