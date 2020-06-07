import React, {useEffect, useState, ChangeEvent, FormEvent} from 'react';
import { FiArrowLeft} from 'react-icons/fi'
import {Link, useHistory} from 'react-router-dom'
import {Map, TileLayer, Marker} from 'react-leaflet'
import { LeafletMouseEvent} from 'leaflet';
import api from '../../services/api'
import axios from 'axios'
import Dropzone from '../../components/DropZone'

import logo from '../../assets/logo.svg';

import './styles.css'

// State for array or objet - manual type check
interface Item{
    id: number,
    name: string,
    image_url: string
}

interface IBGEUFResponse{
    sigla: string
}

interface IBGECityResponse{
    nome: string
}

const CreatePoint = () => {
    const history = useHistory();

    const [items,setItems] = useState<Item[]>([]);
    const [ufs,setUfs] = useState<string[]>([]);
    const [cities,setCities] = useState<string[]>([]);

    const [initPosition,setinitPosition] = useState<[number, number]>([0,0]);

    const [formData,setFormData] = useState({
        name: '',
        email: '',
        whatsapp: ''
    });

    const [selectedUf,setSelectedUf] = useState<string>();
    const [selectedCity,setSelectedCity] = useState<string>();
    const [selectedPosition,setSelectedPosition] = useState<[number, number]>([0,0]);
    const [selectedItems,setSelectedItems] = useState<number[]>([]);
    const [selecteFile, setSelecteFile] = useState<File>();

    // Trigger once []
    useEffect(() => {
        api.get('items').then( response => {
            setItems(response.data);
        })
    } , []);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition( position => {
            const {latitude, longitude} = position.coords;

            setinitPosition([latitude, longitude])
        });
    } , []);

    useEffect(() => {
        axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then( response => {
            const ufInitials = response.data.map( uf => uf.sigla);
            setUfs(ufInitials);
        })
    }, []);
    // Always change when uf changes - load uf cities
    useEffect(() => {
        if( selectedUf !== '0') {
            axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then( response => {
                const cityNames = response.data.map( city => city.nome);
                setCities(cityNames);
            })
        }
    }, [selectedUf]);

    function handlerSelectUf(event: ChangeEvent<HTMLSelectElement>){
        const uf = event.target.value;
        setSelectedUf(uf);
    }

    function handlerSelectCity(event: ChangeEvent<HTMLSelectElement>){
        const city = event.target.value;
        setSelectedCity(city);
    }

    function handelerMapClick(event: LeafletMouseEvent){
       setSelectedPosition ([
        event.latlng.lat,
        event.latlng.lng
       ]);
    }
    
    function handelerInputChange(event: ChangeEvent<HTMLInputElement>){
        const {name, value} = event.target;
        setFormData({...formData, [name]: value})
    }

    function handelerSelectItem(id: number){
        const alreadySelected = selectedItems.findIndex(item => item === id);
        if(alreadySelected >= 0){
            const filteredItems = selectedItems.filter(item => item !== id);
            setSelectedItems(filteredItems);
        } else {
            setSelectedItems([ ...selectedItems, id]);
        }
    }
    
    async function handlerSumit(event: FormEvent){
        event.preventDefault();

        const {name, email, whatsapp} = formData;
        const uf = selectedUf;
        const city = selectedCity;
        const [latitude, longitude] = selectedPosition;
        const items = selectedItems;

        const data = new FormData();
        data.append('name', name);
        data.append('email', email);
        data.append('whatsapp', whatsapp);
        data.append('uf', String(uf));
        data.append('city', String(city));
        data.append('latitude', String(latitude));
        data.append('longitude', String(longitude));
        data.append('items', items.join(','));
        
        if(selecteFile){
            data.append('image', selecteFile);
        }
        
        await api.post('points', data);

        alert('Ponto de coleta criado!')

        history.push('/');
    }

    return( 
        <div id="page-create-point">
        <header>
          <img src={logo} alt="Ecoleta"/>

          <Link to="/">
              <FiArrowLeft />
                Voltar para a home
          </Link>
         </header>

          <form onSubmit={handlerSumit}>
            <h1>Cadastro do <br /> ponto de coleta</h1>
            <Dropzone onFileUploaded={setSelecteFile}/>

            <fieldset>
                <legend>
                    <h2>Dados</h2>
                </legend>

                <div className="field">
                    <label htmlFor="name">Nome da entidade</label>
                    <input type="text" name="name" id="name" onChange={handelerInputChange}/>
                </div>

                <div className="field-group">
                    <div className="field">
                        <label htmlFor="email">E-mail</label>
                        <input type="email" name="email" id="email" onChange={handelerInputChange}/>
                    </div>
                <div className="field">
                    <label htmlFor="whatsapp">Whatsapp</label>
                    <input type="text" name="whatsapp" id="whatsapp" onChange={handelerInputChange}/>
                </div>
                </div>
            </fieldset>

            <fieldset>
                <legend>
                    <h2>Endereço</h2>
                    <span>Seleciona o endereço no mapa</span>      
                </legend>

                <Map center={initPosition} zoom={15} onClick={handelerMapClick}>
                    <TileLayer
                        attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={selectedPosition}/>
                </Map>

                <div className="field-group">
                    <div className="field">
                        <label htmlFor="uf">Estado (UF)</label>
                        <select name="uf" id="uf" value={selectedUf} onChange={handlerSelectUf}>
                            <option value="0">Selecione um UF</option>
                            {ufs.map( uf => (
                                <option key={uf} value={uf}>{uf}</option>
                            ))}
                        </select>
                    </div>

                    <div className="field">
                        <label htmlFor="city">Cidade</label>
                        <select name="city" id="city" value={selectedCity} onChange={handlerSelectCity} >
                            <option value="0">Selecione uma Cidade</option>
                            { cities.map( city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </fieldset>

            <fieldset>
                <legend>
                    <h2>Ítems da coleta</h2>
                    <span>Selecione um ou mais items</span>
                </legend>

                <ul className="items-grid">
                    {items.map(item => (
                        <li key={item.id} onClick={() => handelerSelectItem(item.id)} className={selectedItems.includes(item.id) ? 'selected': ''}>
                            <img src={item.image_url} alt={item.name}/>
                            <span>{item.name}</span>
                        </li>
                    ))};
                </ul>
            </fieldset>

            <button type="submit">Adicionar ponto de coleta</button>
          </form>
    </div>
    );
};

export default CreatePoint;
