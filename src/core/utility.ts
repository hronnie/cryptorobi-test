export function toFixed(num: number, fixed: number) {
    const power = Math.pow(10, fixed || 0);
    const converted =  Math.floor(num * power) / power;
    return converted.toString();
};
