export const toPodiumShape = (src) => ({
    1: src[1] ? { name: src[1].name, code: src[1].code } : null,
    2: src[2] ? { name: src[2].name, code: src[2].code } : null,
    3: src[3] ? { name: src[3].name, code: src[3].code } : null,
});

export const clear = (setPicks) => setPicks({1: null, 2: null, 3: null,});