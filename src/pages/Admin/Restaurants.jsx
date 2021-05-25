import React from 'react'
import EmptyCard from '../../components/Admin/EmptyCard'
import AdminLayout from '../../layouts/AdminLayout'

export default function Restaurants() {
    return (
        <div>
            <AdminLayout title="Restaurantes registrados">
                <EmptyCard 
                    message="No tienes restaurantes registrados aún" 
                />
            </AdminLayout>
        </div>
    )
}
