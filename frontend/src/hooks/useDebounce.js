import { useState, useEffect } from 'react';

// A custom hook to debounce a value.
// It delays updating the output value until the input value has stopped changing for a specified time.
export const useDebounce = (value, delay) => {
    // State to hold the debounced value
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        // Set up a timer that will update the debounced value after the specified delay
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // This is the cleanup function.
        // It clears the timer every time the input `value` or `delay` changes.
        // This ensures the state is only updated after the user stops typing.
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]); // Only re-run the effect if value or delay changes

    return debouncedValue;
};