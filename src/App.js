import React, { Component } from 'react';
import './App.css';
import request from 'superagent';


class App extends Component {
  constructor(){
    super();

    this.state = {
      checked: false,
      show: false,
      city: {},
      day: {},
      country: '',
      date: '',
      temperature: '',
      pressure: '',
      wind: '',
      week: [],
      cities: [{
        id: 1,
        name: 'France'
      },{
        id:2,
        name: 'Canada'
      }]
    }
  }

  checkBtn = (e) => {
    e.preventDefault();
    this.setState({
      checked: true
    })
  }

  updateInput = (e) => {
    e.preventDefault();
    let value = this.refs.inputLocation.value;
    if (value !== '') {
      let newState = this.state;
      newState.city = {id: this.state.cities.length + 1, name: value.replace(value[0], value[0].toUpperCase())};
      this.setState(newState);
      newState.cities.push(newState.city);
      newState.checked = false;
      this.setState(newState);
    }
  }

  getDayOfWeek = (dayOfWeek) => {
    let weekday=new Array(7);
    weekday[0]="Sunday";
    weekday[1]="Monday";
    weekday[2]="Tuesday";
    weekday[3]="Wednesday";
    weekday[4]="Thursday";
    weekday[5]="Friday";
    weekday[6]="Saturday";

    return weekday[dayOfWeek.getDay()].slice(0, 3);
  }

  checkIcon = (icon) => {
    if ( icon === 'partly-cloudy-day') {
      return 'cloudy';
    } else if ( icon === 'clear-day') {
      return 'sunny';
    } else if ( icon === 'partly-cloudy-night') {
      return 'sunny';
    } else {
      return icon;
    }
  }

  weather = (location) => {
     const API_URL = `https://api.darksky.net/forecast/7b99d5e089197748e933189d8174655f/${location.lat},${location.lng}`;

     request
        .get(API_URL)
        .then(response => { 
          let dailyWeather = response.body.daily.data;
          this.setState({
            week: []
          })
          dailyWeather.forEach(day => {
            let dayOfWeek = new Date(day.time * 1000);
            this.setState({
              week: [ 
                ...this.state.week,
                {
                  day: this.getDayOfWeek(dayOfWeek), 
                  icon: this.checkIcon(day.icon), 
                  pressure: day.pressure, 
                  temperature: day.temperatureMin, 
                  wind: day.windSpeed
                }
              ], 
            });

          })
        });
  }  
  
  getWeather = (e) => {
    e.preventDefault();
    let country = e.target.innerText;
    const API_URL = `https://maps.googleapis.com/maps/api/geocode/json?address=${country}`;

    request
      .get(API_URL)
      .then(response => {
        let location = response.body.results[0].geometry.location;
        return location;
      })
      .then(this.weather)
      .catch(error => {
        this.setState({
          country: 'N/A',
          show: false
        });
      });
    this.setState({
      show: true,
      country: country
    });
   }


  render() {
    let cities = this.state.cities;
    let week = this.state.week;
    return (
      <div className='app'>
        <header className='app__header'>
          <button className='app__add' onClick={ this.checkBtn }>
            <i className="fa fa-plus-circle"></i>
            New city
          </button>
        </header>
        <div className='grid'>
          <aside className='app__aside'>
            <h1 className='app__title'>All countries</h1>
            {cities.map((city, i) => {  
              return <a key={ i } href='#' onClick={ this.getWeather } className='app__country'>{ city.name }</a>
            })}
            { this.state.checked &&
              <form onSubmit={ this.updateInput }> 
                <input autoFocus type='text' ref="inputLocation" placeholder='Location' className='app__input' />
              </form>
            }
          </aside>
          <section className='app__view'>
               <p className='app__view__title'>{ this.state.country } Daily Weather</p>
               { this.state.show &&
                 <div className="app__view__daily">
                  {week.map((day, i) => { 
                      return   <div key={ i } className='app__view__data'>
                                  <h5>{ day.day }</h5>
                                  <i className={`wi wi-day-${day.icon}`}></i>
                                  <ul>
                                    <li className="span-data">Temp. <strong>{ day.temperature }</strong> </li>
                                    <li className="span-data">Pres. <strong>{ day.pressure }</strong> </li>
                                    <li className="span-data">Wind: <strong>{ day.wind }</strong> </li>
                                  </ul>
                               </div>
                  })}
                 </div>
               }
          </section>
  
        </div>
      </div>
    );
  }
}

export default App;
