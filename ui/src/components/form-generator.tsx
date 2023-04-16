import React, { useState } from "react";

export type InputType = {
  label: string;
  type: "text" | "number" | "email"; // You can extend this with other input types
  value: string | number;
};

type Props = {
  inputs: InputType[];
};

export const FormGenerator: React.FC<Props> = ({ inputs }) => {
  const [formValues, setFormValues] = useState<InputType[]>(inputs);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const { name, value } = event.target;
    setFormValues((prevFormValues) => {
      const updatedFormValues = [...prevFormValues];
      updatedFormValues[index] = {
        ...prevFormValues[index],
        value: value // Update the value property
      };
      return updatedFormValues;
    });
  };

  const renderInputs = () => {
    return formValues.map((input, index) => {
      return (
        <div key={index} className="form-control w-full max-w-xs mb-4">
          <label htmlFor={input.label} className="label">{input.label}</label>
          <input
            type={input.type}
            id={input.label}
            name={input.label}
            value={input.value}
            onChange={(event) => handleChange(event, index)}
            className="input input-bordered w-full max-w-xs"
          />
        </div>
      );
    });
  };

  return <form className="max-w-md mx-auto">{renderInputs()}</form>;
};