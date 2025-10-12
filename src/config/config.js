//export const urlbase = "http://10.20.10.86:3000/api"; 
export const urlbase = "http://localhost:3000/api"//"http://10.20.10.86:4000/api"//"http://192.168.10.250:3000/api"; 
//export const urlbase = "/api"; 
export const urlFirma = "https://localhost:9000/api";

export const onlyHeader = function () {
    try {
        const headers = {
            "Access-Control-Allow-Origin": "*",
            'Accept': 'application/json', 
            "Content-Type": "application/json",  
            "Referrer-Policy": "no-referrer, strict-origin-when-cross-origin"      
        }
        return headers
    } catch (error) {
        localStorage.removeItem("token")
        //window.location.replace("/")
    }

}

export const getHeader = function () {
    try {
        const auth = JSON.parse(atob(localStorage.getItem("token")));

        const headers = {
            'Accept': 'application/json',
            'Authorization': 'bearer ' + auth.access_token
        }
        return headers
    } catch (error) {
        localStorage.removeItem("token")
        //window.location.replace("/")
    }

}

//Para envio de archivos imagenes al servidor

export const getHeaderFile = function () {
    try {
        const auth = JSON.parse(atob(localStorage.getItem("token")));

        const headers = {
            'Content-Type': 'multipart/form-data',
            'Authorization': 'bearer ' + auth.access_token
        }
        return headers
    } catch (error) {
        localStorage.removeItem("token")
        //window.location.replace("/")
    }

}