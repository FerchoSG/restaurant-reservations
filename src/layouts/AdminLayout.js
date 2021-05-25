import React, { useState} from 'react'
import Sidebar from '../components/Admin/Sidebar'

export default function AdminLayout({children, title}) {
    const [sidebarCollapse, setSidebarCollapse] = useState(localStorage.getItem('sidebarCollapse') ? true : false)


    const handleCollapse = () =>{
        if(!sidebarCollapse){
            localStorage.removeItem('sidebarCollapse')
        }else{
            localStorage.setItem('sidebarCollapse',true)
        }

        setSidebarCollapse(!sidebarCollapse)
    }

    return (
        <div className="d-flex" style={{minHeight: '100vh'}}>
           <Sidebar collapsed={sidebarCollapse} />
            <section className="bg-bianco p-3" style={{width: '100%'}}>
                <nav className="d-flex justify-content-between align-items-center px-3">
                    <button className="btn" onClick={handleCollapse}>
                        <i className="fa fa-bars"></i>
                    </button>
                    <h2>{title}</h2>
                </nav>
                {children}
            </section>
        </div>
    )
}
