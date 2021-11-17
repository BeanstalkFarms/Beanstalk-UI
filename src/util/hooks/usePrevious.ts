import React from 'react';

const usePrevious = (value) => {
    const ref = React.useRef<any>();
    React.useEffect(() => {
        ref.current = value;
    }, [value]);
    return ref.current;
};

export default usePrevious;
