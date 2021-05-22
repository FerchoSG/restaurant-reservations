import {useEffect, useState} from 'react'


export default function useDate(){
    const [selectedDate, updateDate] = useState()

    useEffect(()=>{
        let date = new Date()
        let month = date.getMonth() + 1 > 9 ? date.getMonth() + 1 : `0${date.getMonth() + 1}`
        let day = date.getDate() + 1 > 9 ? date.getDate() + 1 : `0${date.getDate() + 1}`
        return `${date.getFullYear()}-${month}-${day}`
        updateDate(formattedDate)
    },[])


    const setSelectedDate = (value)=>{
        localStorage.setItem('selectedDate', value)
        updateDate(value)
    }

    return {selectedDate, setSelectedDate}
}
