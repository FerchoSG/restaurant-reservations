import React, {useEffect, useState} from 'react'

export default function CustomDatePicker({selectedDate, handleDateChange}) {
    const [test, setTest] = useState(()=>{
        let date = new Date()
        let month = date.getMonth() + 1 > 9 ? date.getMonth() + 1 : `0${date.getMonth() + 1}`
        let day = date.getDate() > 9 ? date.getDate() : `0${date.getDate()}`
        return `${date.getFullYear()}-${month}-${day}`
    })

    const handleChange = (value) => {
        let date = new Date(value)
        let month = date.getMonth() + 1 > 9 ? date.getMonth() + 1 : `0${date.getMonth() + 1}`
        let day = date.getDate() > 9 ? date.getDate() : `0${date.getDate()}`
        let formattedDate = `${date.getFullYear()}-${month}-${day}`
        console.log(formattedDate)
        setTest(formattedDate)
        handleDateChange(formattedDate)
    }

    useEffect(() =>{
        if(selectedDate){
            setTest(selectedDate)
        }
    },[selectedDate])
    return (
        <div className="container d-flex flex-column justify-content-center align-items-center mb-3">
        <div className="col-lg-3 col-md-4">
            <label htmlFor="test" className="color-nero fw-bold">Fecha seleccionada:</label>
            <input 
                type="date" id="test" 
                pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"
                className="form-control" 
                value={test}
                onChange={({target}) => handleChange(target.value)} />

        </div>

    </div>

    )
}
