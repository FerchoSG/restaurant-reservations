import { db } from "./firebase";

export async function createReservation({date, data, hour, typeOfMeal}){
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
            .set({data: 20});
    }
        updateReservationCounter({date, data, hour, typeOfMeal})
}
export async function updateReservation({date, data, hour, typeOfMeal, id, previousHour, previousPax}){
    await db
        .collection(date)
        .doc(typeOfMeal)
        .collection(previousHour)
        .doc(id)
        .delete()
   
    let reservationsCounter = await getReservationsCounter({date, typeOfMeal, time: previousHour})
    await substractPaxDeletedFromCounter({date, typeOfMeal, hour: previousHour, pax: previousPax, reservationsCounter: reservationsCounter.data})

    createReservation({date, data, hour, typeOfMeal})
}
const substractPaxDeletedFromCounter = async ({date, typeOfMeal, hour, pax, reservationsCounter})=>{
    db
    .collection(date)
    .doc(typeOfMeal)
    .collection(hour)
    .doc('reservation-counter')
    .update({data: Number(reservationsCounter) - Number(pax)})
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
   const limit = await db.collection(date)
    .doc(typeOfMeal)
    .collection(time)
    .doc('limit')
    .get()

    return limit.exists ? limit.data() : {data: 20}
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
    await db.collection(date)
    .doc(typeOfMeal)
    .collection(hour)
    .doc('limit')
    .update({data: newLimit})

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

    const newLimit = reservationsLimit.data - reservation.pax;
    if(reservationsLimit.data > 20 && newLimit > 20){
        await updatePaxLimit({
        date: selectedDate,
        typeOfMeal, hour, 
        newLimit
        })
    }else if(newLimit < 20){
        await updatePaxLimit({
        date: selectedDate,
        typeOfMeal, hour, 
        newLimit: 20
        })
    }

    await db.collection(selectedDate)
    .doc(typeOfMeal)
    .collection(hour).doc(reservation.id).delete()

    await substractPaxDeletedFromCounter({
        pax: reservation.pax, date: selectedDate, typeOfMeal, 
        reservationsCounter: reservationsCounter.data, hour})

    await addReservationToDeleted({reservation, date: selectedDate, hour, typeOfMeal})
}
async function addReservationToDeleted({reservation, date, hour, typeOfMeal}){
    const newTypeOfMeal = `${typeOfMeal}-deleted`
    db.collection(date)
    .doc(newTypeOfMeal)
    .collection(hour)
    .doc().set(reservation)
}

