import {useEffect, useState} from 'react'


export default function useDate(){
    const [selectedDate, updateDate] = useState()

    useEffect(()=>{
        let date = new Date().toLocaleDateString()
        let dateArray = date.split('/')
        let month = dateArray[0] > 9 ? dateArray[0] : `0${dateArray[0]}`
        let formattedDate = `${dateArray[2]}-${month}-${dateArray[1]}`
        updateDate(formattedDate)
    },[])


    const setSelectedDate = (value)=>{
        localStorage.setItem('selectedDate', value)
        updateDate(value)
    }

    return {selectedDate, setSelectedDate}
}
