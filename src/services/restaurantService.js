import { db } from "./firebase";

export async function getall({dates, mealTime, restaurant}){
    let times = await getSchedules(mealTime)

    console.log({dates, mealTime, restaurant})
    console.log(times)
    let dayTime = mealTime === 'breakfast' ? 'am' : 'pm'

    let docs = []
    dates.map(date =>
        times.data.map(async (time) => {
            let mealTimeDocs = await 
                    db.collection(date)
                    .doc(restaurant)
                    .collection(mealTime)
                    .doc(time)
                    .collection('reservations')
                    .get()
            
            mealTimeDocs.forEach(mealTimeDoc => {
                if(mealTimeDoc.id !== 'limit' && mealTimeDoc.id !== 'reservation-counter'){
                    let newDoc = mealTimeDoc.data()
                    let formattedDoc = {
                        'detalles': newDoc.details,
                        'pax': newDoc.pax,
                        'estado': newDoc.status,
                        'habitacion': newDoc.room,
                        'reservado por': newDoc.bookedby,
                        'fecha de creacion': date,
                        'hora': `${time[0]}:${time[1]}${time[2]} ${dayTime}`,
                        'usuario': newDoc.account,
                        'restaurante': restaurant
                    }
                    docs.push(formattedDoc)
                }
            })
        })
    )

    return docs
}

async function getSchedules(mealTime) {
    let schedules = await db.collection('schedules').doc(mealTime).get()
    return schedules.data()
}

export async function getDefaultPaxLImit({restaurant, mealtime}) {
    const schedules = await db
    .collection('schedules')
    .doc('settings')
    .collection('limitPax')
    .doc(restaurant)
    .get()

    if(schedules.exists)
        return schedules.data()[mealtime]
}

export async function getCurrentDayPaxLImit({date, restaurant, mealtime}){
    const limit = await db.collection(date)
        .doc(restaurant)
        .collection(mealtime)
        .doc('limit')
        .get()

    let currentLimit = 0
    if(limit.exists){
        const {data} = limit.data()
        currentLimit = data
    }else{
        currentLimit = await getDefaultPaxLImit({restaurant, mealtime})
    }

    return currentLimit
}


export async function createReservation({date, data, hour, mealtime, currentUser, restaurant}){
    data.account = currentUser.email
    const defaultPaxLimit = await getDefaultPaxLImit({restaurant, mealtime})
    await checkIfCounterOrCreate({date, mealtime, restaurant})

    await db.collection(date)
    .doc(restaurant)
    .collection(mealtime)
    .doc(hour)
    .collection('reservations')
    .doc()
    .set(data);
    
    if(mealtime !== 'lunch'){
        const limit = await db.collection(date)
            .doc(restaurant)
            .collection(mealtime)
            .doc('limit')
            .get();
        if(!limit.exists){
            await db.collection(date)
                .doc(restaurant)
                .collection(mealtime)
                .doc('limit')
                .set({data: defaultPaxLimit});
        }
    }
    updateReservationCounter({date, data, hour, mealtime, restaurant})
    updatePaxPendingCounter({date, pax: data.pax, mealtime, restaurant})
    if(mealtime === 'lunch')
        updateLunchSchedule(date, hour)
    }

export async function updateReservationStatus({date, data, hour, mealtime, restaurant}){
    data.hour = Number(data.hour)
    db.collection(date)
    .doc(restaurant)
    .collection(mealtime)
    .doc(String(hour))
    .collection('reservations')
    .doc(data.id)
    .set(data);
}
export async function updateReservation({date, data, hour, mealtime, previousReservation, currentUser, restaurant}){
    await deleteReservation({mealtime, hour: previousReservation.hour, selectedDate: date, reservation: previousReservation, restaurant})

    // updatePaxArrived({date, pax: data.pax, mealtime, restaurant})
    // updatePaxArrived({date, pax: -previousPax, mealtime, restaurant})
    // updatePaxPendingCounter({date, pax: -previousPax, mealtime, restaurant})
    // let reservationsCounter = await getReservationsCounter({date, mealtime, time: previousHour, restaurant})
    // await substractPaxDeletedFromCounter({date, mealtime, hour: previousHour, pax: previousPax, reservationsCounter: reservationsCounter.data, restaurant})

    data.status = 'pendiente'
    createReservation({date, data, hour, mealtime, currentUser, restaurant})
}
const substractPaxDeletedFromCounter = async ({date, mealtime, hour, pax, reservationsCounter, restaurant})=>{
    const counter = await db
    .collection(date)
    .doc(restaurant)
    .collection(mealtime)
    .doc(String(hour))
    .collection('counter')
    .doc('reservations')
    .get()

    if(counter.exists){
        await db.collection(date)
        .doc(restaurant)
        .collection(mealtime)
        .doc(String(hour))
        .collection('counter')
        .doc('reservations')
        .update({data: Number(reservationsCounter) - Number(pax)})
    }
}

