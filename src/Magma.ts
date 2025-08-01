/* 
Tは台集合にあたる型
*/

abstract class Magma<T> {
    abstract plus(arg1: T, arg2: T): T;
}

abstract class Monoid<T> extends Magma<T> {
    abstract get plusId(): T;
    isPlusId(arg: T): boolean {
        return arg === this.plusId;
    }
}

abstract class Group<T> extends Monoid<T> {
    abstract plusInv(arg: T): T;
    minus(arg1: T, arg2: T): T {
        return this.plus(arg1, this.plusInv(arg2));
    }
}

abstract class Ring<T> extends Group<T> {
    abstract get multiplyId(): T;
    isMultiplyId(arg: T): boolean {
        return arg === this.multiplyId;
    }
    abstract multiply(arg1: T, arg2: T): T;
}

abstract class Field<T> extends Ring<T> {
    abstract mulInv(arg: T): T;
    divide(arg1: T, arg2: T): T {
        if (this.isPlusId(arg2)) {
            throw new Error("加法単位元の乗法逆元は存在しません");
        }
        return this.multiply(arg1, this.mulInv(arg2));
    }
}

class IntegerQuotientRing extends Ring<number> {
    characteristic: number;
    constructor(characteristic: number) {
        super();
        if (!Number.isSafeInteger(characteristic) || characteristic <= 0) {
            throw new Error("標数には正の整数を入力してください");
        }
        this.characteristic = characteristic;
    }
    get multiplyId(): number {
        return 1;
    }
    multiply(arg1: number, arg2: number): number {
        return this.getRepresentative(arg1 * arg2);
    }
    plusInv(arg: number): number {
        return this.getRepresentative(-arg);
    }
    get plusId(): number {
        return 0;
    }
    plus(arg1: number, arg2: number): number {
        return this.getRepresentative(arg1 + arg2);
    }
    getRepresentative(arg: number): number {
        return ((arg % this.characteristic) + this.characteristic) % this.characteristic;
    }
}
