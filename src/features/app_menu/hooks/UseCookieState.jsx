import Cookies from 'js-cookie'
import { useEffect, useState } from "react"

export const useCookieState = (key, initialValue) => {
    const cookie = Cookies.withConverter({
        read: (value, name) => {return JSON.parse(value)},
        write: (value, name) => {return JSON.stringify(value)}
    })
    const [enabled, setEnabled] = useState(Boolean(cookie.get(key)))

    const getCookieValue = ({
        key,
        defaultValue,
    }) => {
        const value = cookie.get(key)
        return value ?? defaultValue
    }

    const getInitialValue = () => {
        if (typeof window === "undefined") return initialValue;

        return getCookieValue({
            key,
            defaultValue: initialValue,
        })
    }
    const [value, setValue] = useState(getInitialValue())

    const setNextValue = (value) => {
        setValue(value)
        if (enabled) {cookie.set(key, value)}
    }

    useEffect(() => {
        console.log("cookie enable", enabled)
        if (enabled) {
            cookie.set(key, value);
        } else {
            cookie.remove(key);
        }
    }, [enabled])

    return [value, setNextValue, setEnabled]
}