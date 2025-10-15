import { http, httpFile } from "../api";

export const getGProcesses = async (param) => {
    const res = await http().get(`/galaxia/guprocesses/${param}`)
    return res.data
}

export const createGInstance = async (data) => {
    const res = await http().post('/galaxia/guinstances', data)
    return res.data
}

export const getListGInstances = async (params) => {
    console.log("\n\n................SERVICES/galaxia/guinstances::", params)
    const res = await http().get(`/galaxia/guinstances`, {params} )
    return res.data
}

export const getDetailGInstance = async (param) => {
    const res = await http().get(`/galaxia/guinstances/${param}`)
    return res.data
}

export const updateGInstance = async (param, data) => {
    const res = await http().put(`/galaxia/guinstances/${param}`,data)
    return res.data
}