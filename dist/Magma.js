"use strict";
/*
Tは台集合にあたる型
*/
class Magma {
}
class Monoid extends Magma {
    isPlusId(arg) {
        return arg === this.plusId;
    }
}
class Group extends Monoid {
    minus(arg1, arg2) {
        return this.plus(arg1, this.plusInv(arg2));
    }
}
class Ring extends Group {
    isMultiplyId(arg) {
        return arg === this.multiplyId;
    }
}
class Field extends Ring {
    divide(arg1, arg2) {
        if (this.isPlusId(arg2)) {
            throw new Error("加法単位元の乗法逆元は存在しません");
        }
        return this.multiply(arg1, this.mulInv(arg2));
    }
}
class IntegerQuotientRing extends Ring {
    characteristic;
    constructor(characteristic) {
        super();
        if (!Number.isSafeInteger(characteristic) || characteristic <= 0) {
            throw new Error("標数には正の整数を入力してください");
        }
        this.characteristic = characteristic;
    }
    get multiplyId() {
        return 1;
    }
    multiply(arg1, arg2) {
        return this.getRepresentative(arg1 * arg2);
    }
    plusInv(arg) {
        return this.getRepresentative(-arg);
    }
    get plusId() {
        return 0;
    }
    plus(arg1, arg2) {
        return this.getRepresentative(arg1 + arg2);
    }
    getRepresentative(arg) {
        return ((arg % this.characteristic) + this.characteristic) % this.characteristic;
    }
}
