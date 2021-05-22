import {useEffect, useState} from 'react'


export default function useDate(){
    const [selectedDate, updateDate] = useState()

    useEffect(()=>{
        let date = new Date().toLocaleDateString()
        let dateArray = date.split('/')
        dateArray[0] < 10 ? dateArray[0] = `0${dateArray[0]}`:  null;
        let formattedDate = `${dateArray[2]}-${dateArray[0]}-${dateArray[1]}`
        updateDate(formattedDate)
    },[])


    const setSelectedDate = (value)=>{
        localStorage.setItem('selectedDate', value)
        updateDate(value)
    }

    return {selectedDate, setSelectedDate}
}
