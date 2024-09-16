import { Icon } from "@iconify/react/dist/iconify.js";
import { Button } from "./button";
import { Input } from "./input";
import { useContext, useRef, useState } from "react";
import { FileContext } from "../context/FileContext/FileContext";
import { axiosInstance } from "@/lib/axios";

export const StartScreen = () => {
  const { setFile: setFileContext } = useContext(FileContext); //состояние загружаемоего файла

  const [fileUrl, setFileUrl] = useState<string>(""); //состояние урл-файла

  const inputFileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async () => {
    if (inputFileRef.current?.files?.[0]) {
      setFileContext?.(inputFileRef.current.files[0]);
      return;
    }
  };
  const dowloadUrl = async () => {
    if (fileUrl) {
      await axiosInstance({
        method: "GET",
        url: fileUrl,
      }).then((res): void => {
        if (/image\/*/gi.test(res.headers["content-type"])) {
          const file = new File([res.data], "name", {
            type: res.headers["content-type"],
          });
          setFileContext?.(file);
        }
      });
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center flex-col gap-4">
      <div>
        <input
          ref={inputFileRef}
          type="file"
          className="absolute w-0 h-0 opacity-0 -z-50"
          accept="image/*"
          onChange={handleFileUpload}
        />
        <Icon
          icon="uil:image-upload"
          className="cursor-pointer"
          width={40}
          onClick={() => inputFileRef.current?.click()}
        />
      </div>
      <div className="h-[1px] w-20 bg-gray-700" />
      <div className="flex w-full max-w-sm items-center space-x-2">
        <Input
          type="text"
          placeholder="URL"
          value={fileUrl}
          onChange={({ target: { value } }) => setFileUrl(value)}
        />
        <Button type="submit" onClick={dowloadUrl}>
          Загрузить
        </Button>
      </div>
    </div>
  );
};
