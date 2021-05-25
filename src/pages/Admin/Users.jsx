import React from 'react'
import EmptyCard from '../../components/Admin/EmptyCard'
import AdminLayout from '../../layouts/AdminLayout'

export default function Users() {
    return (
        <div>
            <AdminLayout title="Usuarios registrados">
            <EmptyCard 
                    message="No hay usuarios registrados aún" 
                />
            </AdminLayout>
        </div>
    )
}
