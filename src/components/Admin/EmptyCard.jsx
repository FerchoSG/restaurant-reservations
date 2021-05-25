import React from 'react'

export default function EmptyCard({message, btn}= {btn: true}) {
    return (
        <div 
            className="d-flex justify-content-center align-items-center" 
            style={{minHeight: '60vh'}}>
            {/* <div className="card col-4">
                {message}
            </div> */}
            <div 
                className="card shadow py-2" 
                style={{maxWidth: '22rem', borderRadius: '1rem'}}>
                <div className="card-body d-flex flex-column justify-content-center align-items-center">
                    <p className="card-text fs-4 text-center">
                    {message}
                    </p>
                    {btn ?? 
                    <button className="btn bg-main">Agregar</button>}
                </div>
            </div>
        </div>
    )
}
