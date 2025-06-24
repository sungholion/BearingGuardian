import React from 'react'
import { Link} from 'react-router-dom'

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-body">
                <ul className="left-panel list-inline mb-0 p-0">
                    {/* <li className="list-inline-item"><Link to="/dashboard/extra/privacy-policy">Privacy Policy</Link></li>
                    <li className="list-inline-item"><Link to="/dashboard/extra/terms-of-service">Terms of Use</Link></li> */}
                </ul>
                <div className="right-panel">
                    ©Bearing Monitoring System 2025. All rights reserved.
                </div>
            </div>
        </footer>
    )
}

export default Footer
