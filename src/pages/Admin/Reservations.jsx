import React from 'react'
import DataTable from '../../components/Admin/DataTable'
// import EmptyCard from '../../components/Admin/EmptyCard'
import AdminLayout from '../../layouts/AdminLayout'

export default function Reservations() {
    return (
        <div>
            <AdminLayout title="Reservas realizadas">
                {/* <EmptyCard 
                    message="No tienes reservas registradas aún" 
                    btn={false}
                /> */}
                <DataTable/>
            </AdminLayout>
        </div>
    )
}
