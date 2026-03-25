import type { FC, ReactNode } from "react";

interface FormProps {
  onSubmit: (event: SubmitEvent) => void;
  children: ReactNode;
  className?: string;
}

const Form: FC<FormProps> = ({ onSubmit, children, className }) => {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(event.nativeEvent as SubmitEvent);
      }}
      className={` ${className}`}
    >
      {children}
    </form>
  );
};

export default Form;
