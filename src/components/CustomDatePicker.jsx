import React  from 'react'
import dayjs from 'dayjs'
import 'dayjs/locale/es'
import {DatePicker} from '@material-ui/pickers'

export default function CustomDatePicker({selectedDate, handleDateChange}) {

    const handleChange = (value) => {
        var formattedDate = dayjs(value).locale('cr').format('YYYY-MM-DD')
        handleDateChange(formattedDate)
    }

    return (
        <div className="d-flex flex-column">
        <div className="">
            <label htmlFor="test" className="color-nero fw-bold">Fecha seleccionada:</label>
            {/* <input 
                type="date" id="test" 
                pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"
                className="form-control" 
                value={test}
                onChange={({target}) => handleChange(target.value)} /> */}

                <DatePicker 
                    autoOk
                    // format="YYYY-MM-DD"
                    value={selectedDate} 
                    onChange={handleChange} />
        </div>

    </div>

    )
}
