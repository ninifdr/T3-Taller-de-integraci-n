import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import Chart from "react-google-charts";
import io from 'socket.io-client';
import $ from 'jquery';
import { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import {
  max, min
} from 'mathjs'

const socket = io('wss://le-18262636.bitzonte.com', {
  path: '/stocks'
});



$('#connect_button').on('click', function(){
  socket.connect();
  console.log('connect');
  ReactDOM.render(<h2>Connected</h2>, document.getElementById('connection'));
});

$('#disconnect_button').on('click', function(){
  socket.disconnect();
  console.log('disconect');
  ReactDOM.render(<h2>Disconnected</h2>, document.getElementById('connection'));
});

const Stocks = ({}) => {
  const [updates, setUpdates] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [exchanges, setExchanges] = useState([]);

  useEffect(() =>{
    socket.on('UPDATE', update => {
      var date = new Date(update.time*1000);
      setUpdates(currentData => [...currentData, {"ticker": update.ticker, "time": date, "value": update.value }]);
    });
    socket.emit('STOCKS');
    socket.on('STOCKS', data => {
      setStocks(currentData => data);
    });
    socket.emit('EXCHANGES');
    socket.on('EXCHANGES', data => {
      setExchanges(currentData => data);
    });
  }, []);

  var graphs = [];
  //console.log(stocks);
  //stocks.forEach(element => graphs += element.ticker);
  for(var empresa in stocks)
  {
    var elem = stocks[empresa];
    //console.log(elem);
    var maximo_historico;
    var minimo_historico;
    var ultimo_valor;
    var penultimo_valor;
    var var_porcentual;
    var prices = updates.filter(update => update.ticker === elem.ticker);
    var valores_totales = prices.map(function(p){ return p.value } );
    if(valores_totales.length != 0)
    {
      maximo_historico = max(valores_totales);
      minimo_historico = min(valores_totales);
      ultimo_valor = valores_totales[valores_totales.length - 1];
      if(valores_totales.length > 1)
      {
        penultimo_valor = valores_totales[valores_totales.length - 2];
        var_porcentual = ultimo_valor/penultimo_valor*100;
      }
    }
    //console.log(elem.ticker);
    graphs.push(<div id={elem.ticker}>
    <h2>Empresa: {elem.ticker}</h2>
    <h3>Moneda: {elem.quote_base}</h3>
    <p>Valor máximo: {maximo_historico}</p>
    <p>Valor mínimo: {minimo_historico}</p>
    <p>Último precio: {ultimo_valor}</p>
    <p>Variación porcentual: {var_porcentual}%</p>

    <LineChart
      width={500}
      height={300}
      data={prices}
      margin={{
        top: 5, right: 30, left: 20, bottom: 5,
      }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="time" />
      <YAxis label={elem.quote_base}/>
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="value" label="Valor acción" stroke="#82ca9d" />
    </LineChart>
    </div>);
  };
  return(
    <div>
      <h1>Precio acciones</h1>
      {graphs}
    </div>
  );
};

ReactDOM.render(<Stocks />, document.getElementById('root'));



// function tick() {
//   const element = (
//     <div style={{ display: 'flex', maxWidth: 900 }}>
//   <Chart
//     width={400}
//     height={300}
//     chartType="ColumnChart"
//     loader={<div>Loading Chart</div>}
//     data={[
//       ['City', '2010 Population', '2000 Population'],
//       ['New York City, NY', 8175000, 8008000],
//       ['Los Angeles, CA', 3792000, 3694000],
//       ['Chicago, IL', 2695000, 2896000],
//       ['Houston, TX', 2099000, 1953000],
//       ['Philadelphia, PA', 1526000, 1517000],
//     ]}
//     options={{
//       title: 'Population of Largest U.S. Cities',
//       chartArea: { width: '30%' },
//       hAxis: {
//         title: 'Total Population',
//         minValue: 0,
//       },
//       vAxis: {
//         title: 'City',
//       },
//     }}
//     legendToggle
//   />
//   <Chart
//     width={400}
//     height={'300px'}
//     chartType="AreaChart"
//     loader={<div>Loading Chart</div>}
//     data={[
//       ['Year', 'Sales', 'Expenses'],
//       ['2013', 1000, 400],
//       ['2014', 1170, 460],
//       ['2015', 660, 1120],
//       ['2016', 1030, 540],
//     ]}
//     options={{
//       title: 'Company Performance',
//       hAxis: { title: 'Year', titleTextStyle: { color: '#333' } },
//       vAxis: { minValue: 0 },
//       // For the legend to fit, we make the chart area smaller
//       chartArea: { width: '50%', height: '70%' },
//       // lineWidth: 25
//     }}
//   />
// </div>
//   );
//   ReactDOM.render(element, document.getElementById('root'));
// }
//
// setInterval(tick, 1000);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
