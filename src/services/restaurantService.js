import { db } from "./firebase";

export async function getall(dates, mealTime){
    let times = await getSchedules(mealTime)

    let dayTime = mealTime === 'breakfast' ? 'am' : 'pm'

    let docs = []
    dates.map(date =>
        times.data.map(async (time) => {
            let mealTimeDocs = await 
                    db.collection(date)
                    .doc(mealTime)
                    .collection(time).get()
            
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

export async function getDefaultPaxLImit() {
    let limit = await db
    .collection('schedules')
    .doc('settings').get()


    return limit.data()
}


export async function createReservation({date, data, hour, typeOfMeal, currentUser}){
    data.account = currentUser.email
    if(data.status === undefined){
        data.status = 'pendiente'
    }
    const defaultPaxLimit = await getDefaultPaxLImit()
    await checkIfCounterOrCreate({date, mealTime: typeOfMeal})
    await db
        .collection(date)
        .doc(typeOfMeal)
        .collection(hour)
        .doc()
        .set(data);

    const limit = await db.collection(date)
        .doc(typeOfMeal)
        .collection(hour)
        .doc('limit')
        .get();
    if(!limit.exists){
        await db
            .collection(date)
            .doc(typeOfMeal)
            .collection(hour)
            .doc('limit')
            .set(defaultPaxLimit);
    }
        updateReservationCounter({date, data, hour, typeOfMeal})
}

export async function updateReservationStatus({date, data, hour, typeOfMeal}){
    await db
    .collection(date)
    .doc(typeOfMeal)
    .collection(hour)
    .doc(data.id)
    .update(data)
}
export async function updateReservation({date, data, hour, typeOfMeal, id, previousHour, previousPax}){
    await db
        .collection(date)
        .doc(typeOfMeal)
        .collection(previousHour)
        .doc(id)
        .delete()
    updatePaxArrived({date, pax: data.pax, mealTime: typeOfMeal})
    updatePaxArrived({date, pax: -previousPax, mealTime: typeOfMeal})
    let reservationsCounter = await getReservationsCounter({date, typeOfMeal, time: previousHour})
    await substractPaxDeletedFromCounter({date, typeOfMeal, hour: previousHour, pax: previousPax, reservationsCounter: reservationsCounter.data})

    createReservation({date, data, hour, typeOfMeal})
}
const substractPaxDeletedFromCounter = async ({date, typeOfMeal, hour, pax, reservationsCounter})=>{
    const counter = await db
    .collection(date)
    .doc(typeOfMeal)
    .collection(hour)
    .doc('reservation-counter')
    .get()

    if(counter.exists){
        await db.collection(date)
        .doc(typeOfMeal)
        .collection(hour)
        .doc('reservation-counter')
        .update({data: Number(reservationsCounter) - Number(pax)})
    }
}

export async function updateReservationCounter({date, data, hour, typeOfMeal}){
    await db
        .collection(date)
        .doc(typeOfMeal)
        .collection(hour)
        .doc('reservation-counter')
        .get()
        .then(async doc =>{

            if(doc.exists){
            let counter = doc.data()

            db
            .collection(date)
            .doc(typeOfMeal)
            .collection(hour)
            .doc('reservation-counter')
            .update({data: Number(counter.data) + Number(data.pax)})
            }else{
            await db
            .collection(date)
            .doc(typeOfMeal)
            .collection(hour)
            .doc('reservation-counter')
            .set({data: data.pax});
            }
    })
}


export async function getReservationsLimit({date, typeOfMeal, time}){
    const defaultPaxLimit = await getDefaultPaxLImit()
   const limit = await db.collection(date)
    .doc(typeOfMeal)
    .collection(time)
    .doc('limit')
    .get()

    return limit.exists ? limit.data() : defaultPaxLimit
  }
 export async function getReservationsCounter({date, typeOfMeal, time}){
    const counter = await db.collection(date)
    .doc(typeOfMeal)
    .collection(time)
    .doc('reservation-counter')
    .get()

    return counter.exists ? counter.data() : {data: 0}
  }

export async function updatePaxLimit({date, typeOfMeal, hour, newLimit}){
    const limit = await db.collection(date)
    .doc(typeOfMeal)
    .collection(hour)
    .doc('limit')
    .get()

    if(limit.exists ){
        await db.collection(date)
        .doc(typeOfMeal)
        .collection(hour)
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

export async function deleteReservation ({typeOfMeal, hour, selectedDate, reservation}){
    const reservationsLimit = await getReservationsLimit({date: selectedDate, typeOfMeal, time: hour})
    const reservationsCounter = await getReservationsCounter({date: selectedDate, typeOfMeal, time: hour})
    const defaultPaxLimit = await getDefaultPaxLImit()

    const newLimit = reservationsLimit.data - reservation.pax;
    if(reservationsLimit.data > defaultPaxLimit.data && newLimit > defaultPaxLimit.data){
        await updatePaxLimit({
        date: selectedDate,
        typeOfMeal, hour, 
        newLimit
        })
    }else if(newLimit < defaultPaxLimit.data){
        await updatePaxLimit({
        date: selectedDate,
        typeOfMeal, hour, 
        newLimit: defaultPaxLimit.data
        })
    }

    await db.collection(selectedDate)
    .doc(typeOfMeal)
    .collection(hour).doc(reservation.id).delete()

    await substractPaxDeletedFromCounter({
        pax: reservation.pax, date: selectedDate, typeOfMeal, 
        reservationsCounter: reservationsCounter.data, hour})

    await addReservationToDeleted({reservation, date: selectedDate, hour, typeOfMeal})

    updatePaxArrived({date: selectedDate, mealTime: typeOfMeal, pax: -reservation.pax})
}
async function addReservationToDeleted({reservation, date, hour, typeOfMeal}){
    const newTypeOfMeal = `${typeOfMeal}Deleted`
    await db.collection(date)
    .doc(newTypeOfMeal)
    .collection(hour)
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
        if(paxArrived.exists)
            setState(paxArrived.data)
    }))
}

export async function updatePaxArrived({date, pax, mealTime}){
    let currentCounter = await db.collection(date)
    .doc(mealTime)
    .collection('counter')
    .doc('paxArrived')
    .get()

    let {data} = currentCounter.data()
    let updatedCounter = data + pax > 0 ? data + pax : 0;
    
    await db.collection(date)
    .doc(mealTime)
    .collection('counter')
    .doc('paxArrived')
    .set({data: updatedCounter})
}

async function checkIfCounterOrCreate({date, mealTime}){
    let currentCounter = await db.collection(date)
    .doc(mealTime)
    .collection('counter')
    .doc('paxArrived')
    .get()

    if(!currentCounter.exists){
        db.collection(date)
            .doc(mealTime)
            .collection('counter')
            .doc('paxArrived')
            .set({data: 0})
    }
}