export async function updateReservationCounter({date, data, hour, mealtime, restaurant}){
    await db
        .collection(date)
        .doc(restaurant)
        .collection(mealtime)
        .doc(hour)
        .collection('counter')
        .doc('reservations')
        .get()
        .then(async doc =>{

            if(doc.exists){
            let counter = doc.data()

            db
            .collection(date)
            .doc(restaurant)
            .collection(mealtime)
            .doc(hour)
            .collection('counter')
            .doc('reservations')
            .update({data: Number(counter.data) + Number(data.pax)})
            }else{
            await db
            .collection(date)
            .doc(restaurant)
            .collection(mealtime)
            .doc(hour)
            .collection('counter')
            .doc('reservations')
            .set({data: data.pax});
            }
    })
}


export async function getReservationsLimit({date, mealtime, restaurant}){
    const defaultPaxLimit = await getDefaultPaxLImit({mealtime, restaurant})
   const limit = await db.collection(date)
    .doc(restaurant)
    .collection(mealtime)
    .doc('limit')
    .get()

    return limit.exists ? limit.data() : defaultPaxLimit
  }
 export async function getReservationsCounter({date, mealtime, time, restaurant}){
    const counter = await db.collection(date)
    .doc(restaurant)
    .collection(mealtime)
    .doc(String(time))
    .collection('counter')
    .doc('reservations')
    .get()

    return counter.exists ? counter.data() : {data: 0}
  }

export async function updatePaxLimit({date, mealtime, hour, newLimit, restaurant}){
    const limit = await db.collection(date)
    .doc(restaurant)
    .collection(mealtime)
    .doc('limit')
    .get()

    if(limit.exists ){
        await db.collection(date)
        .doc(restaurant)
        .collection(mealtime)
        .doc('limit')
        .update({data: newLimit})
    }

}
export async function updateReservationsPaxCounter({date, typeOfMeal, hour, newCounter}){
    await db.collection(date)
    .doc(typeOfMeal)
    .collection(hour)
    .doc('reservation-counter')
    .update({data: newCounter})
}

export async function deleteReservation ({mealtime, hour, selectedDate, reservation, restaurant}){
    const reservationsCounter = await getReservationsCounter({date: selectedDate, mealtime, time: hour, restaurant})
    
    // const reservationsLimit = await getReservationsLimit({date: selectedDate, mealtime, time: hour, restaurant})
    // const defaultPaxLimit = await getDefaultPaxLImit({ restaurant, mealtime})

    // const newLimit = reservationsLimit.data - reservation.pax;
    // if(reservationsLimit.data > defaultPaxLimit && newLimit > defaultPaxLimit){
    //     await updatePaxLimit({
    //     date: selectedDate,
    //     mealtime, hour, 
    //     newLimit
    //     })
    // }else if(newLimit < defaultPaxLimit){
    //     await updatePaxLimit({
    //     date: selectedDate,
    //     mealtime, hour, 
    //     newLimit: defaultPaxLimit
    //     })
    // }

    await db.collection(selectedDate)
    .doc(restaurant)
    .collection(mealtime)
    .doc(String(hour))
    .collection('reservations').doc(reservation.id).delete()
    
    if(mealtime === 'lunch'){
        let isScheduleEmpty = await checkIfScheduleIsEmpty({date: selectedDate, hour})
        if(isScheduleEmpty){
           await removeEmptyScheduleFromList({date: selectedDate, hour})
           await removeEmptyTimeList({date: selectedDate, hour})
        }
    }

    await substractPaxDeletedFromCounter({
        pax: reservation.pax, date: selectedDate, mealtime, 
        reservationsCounter: reservationsCounter.data, hour, restaurant})

    await addReservationToDeleted({reservation, date: selectedDate, hour, mealtime, restaurant})

    updatePaxArrived({date: selectedDate, mealtime, pax: -reservation.pax, restaurant})
    updatePaxPendingCounter({date: selectedDate, mealtime, pax: -reservation.pax, restaurant})
}
async function addReservationToDeleted({reservation, date, hour, mealtime, restaurant}){
    const newMealtime = `${mealtime}Deleted`
    await db.collection(date)
    .doc(restaurant)
    .collection(newMealtime)
    .doc(String(hour))
    .collection('reservations')
    .doc().set(reservation)
}

