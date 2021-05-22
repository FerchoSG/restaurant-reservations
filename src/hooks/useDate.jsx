import {useEffect, useState} from 'react'


export default function useDate(){
    const [selectedDate, updateDate] = useState()

    useEffect(()=>{
        let sixHours = 60 * 60 * 6 * 1000;
        let currentTime = new Date() - sixHours
        let date = new Date(currentTime).toJSON()
        let formattedDate = date.split('T')[0]
        updateDate(formattedDate)
    },[])


    const setSelectedDate = (value)=>{
        localStorage.setItem('selectedDate', value)
        updateDate(value)
    }

    return {selectedDate, setSelectedDate}
}
