import React, {useState, useContext,memo,Fragment} from 'react'
import { Link, useLocation} from 'react-router-dom'
import {Accordion, useAccordionButton, AccordionContext} from 'react-bootstrap'


function CustomToggle({ children, eventKey, onClick }) {

    const { activeEventKey } = useContext(AccordionContext);

    const decoratedOnClick = useAccordionButton(eventKey, (active) => onClick({state: !active, eventKey: eventKey}));

    const isCurrentEventKey = activeEventKey === eventKey;
  
    return (
      <Link to="#" aria-expanded={isCurrentEventKey ? 'true' : 'false'} className="nav-link" role="button" onClick={(e) => {
        decoratedOnClick(isCurrentEventKey)
      }}>
        {children}
      </Link>
    );
  }

const VerticalNav = memo((props) => {
    const [activeMenu, setActiveMenu] = useState(false)
    const [active, setActive] = useState('')
    //location
    let location = useLocation();
    return (
       <Fragment>
            <Accordion as="ul" className="navbar-nav iq-main-menu">
                {/* <li className="nav-item static-item">
                    <Link className="nav-link static-item disabled" to="#" tabIndex="-1">
                        <span className="default-icon">Home</span>
                        <span className="mini-icon">-</span>
                    </Link>
                </li> */}
                <li className={`${location.pathname === '/dashboard' ? 'active' : ''} nav-item `}>
                    <Link className="nav-link" to="/dashboard">
                      <i className="icon">...</i>
                      <span className="item-name">대시보드</span>
                    </Link>

                    
                </li>
                {/* ✅ 사용자입력 메뉴 추가 */}
                <li className={`${location.pathname === '/userinput' ? 'active' : ''} nav-item`}>
                  <Link
                    className={`${location.pathname === '/userinput' ? 'active' : ''} nav-link`}
                    aria-current="page"
                    to="/userinput"
                  >
                    <i className="icon">
                      <svg width="20" viewBox="0 0 24 24" fill="none">
                        <path
                          fill="currentColor"
                          d="M4 4H20V6H4V4ZM4 9H20V11H4V9ZM4 14H14V16H4V14ZM4 19H10V21H4V19Z"
                        />
                      </svg>
                    </i>
                    <span className="item-name">사용자입력</span>
                  </Link>
                </li>
                {/* <li><hr className="hr-horizontal"/></li>
                <li className="nav-item static-item">
                    <Link className="nav-link static-item disabled" to="#" tabIndex="-1">
                        <span className="default-icon">Pages</span>
                        <span className="mini-icon">-</span>
                    </Link>
                </li> */}
                {/* <Accordion.Item as="li" eventKey="sidebar-special" bsPrefix={`nav-item ${active === 'special' ? 'active' : ''} `} onClick={() => setActive('special')}>
                <CustomToggle eventKey="sidebar-special" onClick={(activeKey) => setActiveMenu(activeKey)}>
                        <i className="icon">
                            <svg width="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path opacity="0.4" d="M13.3051 5.88243V6.06547C12.8144 6.05584 12.3237 6.05584 11.8331 6.05584V5.89206C11.8331 5.22733 11.2737 4.68784 10.6064 4.68784H9.63482C8.52589 4.68784 7.62305 3.80152 7.62305 2.72254C7.62305 2.32755 7.95671 2 8.35906 2C8.77123 2 9.09508 2.32755 9.09508 2.72254C9.09508 3.01155 9.34042 3.24276 9.63482 3.24276H10.6064C12.0882 3.2524 13.2953 4.43736 13.3051 5.88243Z" fill="currentColor"></path>
                                <path fillRule="evenodd" clipRule="evenodd" d="M15.164 6.08279C15.4791 6.08712 15.7949 6.09145 16.1119 6.09469C19.5172 6.09469 22 8.52241 22 11.875V16.1813C22 19.5339 19.5172 21.9616 16.1119 21.9616C14.7478 21.9905 13.3837 22.0001 12.0098 22.0001C10.6359 22.0001 9.25221 21.9905 7.88813 21.9616C4.48283 21.9616 2 19.5339 2 16.1813V11.875C2 8.52241 4.48283 6.09469 7.89794 6.09469C9.18351 6.07542 10.4985 6.05615 11.8332 6.05615C12.3238 6.05615 12.8145 6.05615 13.3052 6.06579C13.9238 6.06579 14.5425 6.07427 15.164 6.08279ZM10.8518 14.7459H9.82139V15.767C9.82139 16.162 9.48773 16.4896 9.08538 16.4896C8.67321 16.4896 8.34936 16.162 8.34936 15.767V14.7459H7.30913C6.90677 14.7459 6.57311 14.4279 6.57311 14.0233C6.57311 13.6283 6.90677 13.3008 7.30913 13.3008H8.34936V12.2892C8.34936 11.8942 8.67321 11.5667 9.08538 11.5667C9.48773 11.5667 9.82139 11.8942 9.82139 12.2892V13.3008H10.8518C11.2542 13.3008 11.5878 13.6283 11.5878 14.0233C11.5878 14.4279 11.2542 14.7459 10.8518 14.7459ZM15.0226 13.1177H15.1207C15.5231 13.1177 15.8567 12.7998 15.8567 12.3952C15.8567 12.0002 15.5231 11.6727 15.1207 11.6727H15.0226C14.6104 11.6727 14.2866 12.0002 14.2866 12.3952C14.2866 12.7998 14.6104 13.1177 15.0226 13.1177ZM16.7007 16.4318H16.7988C17.2012 16.4318 17.5348 16.1139 17.5348 15.7092C17.5348 15.3143 17.2012 14.9867 16.7988 14.9867H16.7007C16.2885 14.9867 15.9647 15.3143 15.9647 15.7092C15.9647 16.1139 16.2885 16.4318 16.7007 16.4318Z" fill="currentColor"></path>
                            </svg>
                        </i>
                        <span className="item-name">Special Pages</span>
                        <i className="right-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </i>
                    </CustomToggle>
                    <Accordion.Collapse eventKey="sidebar-special" >
                        <ul className="sub-nav">
                            <li className="nav-item">
                                <Link className={`${location.pathname === '/dashboard/special-pages/billing' ? 'active' : ''} nav-link`} to="/dashboard/special-pages/billing">
                                <i className="icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" viewBox="0 0 24 24" fill="currentColor">
                                            <g>
                                            <circle cx="12" cy="12" r="8" fill="currentColor"></circle>
                                            </g>
                                        </svg>
                                    </i>
                                <i className="sidenav-mini-icon"> B </i>
                                <span className="item-name">Billing</span>
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className={`${location.pathname === '/dashboard/special-pages/calender' ? 'active' : ''} nav-link`} to="/dashboard/special-pages/calender">
                                    <i className="icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" viewBox="0 0 24 24" fill="currentColor">
                                            <g>
                                            <circle cx="12" cy="12" r="8" fill="currentColor"></circle>
                                            </g>
                                        </svg>
                                    </i>
                                    <i className="sidenav-mini-icon"> C </i>
                                    <span className="item-name">Calender</span>
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className={`${location.pathname === '/dashboard/special-pages/kanban' ? 'active' : '' } nav-link`} to="/dashboard/special-pages/kanban">
                                    <i className="icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="10" viewBox="0 0 24 24" fill="currentColor">
                                                <g>
                                                <circle cx="12" cy="12" r="8" fill="currentColor"></circle>
                                                </g>
                                            </svg>
                                        </i>
                                    <i className="sidenav-mini-icon"> K </i>
                                    <span className="item-name">kanban</span>
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className={`${location.pathname === '/dashboard/special-pages/pricing' ? 'active' : ''} nav-link`} to="/dashboard/special-pages/pricing">
                                    <i className="icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" viewBox="0 0 24 24" fill="currentColor">
                                            <g>
                                            <circle cx="12" cy="12" r="8" fill="currentColor"></circle>
                                            </g>
                                        </svg>
                                    </i>
                                    <i className="sidenav-mini-icon"> P </i>
                                    <span className="item-name">Pricing</span>
                                </Link>
                            </li>
                            <li className="nav-item">
                            <Link className={`${location.pathname === '/dashboard/special-pages/rtl-support' ? 'active' : ''} nav-link`} to="/dashboard/special-pages/rtl-support">
                                <i className="icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" viewBox="0 0 24 24" fill="currentColor">
                                        <g>
                                        <circle cx="12" cy="12" r="8" fill="currentColor"></circle>
                                        </g>
                                    </svg>
                                </i>
                                <i className="sidenav-mini-icon"> RS </i>
                                <span className="item-name">RTL Support</span>
                            </Link>
                        </li>

                            <li className="nav-item">
                                <Link className={`${location.pathname === '/dashboard/special-pages/timeline' ? 'active' : ''} nav-link`} to="/dashboard/special-pages/timeline">
                                    <i className="icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" viewBox="0 0 24 24" fill="currentColor">
                                            <g>
                                            <circle cx="12" cy="12" r="8" fill="currentColor"></circle>
                                            </g>
                                        </svg>
                                    </i>
                                    <i className="sidenav-mini-icon"> T </i>
                                    <span className="item-name">Timeline</span>
                                </Link>
                            </li>
                        </ul>
                    </Accordion.Collapse>
                </Accordion.Item> */}
                {/* <Accordion.Item as="li" className={`${activeMenu === '0' ? 'active' : ''}`} eventKey="sidebar-auth"  bsPrefix={`nav-item ${active === 'auth' ? 'active' : ''} `} onClick={() => setActive('auth')}>
                    <CustomToggle eventKey="sidebar-auth" onClick={(activeKey) => setActiveMenu(activeKey)}>
                        <i className="icon">
                            <svg width="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path opacity="0.4" d="M12.0865 22C11.9627 22 11.8388 21.9716 11.7271 21.9137L8.12599 20.0496C7.10415 19.5201 6.30481 18.9259 5.68063 18.2336C4.31449 16.7195 3.5544 14.776 3.54232 12.7599L3.50004 6.12426C3.495 5.35842 3.98931 4.67103 4.72826 4.41215L11.3405 2.10679C11.7331 1.96656 12.1711 1.9646 12.5707 2.09992L19.2081 4.32684C19.9511 4.57493 20.4535 5.25742 20.4575 6.02228L20.4998 12.6628C20.5129 14.676 19.779 16.6274 18.434 18.1581C17.8168 18.8602 17.0245 19.4632 16.0128 20.0025L12.4439 21.9088C12.3331 21.9686 12.2103 21.999 12.0865 22Z" fill="currentColor"></path>
                                <path d="M11.3194 14.3209C11.1261 14.3219 10.9328 14.2523 10.7838 14.1091L8.86695 12.2656C8.57097 11.9793 8.56795 11.5145 8.86091 11.2262C9.15387 10.9369 9.63207 10.934 9.92906 11.2193L11.3083 12.5451L14.6758 9.22479C14.9698 8.93552 15.448 8.93258 15.744 9.21793C16.041 9.50426 16.044 9.97004 15.751 10.2574L11.8519 14.1022C11.7049 14.2474 11.5127 14.3199 11.3194 14.3209Z" fill="currentColor"></path>
                            </svg>
                        </i>
                        <span className="item-name">Authentication</span>
                        <i className="right-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </i>
                    </CustomToggle>
                    <Accordion.Collapse eventKey="sidebar-auth">
                        <ul className="sub-nav">
                            <li className="nav-item">
                                <Link className={`${location.pathname === '/auth/sign-in' ? 'active' : ''} nav-link`} to="/auth/sign-in">
                                    <i className="icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" viewBox="0 0 24 24" fill="currentColor">
                                            <g>
                                            <circle cx="12" cy="12" r="8" fill="currentColor"></circle>
                                            </g>
                                        </svg>
                                    </i>
                                    <i className="sidenav-mini-icon"> L </i>
                                    <span className="item-name">Login</span>
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className={`${location.pathname === '/auth/sign-up' ? 'active' : '' } nav-link`} to="/auth/sign-up">
                                    <i className="icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" viewBox="0 0 24 24" fill="currentColor">
                                            <g>
                                            <circle cx="12" cy="12" r="8" fill="currentColor"></circle>
                                            </g>
                                        </svg>
                                    </i>
                                    <i className="sidenav-mini-icon"> R </i>
                                    <span className="item-name">Register</span>
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className={`${location.pathname === '/auth/confirm-mail' ? 'active' : ''} nav-link`} to="/auth/confirm-mail">
                                    <i className="icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" viewBox="0 0 24 24" fill="currentColor">
                                            <g>
                                            <circle cx="12" cy="12" r="8" fill="currentColor"></circle>
                                            </g>
                                        </svg>
                                    </i>
                                    <i className="sidenav-mini-icon"> C </i>
                                    <span className="item-name">Confirm Mail</span>
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className={`${location.pathname === '/auth/lock-screen' ? 'active' : ''} nav-link`} to="/auth/lock-screen">
                                    <i className="icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" viewBox="0 0 24 24" fill="currentColor">
                                            <g>
                                            <circle cx="12" cy="12" r="8" fill="currentColor"></circle>
                                            </g>
                                        </svg>
                                    </i>
                                    <i className="sidenav-mini-icon"> L </i>
                                    <span className="item-name">Lock Screen</span>
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className={`${location.pathname === '/auth/recoverpw' ? 'active' : ''} nav-link`} to="/auth/recoverpw">
                                    <i className="icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" viewBox="0 0 24 24" fill="currentColor">
                                            <g>
                                            <circle cx="12" cy="12" r="8" fill="currentColor"></circle>
                                            </g>
                                        </svg>
                                    </i>
                                    <i className="sidenav-mini-icon"> R </i>
                                    <span className="item-name">Recover password</span>
                                </Link>
                            </li>
                        </ul>
                    </Accordion.Collapse>
                </Accordion.Item> */}
                {/* <li className="nav-item">
                <Link className={`${location.pathname === '/dashboard/admin/admin' ? 'active' : ''} nav-link`} to="/dashboard/admin/admin">
                        <i className="icon">
                            <svg width="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M7.7688 8.71387H16.2312C18.5886 8.71387 20.5 10.5831 20.5 12.8885V17.8254C20.5 20.1308 18.5886 22 16.2312 22H7.7688C5.41136 22 3.5 20.1308 3.5 17.8254V12.8885C3.5 10.5831 5.41136 8.71387 7.7688 8.71387ZM11.9949 17.3295C12.4928 17.3295 12.8891 16.9419 12.8891 16.455V14.2489C12.8891 13.772 12.4928 13.3844 11.9949 13.3844C11.5072 13.3844 11.1109 13.772 11.1109 14.2489V16.455C11.1109 16.9419 11.5072 17.3295 11.9949 17.3295Z" fill="currentColor"></path>
                            <path opacity="0.4" d="M17.523 7.39595V8.86667C17.1673 8.7673 16.7913 8.71761 16.4052 8.71761H15.7447V7.39595C15.7447 5.37868 14.0681 3.73903 12.0053 3.73903C9.94257 3.73903 8.26594 5.36874 8.25578 7.37608V8.71761H7.60545C7.20916 8.71761 6.83319 8.7673 6.47754 8.87661V7.39595C6.4877 4.41476 8.95692 2 11.985 2C15.0537 2 17.523 4.41476 17.523 7.39595Z" fill="currentColor"></path>
                            </svg>
                        </i>
                        <span className="item-name">Admin</span>
                    </Link>
                </li> */}
                {/* <li><hr className="hr-horizontal"/></li>
                <li className="nav-item static-item">
                    <Link className="nav-link static-item disabled" to="#" tabIndex="-1">
                        <span className="default-icon">Elements</span>
                        <span className="mini-icon">-</span>
                    </Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link" to="/">
                        <i className="icon">
                            <svg width="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">                                
                                <path opacity="0.4" d="M2 11.0786C2.05 13.4166 2.19 17.4156 2.21 17.8566C2.281 18.7996 2.642 19.7526 3.204 20.4246C3.986 21.3676 4.949 21.7886 6.292 21.7886C8.148 21.7986 10.194 21.7986 12.181 21.7986C14.176 21.7986 16.112 21.7986 17.747 21.7886C19.071 21.7886 20.064 21.3566 20.836 20.4246C21.398 19.7526 21.759 18.7896 21.81 17.8566C21.83 17.4856 21.93 13.1446 21.99 11.0786H2Z" fill="currentColor"></path>                                
                                <path d="M11.2451 15.3843V16.6783C11.2451 17.0923 11.5811 17.4283 11.9951 17.4283C12.4091 17.4283 12.7451 17.0923 12.7451 16.6783V15.3843C12.7451 14.9703 12.4091 14.6343 11.9951 14.6343C11.5811 14.6343 11.2451 14.9703 11.2451 15.3843Z" fill="currentColor"></path>                                
                                <path fillRule="evenodd" clipRule="evenodd" d="M10.211 14.5565C10.111 14.9195 9.762 15.1515 9.384 15.1015C6.833 14.7455 4.395 13.8405 2.337 12.4815C2.126 12.3435 2 12.1075 2 11.8555V8.38949C2 6.28949 3.712 4.58149 5.817 4.58149H7.784C7.972 3.12949 9.202 2.00049 10.704 2.00049H13.286C14.787 2.00049 16.018 3.12949 16.206 4.58149H18.183C20.282 4.58149 21.99 6.28949 21.99 8.38949V11.8555C21.99 12.1075 21.863 12.3425 21.654 12.4815C19.592 13.8465 17.144 14.7555 14.576 15.1105C14.541 15.1155 14.507 15.1175 14.473 15.1175C14.134 15.1175 13.831 14.8885 13.746 14.5525C13.544 13.7565 12.821 13.1995 11.99 13.1995C11.148 13.1995 10.433 13.7445 10.211 14.5565ZM13.286 3.50049H10.704C10.031 3.50049 9.469 3.96049 9.301 4.58149H14.688C14.52 3.96049 13.958 3.50049 13.286 3.50049Z" fill="currentColor"></path>
                            </svg> 
                        </i>
                        <span className="item-name">Components</span>
                    </Link>
                </li> */}
                {/* <Accordion.Item as="li" eventKey="sidebar-widget" bsPrefix={` ${location.pathname === '/dashboard/widget/widgetbasic' || location.pathname === '/dashboard/widget/widgetchart' || location.pathname === '/dashboard/widget/widgetcard' ? 'active' : '' || active === 'widget' ? 'active' : ''} nav-item`} onClick={() => setActive('widget')}>
                    <CustomToggle eventKey="sidebar-widget" active={activeMenu === 'sidebar-widget' ? true : false} onClick={(activeKey) => setActiveMenu(activeKey)}>
                        <i className="icon">
                            <svg width="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path opacity="0.4" d="M21.25 13.4764C20.429 13.4764 19.761 12.8145 19.761 12.001C19.761 11.1865 20.429 10.5246 21.25 10.5246C21.449 10.5246 21.64 10.4463 21.78 10.3076C21.921 10.1679 22 9.97864 22 9.78146L21.999 7.10415C21.999 4.84102 20.1402 3 17.8562 3H6.1442C3.8602 3 2.00122 4.84102 2.00122 7.10415L2.0002 9.86766C2.0002 10.0648 2.0792 10.2541 2.2202 10.3938C2.3612 10.5325 2.5522 10.6108 2.7512 10.6108C3.6002 10.6108 4.2402 11.2083 4.2402 12.001C4.2402 12.8145 3.5722 13.4764 2.7512 13.4764C2.3372 13.4764 2.00122 13.8093 2.00122 14.2195V16.8949C2.00122 19.158 3.8592 21 6.1442 21H17.8582C20.1432 21 22.0012 19.158 22.0012 16.8949V14.2195C22.0012 13.8093 21.6652 13.4764 21.2512 13.4764Z" fill="currentColor"></path>
                                <path d="M15.4303 11.5887L14.2513 12.7367L14.5303 14.3597C14.5783 14.6407 14.4653 14.9177 14.2343 15.0837C14.0053 15.2517 13.7063 15.2727 13.4543 15.1387L11.9993 14.3737L10.5413 15.1397C10.4333 15.1967 10.3153 15.2267 10.1983 15.2267C10.0453 15.2267 9.89434 15.1787 9.76434 15.0847C9.53434 14.9177 9.42134 14.6407 9.46934 14.3597L9.74734 12.7367L8.56834 11.5887C8.36434 11.3907 8.29334 11.0997 8.38134 10.8287C8.47034 10.5587 8.70034 10.3667 8.98134 10.3267L10.6073 10.0897L11.3363 8.61268C11.4633 8.35868 11.7173 8.20068 11.9993 8.20068H12.0013C12.2843 8.20168 12.5383 8.35968 12.6633 8.61368L13.3923 10.0897L15.0213 10.3277C15.2993 10.3667 15.5293 10.5587 15.6173 10.8287C15.7063 11.0997 15.6353 11.3907 15.4303 11.5887Z" fill="currentColor"></path>
                            </svg>
                        </i>
                        <span className="item-name">widget</span>
                        <i className="right-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </i>
                    </CustomToggle>
                    <Accordion.Collapse eventKey="sidebar-widget">
                        <ul className="sub-nav">
                            <li className="nav-item">
                                <Link className={`${location.pathname === '/dashboard/widget/widgetbasic' ? 'active' : ''} nav-link`} to="/dashboard/widget/widgetbasic">
                                    <i className="icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" viewBox="0 0 24 24" fill="currentColor">
                                            <g>
                                            <circle cx="12" cy="12" r="8" fill="currentColor"></circle>
                                            </g>
                                        </svg>
                                    </i>
                                    <i className="sidenav-mini-icon"> W </i>
                                    <span className="item-name">Widget Basic</span>
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className={`${location.pathname === '/dashboard/widget/widgetchart' ? 'active' : ''} nav-link`} to="/dashboard/widget/widgetchart">
                                    <i className="icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" viewBox="0 0 24 24" fill="currentColor">
                                            <g>
                                            <circle cx="12" cy="12" r="8" fill="currentColor"></circle>
                                            </g>
                                        </svg>
                                    </i>
                                    <i className="sidenav-mini-icon"> W </i>
                                    <span className="item-name">Widget Chart</span>
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className={`${location.pathname === '/dashboard/widget/widgetcard' ? 'active' : ''} nav-link`} to="/dashboard/widget/widgetcard">
                                    <i className="icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" viewBox="0 0 24 24" fill="currentColor">
                                            <g>
                                            <circle cx="12" cy="12" r="8" fill="currentColor"></circle>
                                            </g>
                                        </svg>
                                    </i>
                                    <i className="sidenav-mini-icon"> W </i>
                                    <span className="item-name">Widget Card</span>
                                </Link>
                            </li>
                        </ul>
                    </Accordion.Collapse>
                </Accordion.Item> */}
                {/*  
                <Accordion.Item as="li" eventKey="sidebar-table" bsPrefix={`nav-item ${active === 'table' ? 'active' : ''} `} onClick={() => setActive('table')}>
                 <CustomToggle eventKey="sidebar-table" onClick={(activeKey) => setActiveMenu(activeKey)}>
                        <i className="icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M2 5C2 4.44772 2.44772 4 3 4H8.66667H21C21.5523 4 22 4.44772 22 5V8H15.3333H8.66667H2V5Z" fill="currentColor" stroke="currentColor"/>
                                <path d="M6 8H2V11M6 8V20M6 8H14M6 20H3C2.44772 20 2 19.5523 2 19V11M6 20H14M14 8H22V11M14 8V20M14 20H21C21.5523 20 22 19.5523 22 19V11M2 11H22M2 14H22M2 17H22M10 8V20M18 8V20" stroke="currentColor"/>
                            </svg>
                        </i>
                        <span className="item-name">Table</span>
                        <i className="right-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </i>
                    </CustomToggle>
                    <Accordion.Collapse eventKey="sidebar-table">
                        <ul className="sub-nav">
                            <li className="nav-item">
                                <Link className={`${location.pathname === '/dashboard/table/bootstrap-table' ? 'active' :''} nav-link`} to="/dashboard/table/bootstrap-table">
                                    <i className="icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" viewBox="0 0 24 24" fill="currentColor">
                                            <g>
                                            <circle cx="12" cy="12" r="8" fill="currentColor"></circle>
                                            </g>
                                        </svg>
                                    </i>
                                    <i className="sidenav-mini-icon"> B </i>
                                    <span className="item-name">Bootstrap Table</span>
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className={`${location.pathname === '/dashboard/table/table-data' ? 'active' : ''} nav-link`} to="/dashboard/table/table-data">
                                    <i className="icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" viewBox="0 0 24 24" fill="currentColor">
                                            <g>
                                            <circle cx="12" cy="12" r="8" fill="currentColor"></circle>
                                            </g>
                                        </svg>
                                    </i>
                                    <i className="sidenav-mini-icon"> D </i>
                                    <span className="item-name">Datatable</span>
                                </Link>
                            </li>
                        </ul>
                    </Accordion.Collapse>
                </Accordion.Item>
                */}
            </Accordion>
       </Fragment>
    )
})


export default VerticalNav