export async function getArrivedCounter(date, setState, mealTime){
    await checkIfCounterOrCreate({date, mealTime})

    db.collection(date)
    .doc(mealTime)
    .collection('counter')
    .doc('paxArrived')
    .onSnapshot((querySnapshot =>{
        let paxArrived = querySnapshot.data()
        if(paxArrived.exists){
            setState(paxArrived.data)
        }
           
    }))
}

export async function updatePaxArrived({date, pax, mealtime, restaurant}){
    
    let currentCounter = await db.collection(date)
    .doc(restaurant)
    .collection(mealtime)
    .doc('paxArrived')
    .get()

    let {data} = currentCounter.data()
    let updatedCounter = data + pax > 0 ? data + pax : 0;
    
    await db.collection(date)
    .doc(restaurant)
    .collection(mealtime)
    .doc('paxArrived')
    .set({data: updatedCounter})
}

export async function checkIfCounterOrCreate({date, mealtime, restaurant}){
    let paxArrivedCounter = await db.collection(date)
    .doc(restaurant)
    .collection(mealtime)
    .doc('paxArrived')
    .get()

    if(!paxArrivedCounter.exists){
        db.collection(date)
            .doc(restaurant)
            .collection(mealtime)
            .doc('paxArrived')
            .set({data: 0})
    }
    let paxPendingCounter = await db.collection(date)
    .doc(restaurant)
    .collection(mealtime)
    .doc('paxPending')
    .get()

    if(!paxPendingCounter.exists){
        db.collection(date)
            .doc(restaurant)
            .collection(mealtime)
            .doc('paxPending')
            .set({data: 0})
    }
}

export async function updatePaxPendingCounter({date, pax, mealtime, restaurant}){
    let currentCounter = await db.collection(date)
    .doc(restaurant)
    .collection(mealtime)
    .doc('paxPending')
    .get()

    let {data} = currentCounter.data()
    let updatedCounter = data + pax > 0 ? data + pax : 0;
    
    await db.collection(date)
    .doc(restaurant)
    .collection(mealtime)
    .doc('paxPending')
    .set({data: updatedCounter})
}

export async function getAccessCode(){
    const accessCode = await db.collection('settings').doc('accessCode').get()
    return accessCode.data()
}

async function updateLunchSchedule(date, newTime) {
    let time = Number(newTime)
    let schedule = await db.collection(date)
        .doc('Italiano')
        .collection('lunch')
        .doc('hours')
        .get()
    
    if(schedule.exists){
        let scheduleArr = schedule.data()
        
        if(!scheduleArr.data.includes(time)){
            scheduleArr.data.push(time)
            await db.collection(date)
            .doc('Italiano')
            .collection('lunch')
            .doc('hours')
            .set(scheduleArr)
        }
    }else{
        let hours = {data: [time]}
        await db.collection(date)
        .doc('Italiano')
        .collection('lunch')
        .doc('hours')
        .set(hours)
    }
}

async function checkIfScheduleIsEmpty({date, hour}){
    let reservations = await db.collection(date)
    .doc('Italiano')
    .collection('lunch')
    .doc(hour)
    .collection('reservations')
    .get()

    return reservations.empty ? true : false;
}

async function removeEmptyScheduleFromList({date, hour}){
    let schedule = await db.collection(date)
    .doc('Italiano')
    .collection('lunch')
    .doc('hours')
    .get()

    let {data} = schedule.data()
    let newSchedule = data.filter(schedule => schedule !== Number(hour))

    await db.collection(date)
    .doc('Italiano')
    .collection('lunch')
    .doc('hours')
    .set({data: newSchedule})

}

async function removeEmptyTimeList({date, hour}){
    await db.collection(date)
    .doc('Italiano')
    .collection('lunch')
    .doc(String(hour))
    .delete()
}