import React from 'react'
import ReactDOM from 'react-dom'
import './styles/index.css'
import 'mdb-react-ui-kit/dist/css/mdb.min.css'
import {MuiPickersUtilsProvider} from '@material-ui/pickers'
import DayJSUtils from '@date-io/dayjs'
import esLocale from 'dayjs/locale/es-us'

import App from './App'

ReactDOM.render(
  <React.StrictMode>
    <MuiPickersUtilsProvider utils={DayJSUtils} locale={esLocale}>
      <App />
    </MuiPickersUtilsProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
