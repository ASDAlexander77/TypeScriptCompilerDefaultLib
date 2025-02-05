const LC_COLLATE = 1;

export class Error {
    public constructor(public message?: string, public filename?: string, public line?: int) {
    }
}

export class RangeError extends Error {
    public constructor(message?: string, filename?: string, line?: int) {
        super(message, filename, line);
    }
}

export namespace PrimeHelpers
{
    export const hashPrime = 101;

    export const hashCollisionThreshold = 100;

    const maxPrimeArrayLength = 0x7FFFFFC3;

    const primes = [
        3, 7, 11, 17, 23, 29, 37, 47, 59, 71, 89, 107, 131, 163, 197, 239, 293, 353, 431, 521, 631, 761, 919,
        1103, 1327, 1597, 1931, 2333, 2801, 3371, 4049, 4861, 5839, 7013, 8419, 10103, 12143, 14591,
        17519, 21023, 25229, 30293, 36353, 43627, 52361, 62851, 75431, 90523, 108631, 130363, 156437,
        187751, 225307, 270371, 324449, 389357, 467237, 560689, 672827, 807403, 968897, 1162687, 1395263,
        1674319, 2009191, 2411033, 2893249, 3471899, 4166287, 4999559, 5999471, 7199369
    ];

    function isPrime(candidate: int)
    {
        if ((candidate & 1) != 0)
        {
            const limit = <int>sqrt(candidate);
            for (let divisor = 3; divisor <= limit; divisor += 2)
            {
                if ((candidate % divisor) == 0)
                    return false;
            }

            return true;
        }

        return candidate == 2;
    }

    function getPrime(min = 1) {
        for (const prime of primes)
        {
            if (prime >= min)
                return prime;
        }

        // Outside of our predefined table. Compute the hard way.
        const maxInt = 2 ** 32 - 1;
        for (let i = min; i < maxInt; i += 2)
        {
            if (isPrime(i) && ((i - 1) % hashPrime != 0))
                return i;
        }

        return min;
    }

    // Returns size of hashtable to grow to.
    export function expandPrime(oldSize: int): int 
    {
        const newSize = 2 * oldSize;

        // Allow the hashtables to grow to maximum possible size (~2G elements) before encountering capacity overflow.
        // Note that this check works even when _items.Length overflowed thanks to the (uint) cast
        if (<uint>newSize > maxPrimeArrayLength && maxPrimeArrayLength > oldSize)
        {
            return maxPrimeArrayLength;
        }

        return getPrime(newSize);
    }    
}

export namespace HashHelpers
{
    export function hashCodeBinary(key: Opaque, size: index): int {
        let hashValue = 0;
        let power = 1;
        const mod = 10 ** 9 + 7;

        const value4BytesRef: Reference<i32> = key;
        const count4 = size >> 2;
        for (let offset = 0; offset < count4; offset ++) {
            const int32 = LoadReference(value4BytesRef[offset]);
            hashValue = (hashValue + int32 * power) % mod;
            power = (power * PrimeHelpers.hashPrime) % mod
        }        

        const start4 = count4 << 2;
        const valueByteRef: Reference<byte> = key;
        for (let offset = start4; offset < size; offset ++) {
            const byte = LoadReference(valueByteRef[offset]);
            hashValue = (hashValue + byte * power) % mod;
            power = (power * PrimeHelpers.hashPrime) % mod
        }

        return hashValue;        
    }

    export function hashCodeString(key: string): int {
        return hashCodeBinary(ReferenceOf(key[0]), key.length);
    }

    export function hashCodeAny(key: any): int {
        let keyLocal = key;
        const anyPtr = LoadReference(<Reference<Opaque>> ReferenceOf(keyLocal));
        let anyStruct: Reference<[size: index, type: string, data: byte]> = anyPtr;
        return hashCodeBinary(ReferenceOf(anyStruct.data), anyStruct.size);
    }
}
