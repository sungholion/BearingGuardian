
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
    </div>
  );
}

export default App;