import React, { Component } from 'react';
import './styles/app.css';
import Axios from 'axios';
import fetchJsonp from 'fetch-jsonp';
import { withScriptjs, withGoogleMap, GoogleMap, Marker } from "react-google-maps";

class App extends Component {

  constructor(props){    
    super(props)
    this.state = {
      map: false,
      cepValido: 'vazio',
      lat: 0,
      lng:0,
      logradouro: '',
      bairro: '',
      localidade: '',
      uf: '',
      cep: '',
      mensagem: ''
    }
    this.getCords = this.getCords.bind(this)
    this.getAdress = this.getAdress.bind(this)
    this.gravaCep = this.gravaCep.bind(this)
    this.closeMap = this.closeMap.bind(this)
  }

  gravaCep = (e) => {
    let elem = e.target;
    let mask = `#####-###`;

    let i = elem.value.length;
    let saida = mask.substring(1,0)
    var texto = mask.substring(i)
    if (texto.substring(0,1) !== saida){
      elem.value += texto.substring(0,1);
    }
  }

  closeMap = () => {
    this.setState({
      map: false,
      cepValido: '',
      lat: 0,
      lng:0,
      logradouro: '',
      bairro: '',
      localidade: '',
      uf: '',
      cep: '',
      mensagem: ''
    })
  }

  getAdress = (cep) => {
    let cepNum = cep.replace(/\D/g, '')
    
    if(cepNum.length === 8){
      const self = this;
      fetchJsonp(`https://viacep.com.br/ws/${cep}/json/?callback=myfn`)
      .then(function(response) {
        return response.json()
      })
      .then(function(json) {
        if(json.erro){
          self.setState({
            cepValido: false,
            mensagem: 'CEP inválido'
          })
        }else{
          self.setState({
            logradouro: json.logradouro,
            bairro: json.bairro,
            localidade: json.localidade,
            uf: json.uf,
            cep: json.cep,
            cepValido: true,
            mensagem: ''
          })
          self.getCords(`${json.logradouro} ${json.bairro} ${json.localidade} ${json.uf}`)
        }
      })
      .catch(function(ex) {
        self.setState({
          cepValido: false,
          mensagem: 'CEP inválido'
        })
        console.log('parsing failed', ex)
      })
    }else{
      this.setState({
        cepValido: false,
        mensagem: 'CEP inválido'
      })
    }
  }

  getCords = (endereco) => {
    Axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${endereco}&key=AIzaSyCdYbpZuHGOWwYlvCxxywFZ-chTAi3MmeU`)
    .then(
      resp => {
        this.setState({
            ...this.state, 
            lat: resp.data.results[0].geometry.location.lat,
            lng: resp.data.results[0].geometry.location.lng,
            map: true
        })
      },
    )
    .catch(function (error) {
      console.log(error);
    });
  }

  render() {

    const MyMapComponent = withScriptjs(withGoogleMap((props) =>
      <GoogleMap
        defaultZoom={16}
        defaultCenter={{ lat: this.state.lat, lng: this.state.lng }}
      >
        {props.isMarkerShown && <Marker position={{ lat: this.state.lat, lng: this.state.lng }} />}
      </GoogleMap>
    ))

    return (
      <div>
        <h1>Consulta de Endereço</h1>
        <form>
          <h2>Consultar</h2>
          <div>
            <label>CEP</label>
            <input type="tel" id="cep" onKeyPress={this.gravaCep} maxLength="9"/>
            <button type="button" onClick={()=>{this.getAdress(document.getElementById("cep").value)}}>buscar</button>
          </div>
        </form>
        
        {this.state.cepValido === true ? 
          (
            <div className="box-mapa">
              <div className="close" onClick={this.closeMap}>×</div>
              <div className="dados-cep">
                <div className="logradouro">{this.state.logradouro}</div>
                <div>{this.state.bairro}</div>
                <div>{this.state.localidade} - {this.state.uf}</div>
                <div>{this.state.cep}</div>
              </div>
              <MyMapComponent
                isMarkerShown
                googleMapURL="https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places"
                loadingElement={<div style={{ height: `100%` }} />}
                containerElement={<div style={{ height: `300px` }} />}
                mapElement={<div style={{ height: `100%` }} />}
              />
            </div>
          )
          :
          (
            <div className={(this.state.mensagem !== '' ? 'msn-error': '')}>{this.state.mensagem}</div>
          )
        }
      </div>
    )
  }
}

export default App