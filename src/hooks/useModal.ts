import { useState } from "react";

const useModal = <T extends unknown>() => {
  const [data, setData] = useState<T | null>(null);
  const [open, setOpen] = useState(false);

  const openModal = (record: T | undefined) => {
    setOpen(true);
    setData(record ?? null);
  };

  const closeModal = () => {
    setOpen(false);
    setData(null);
  };

  return { open, data, setData, openModal, closeModal };
};

export default useModal;
