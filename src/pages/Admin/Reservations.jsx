import React from 'react'
import EmptyCard from '../../components/Admin/EmptyCard'
import AdminLayout from '../../layouts/AdminLayout'

export default function Reservations() {
    return (
        <div>
            <AdminLayout title="Reservas realizadas">
                <EmptyCard 
                    message="No tienes reservas registradas aún" 
                    btn={false}
                />
            </AdminLayout>
        </div>
    )
}
