import React, { useEffect } from "react";

//scss
import "./assets/scss/hope-ui.scss"
import "./assets/scss/custom.scss"
import "./assets/scss/dark.scss"
import "./assets/scss/rtl.scss"
import "./assets/scss/customizer.scss"

// Redux Selector / Action
import { useDispatch } from 'react-redux';

// import state selectors
import { setSetting } from './store/setting/actions'

function App({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setSetting());
  }, []);

  return (
    <div className="App">
      {children}
      {/* <h1>Data from FastAPI</h1>
      <ul>
        {Array.isArray(data) && data.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul> */}
    </div>
  );
}

export default App;