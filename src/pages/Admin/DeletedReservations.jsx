import React from 'react'
import EmptyCard from '../../components/Admin/EmptyCard'
import AdminLayout from '../../layouts/AdminLayout'

export default function DeletedReservations() {
    return (
        <div>
            <AdminLayout title="Reservas eliminadas">
                <EmptyCard 
                    message="No tienes reservas eliminadas aún" 
                    btn={false}
                />
            </AdminLayout>
        </div>
    )
}
