const objectMap = (obj, fn) => {
    return Object.fromEntries(
        Object.entries(obj).map(
            ([k, v], i) => [k, fn(v, k, i)]
        )
    )
}

const objectMapToArray = (obj, fn) => {
    return Object.entries(obj).map(
        ([k, v], i) => fn(v, k, i)
    )
}

export {objectMap, objectMapToArray}