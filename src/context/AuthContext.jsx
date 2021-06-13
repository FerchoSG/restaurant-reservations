import React, {useContext, useEffect, useState} from 'react'
import { auth } from '../services/firebase';

const AuthContext = React.createContext({})

export function useAuth(){
    return useContext(AuthContext)
}

export function AuthProvider({children}){

    const [currentUser, setCurrentUser] = useState()

    function signup({email, password}){
        return auth.createUserWithEmailAndPassword(email, password)
    }
    function login({email, password}){
        return auth.signInWithEmailAndPassword(email, password)
    }

    function logout(history){
        auth.signOut()
        history.push('/login')
    }

    useEffect(() =>{
        const unsubscribe = auth.onAuthStateChanged(user =>{
            setCurrentUser(user)
        })

        return unsubscribe
    },[])


    const value = {
        currentUser,
        signup,
        login,
        logout
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}