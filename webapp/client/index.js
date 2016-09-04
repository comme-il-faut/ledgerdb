import React from 'react';
import ReactDOM from 'react-dom';

/*
import Hello from './modules/Test.jsx';

//console.log('Hello World!');

ReactDOM.render(
  <Hello foo="12356"/>,
  document.getElementById('app')
);
*/

import AccountTypes from './modules/AccountTypes.jsx'

//var data = [{"account_type":"A","mask":1000,"description":"Asset","sign":1},{"account_type":"L","mask":2000,"description":"Liability","sign":-1},{"account_type":"E","mask":3000,"description":"Equity","sign":-1},{"account_type":"I","mask":4000,"description":"Income","sign":-1},{"account_type":"X","mask":5000,"description":"Expense","sign":1}];

ReactDOM.render(
  //<AccountTypes account_types={data}/>,
  <AccountTypes/>,
  document.getElementById('app')
);
