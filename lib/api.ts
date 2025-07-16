import ky from 'ky';

const api = ky.create({
    prefixUrl:'/api'
})

export {api}