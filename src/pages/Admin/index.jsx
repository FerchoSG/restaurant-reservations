import React, {useEffect, useState} from 'react'
import AdminLayout from '../../layouts/AdminLayout'
import {getall} from '../../services/restaurantService'

import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import { addDays } from 'date-fns';
import { DateRangePicker } from 'react-date-range';

import dayjs from 'dayjs'
import 'dayjs/locale/es'
import ES from '../../services/es.json'

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
    const [mealtimes, setMealtimes] = useState([])
    const [restaurant, setRestaurant] = useState('')
   
    const fileType =
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
  const fileExtension = ".xlsx";
    
    const exportToCSV = async  () => {
        setLoading(true);
        const docs = await getall({dates, mealTime, restaurant})
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
    useEffect(() => {
        if(restaurant){
            restaurant === 'Italiano' ? setMealtimes(['lunch', 'dinner']) : setMealtimes(['breakfast', 'dinner'])
        }

    }, [restaurant])

    function getDates(startDate, stopDate) {
        const dateArray = [];
        let currentDate = dayjs(startDate);
        while (currentDate <= stopDate) {
            
            dateArray.push(dayjs(currentDate).locale('cr').format('YYYY-MM-DD'));
            currentDate = currentDate.add(1,'day')
        }
        setDates(dateArray)
    }

    const handleMealtimechange = (mealtime)=>{
        setMealTime(mealtime)
    }

    const handleRestaurantchange = (restaurant)=>{
        setRestaurant(restaurant)
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

                    <section className="d-flex gap-4">
                    <div className="mb-3 form-group">
                        <label htmlFor="restaurant">Restaurante</label>
                        <select name="restaurant" id="restaurant" className="form-select" 
                        onChange={ ({target}) => handleRestaurantchange(target.value)}>
                            <option value="">Elige un restaurante</option>
                            <option value="Ti-Cain">Ti-Cain</option>
                            <option value="Italiano">Italiano</option>
                        </select>
                    </div>
                    <div className="mb-3 form-group">
                        <label htmlFor="mealtime">Tiempo de comida</label>
                        <select name="mealtime" id="mealtime" className="form-select" 
                        onChange={ ({target}) => handleMealtimechange(target.value)}>
                            <option value="">Elige un tiempo de comida</option>
                            {mealtimes.map((mealtime, index) => {
                                return <option key={index} value={mealtime}> {ES[mealtime]} </option>
                            })}
                        </select>
                    </div>
                    </section>
                    
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
