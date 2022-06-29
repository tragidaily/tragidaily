class StaticField {
  /*static*/ value = 42;

  getValue() {
    // return value; // NOTE: just `value` or `this.value`?
    // return this.value; // NOTE: Nether `value` or `this.value` works
    return StaticField.value; // ANSWER: Is `StaticField.value`
  }
}

console.log(new StaticField().getValue())
