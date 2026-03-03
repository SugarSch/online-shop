import React from "react";
import { InputGroup, FormControl, Button } from "react-bootstrap";

function NumericInput({ number, onPlus, onMinus }) {

  return (
    <InputGroup className="w-50">
      <Button variant="outline-secondary" onClick={onMinus}>-</Button>
      <FormControl
        type="number"
        value={number}
        className="text-center"
      />
      <Button variant="outline-secondary" onClick={onPlus}>+</Button>
    </InputGroup>
  );
}

export default NumericInput;