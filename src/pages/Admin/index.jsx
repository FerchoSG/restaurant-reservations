import React, {useEffect, useState} from 'react'
import AdminLayout from '../../layouts/AdminLayout'
import {getall} from '../../services/restaurantService'

import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import { addDays } from 'date-fns';
import { DateRangePicker } from 'react-date-range';

import dayjs from 'dayjs'
import 'dayjs/locale/es'

import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import Spinner from '../../components/Spinner';

export default function Admin() {
    const [dateRange, setDateRange] = useState([{
        startDate: new Date(),
        endDate: addDays(new Date(), 7),
        key: 'selection'
      }])

    const [dates, setDates] = useState([])
    const [loading, setLoading] = useState(false)
    const [mealTime, setMealTime] = useState('breakfast')
   
    const fileType =
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
  const fileExtension = ".xlsx";
    
    const exportToCSV = async  () => {
        setLoading(true);
        const docs = await getall(dates, mealTime)
        let startDate = dayjs(dateRange[0].startDate).locale('cr').format('YYYY-MM-DD')
        let endDate = dayjs(dateRange[0].endDate).locale('cr').format('YYYY-MM-DD')
        let time = mealTime === 'breakfast' ? 'desayuno' : 'cena';
        let fileName = `reporte de ${time} entre ${startDate} y ${endDate}`

        setTimeout(() => {
            const ws = XLSX.utils.json_to_sheet(docs);
            const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
            const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
            const data = new Blob([excelBuffer], { type: fileType });
            FileSaver.saveAs(data, fileName + fileExtension);
            setLoading(false)
        }, 3000);
    };

    useEffect(() => {
        getDates(dateRange[0].startDate, dateRange[0].endDate)

    }, [dateRange])

    function getDates(startDate, stopDate) {
        const dateArray = [];
        let currentDate = dayjs(startDate);
        while (currentDate <= stopDate) {
            
            dateArray.push(dayjs(currentDate).locale('cr').format('YYYY-MM-DD'));
            currentDate = currentDate.add(1,'day')
        }
        setDates(dateArray)
    }

    return (
        <div>
            <AdminLayout title="Inicio">
                {/* <h1>Inicio</h1> */}
                <div className="p-4 container d-flex flex-column justify-content-center align-items-center">
                    <DateRangePicker
                        className="mb-3"
                        onChange={item => setDateRange([item.selection])}
                        showSelectionPreview={true}
                        moveRangeOnFirstSelection={false}
                        ranges={dateRange}
                    />

                    <div className="mb-3">
                        <div className="form-check form-check-inline">
                            <input 
                                className="form-check-input" type="radio" name="inlineRadioOptions" checked={mealTime === 'breakfast'} 
                                id="inlineRadio1" onChange={({target}) => setMealTime(target.value) } value="breakfast"/>
                            <label className="form-check-label" htmlFor="inlineRadio1">Desayuno</label>
                        </div>
                        <div className="form-check form-check-inline">
                            <input 
                                className="form-check-input" type="radio" name="inlineRadioOptions" checked={mealTime === 'dinner'}
                                id="inlineRadio2" value="dinner" onChange={({target}) => setMealTime(target.value) } />
                            <label className="form-check-label" htmlFor="inlineRadio2">Cena</label>
                        </div>
                    </div>
                        <button
                            disabled={loading} 
                            className="btn bg-light-g btn-lg w-50 " onClick={exportToCSV}>
                            { !loading ?
                             'Exportar a Excel': 
                             <Spinner/>
                            }
                        </button>
                        { loading && <p>Generando reporte...</p> }
                </div>
            </AdminLayout>
        </div>
    )
}
