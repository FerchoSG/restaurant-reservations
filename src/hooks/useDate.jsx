import {useEffect, useState} from 'react'
import dayjs from 'dayjs'
import 'dayjs/locale/es'

export default function useDate(){
    const [selectedDate, updateDate] = useState()

    useEffect(()=>{
        let formattedDate = dayjs().locale('cr').format('YYYY-MM-DD')
        updateDate(formattedDate)
    },[])


    const setSelectedDate = (value)=>{
        localStorage.setItem('selectedDate', value)
        updateDate(value)
    }

    return {selectedDate, setSelectedDate}
}
