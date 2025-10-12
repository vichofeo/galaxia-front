import axios from 'axios'
import {
    urlbase, urlFirma,
    getHeader,
    getHeaderFile, onlyHeader
} from './../config/config'


export function http() {
    return axios.create({
        baseURL: urlbase,
        headers: getHeader()
    })
}


export function httpFile() {
    return axios.create({
        baseURL: urlbase,
        headers: getHeaderFile()
    })
}

export function frttp() {
    return axios.create({
        baseURL: urlFirma,
        //headers: onlyHeader()
    })
}

//**************************************************** */
export function bdpa() {
    return axios.create({
        baseURL: 'https://bdpa.asuss.gob.bo/api/v1',
        headers: onlyHeader()
    })
}