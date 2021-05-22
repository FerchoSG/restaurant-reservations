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
export async function updateReservation({date, data, hour, typeOfMeal, id, previousHour}){
    await db
        .collection(date)
        .doc(typeOfMeal)
        .collection(previousHour)
        .doc(id)
        .delete()

    await db
        .collection(date)
        .doc(typeOfMeal)
        .collection(hour)
        .doc(id)
        .set(data)
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
 export async function getReservationsCounter ({date, typeOfMeal, time}){
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

