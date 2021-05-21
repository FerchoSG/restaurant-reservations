import React from 'react'
import { Link } from 'react-router-dom';
import NotFoundSvg from '../components/NotFoundSvg';

export default function NotFound() {
    return (
        <div className="d-flex justify-content-center align-items-center p-5 bg-nero" style={{minHeight: '100vh', minWidth: '100vw'}}>
            <div className="not-found-body">
                <NotFoundSvg/>
                <main className="d-flex flex-column justify-content-center align-items-center gap-4 mt-4">
                    <h1 className="display-3">Page Not Found</h1>
                    <Link to="/" className="btn outline-bianco color-bianco fw-bold btn-lg">Volver a la pagina de inicio</Link>
                </main>

            </div>
        </div>
    )
}
