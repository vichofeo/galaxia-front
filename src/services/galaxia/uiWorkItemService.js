import { http, httpFile } from "../api";

export const getListWorkItems = async (params) => {
    const res = await http().get(`/galaxia/ui/workitems`, {params})
    return res.data
}

export const getDetailWorkItem = async (param) => {
    const res = await http().get(`/galaxia/ui/workitem/${param}`)
    return res.data
}

export const saveCompleteWorkItem = async (param,data) => {
    const res = await http().post(`/galaxia/ui/workitem/${param}/complete`,data)
    return res.data
}